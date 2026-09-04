import "server-only";

import type { CurrentBlundrUser } from "@/lib/blundr/accounts/accountTypes";
import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";
import {
  PRO_TRIAL_DAYS,
  priceForBillingPlan,
  type BillingConfig,
  type BillingPlan,
} from "./billingConfig";
import { createSupabaseBillingRepository } from "./billingRepository.server";

export const PAID_OFFER_VERSION = "paid-offer-v1";
export const PAID_OFFER_LEGAL_VERSION = "subscription-terms-20260904";

export type PaidOffer = {
  id: string;
  offerVersion: typeof PAID_OFFER_VERSION;
  legalVersion: typeof PAID_OFFER_LEGAL_VERSION;
  plan: BillingPlan;
  priceCents: number;
  currency: "usd";
  interval: "month" | "year";
  trialEligible: boolean;
  trialDays: number;
  disclosedConversionAt: string;
  cancelBeforeAt: string | null;
  expiresAt: string;
  disclosure: string;
  acknowledgement: string;
};

function addDays(date: Date, days: number): Date {
  return new Date(date.valueOf() + days * 86_400_000);
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.valueOf() + minutes * 60_000);
}

function price(plan: BillingPlan) {
  return plan === "monthly"
    ? {
        cents: 999,
        interval: "month" as const,
        label: "$9.99/month",
      }
    : {
        cents: 6999,
        interval: "year" as const,
        label: "$69.99/year",
      };
}

export async function createPaidOffer(input: {
  user: CurrentBlundrUser | null;
  plan: unknown;
  config: BillingConfig;
  now?: Date;
}): Promise<
  | { ok: true; offer: PaidOffer }
  | { ok: false; status: number; error: string }
> {
  if (!input.user?.isAuthenticated || !input.user.accessToken) {
    return { ok: false, status: 401, error: "authentication_required" };
  }
  const plan = priceForBillingPlan(input.config, input.plan);
  if (!plan.ok) return { ok: false, status: 400, error: "invalid_billing_plan" };
  const repository = createSupabaseBillingRepository();
  const trial = await repository.reserveTrial({
    userId: input.user.userId,
    environment: input.config.environment,
  });
  const now = input.now ?? new Date();
  const priced = price(plan.plan);
  const conversionAt = trial.eligible ? addDays(now, PRO_TRIAL_DAYS) : now;
  const expiresAt = addMinutes(now, 30);
  const admin = createBlundrSupabaseAdminClient();
  if (!admin) return { ok: false, status: 503, error: "billing_offer_unavailable" };
  const inserted = await admin
    .from("blundr_paid_offer_acceptances")
    .insert({
      user_id: input.user.userId,
      billing_environment: input.config.environment,
      offer_version: PAID_OFFER_VERSION,
      legal_version: PAID_OFFER_LEGAL_VERSION,
      selected_plan: plan.plan,
      displayed_price_cents: priced.cents,
      displayed_currency: "usd",
      displayed_interval: priced.interval,
      trial_eligible: trial.eligible,
      trial_reservation_id: trial.reservationId,
      disclosed_conversion_at: conversionAt.toISOString(),
      cancel_before_at: trial.eligible ? conversionAt.toISOString() : null,
      displayed_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .select("id")
    .single();
  if (inserted.error || !inserted.data) {
    return { ok: false, status: 503, error: "billing_offer_unavailable" };
  }
  const common =
    "plus applicable taxes. Renews automatically until canceled.";
  const disclosure = trial.eligible
    ? `7 days free, then ${priced.label} ${common} Cancel before ${conversionAt.toISOString()} to avoid the first subscription charge.`
    : `${priced.label} ${common} Billing begins ${conversionAt.toISOString()}.`;
  return {
    ok: true,
    offer: {
      id: String(inserted.data.id),
      offerVersion: PAID_OFFER_VERSION,
      legalVersion: PAID_OFFER_LEGAL_VERSION,
      plan: plan.plan,
      priceCents: priced.cents,
      currency: "usd",
      interval: priced.interval,
      trialEligible: trial.eligible,
      trialDays: trial.eligible ? PRO_TRIAL_DAYS : 0,
      disclosedConversionAt: conversionAt.toISOString(),
      cancelBeforeAt: trial.eligible ? conversionAt.toISOString() : null,
      expiresAt: expiresAt.toISOString(),
      disclosure,
      acknowledgement:
        "I understand that my 7-day Blundr Pro trial requires a payment method and will automatically convert to the plan I selected on the date shown above unless I cancel before then.",
    },
  };
}

export async function acceptPaidOffer(input: {
  user: CurrentBlundrUser | null;
  offerId: unknown;
  plan: unknown;
  config: BillingConfig;
}): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  if (!input.user?.isAuthenticated || !input.user.accessToken) {
    return { ok: false, status: 401, error: "authentication_required" };
  }
  const plan = priceForBillingPlan(input.config, input.plan);
  if (!plan.ok) return { ok: false, status: 400, error: "invalid_billing_plan" };
  const offerId = String(input.offerId ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(offerId)) {
    return { ok: false, status: 400, error: "invalid_paid_offer" };
  }
  const admin = createBlundrSupabaseAdminClient();
  if (!admin) return { ok: false, status: 503, error: "billing_offer_unavailable" };
  const now = new Date().toISOString();
  const updated = await admin
    .from("blundr_paid_offer_acceptances")
    .update({ accepted_at: now })
    .eq("id", offerId)
    .eq("user_id", input.user.userId)
    .eq("billing_environment", input.config.environment)
    .eq("selected_plan", plan.plan)
    .gt("expires_at", now)
    .is("accepted_at", null)
    .is("checkout_started_at", null)
    .select("id")
    .maybeSingle();
  if (updated.error || !updated.data) {
    return { ok: false, status: 409, error: "paid_offer_stale_or_unavailable" };
  }
  return { ok: true };
}

export async function claimAcceptedPaidOffer(input: {
  userId: string;
  environment: BillingConfig["environment"];
  plan: BillingPlan;
}): Promise<
  | { offerId: string; trialEligible: boolean; reservationId: string | null }
  | null
> {
  const admin = createBlundrSupabaseAdminClient();
  if (!admin) return null;
  const now = new Date().toISOString();
  const selected = await admin
    .from("blundr_paid_offer_acceptances")
    .select("id,trial_eligible,trial_reservation_id")
    .eq("user_id", input.userId)
    .eq("billing_environment", input.environment)
    .eq("selected_plan", input.plan)
    .gt("expires_at", now)
    .not("accepted_at", "is", null)
    .is("checkout_started_at", null)
    .order("accepted_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (selected.error || !selected.data) return null;
  const updated = await admin
    .from("blundr_paid_offer_acceptances")
    .update({
      checkout_started_at: now,
    })
    .eq("id", selected.data.id)
    .is("checkout_started_at", null)
    .select("id")
    .maybeSingle();
  if (updated.error || !updated.data) return null;
  return {
    offerId: String(selected.data.id),
    trialEligible: selected.data.trial_eligible === true,
    reservationId:
      typeof selected.data.trial_reservation_id === "string"
        ? selected.data.trial_reservation_id
        : null,
  };
}

export async function attachCheckoutSessionToPaidOffer(input: {
  offerId: string;
  checkoutSessionId: string;
}): Promise<void> {
  const admin = createBlundrSupabaseAdminClient();
  if (!admin) throw new Error("billing_offer_unavailable");
  const updated = await admin
    .from("blundr_paid_offer_acceptances")
    .update({ checkout_session_id: input.checkoutSessionId })
    .eq("id", input.offerId)
    .is("checkout_session_id", null);
  if (updated.error) throw new Error("billing_offer_unavailable");
}
