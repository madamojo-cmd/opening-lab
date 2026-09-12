import "server-only";

import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";
import type { BillingEnvironment } from "@/lib/blundr/billing/billingConfig";
import {
  FREE_COMMERCIAL_ACCESS,
  type CommercialAccess,
} from "./commercialAccess";
import { resolveCommercialLifecycleState } from "./commercialLifecycle";
import type { BillingPlan } from "@/lib/blundr/billing/billingConfig";

type Row = Record<string, unknown>;

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function iso(value: unknown): string | null {
  const parsed = Date.parse(text(value));
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
}

export function readCommercialBillingEnvironment(): BillingEnvironment {
  return process.env.BLUNDR_BILLING_ENVIRONMENT === "live" ? "live" : "test";
}

export async function resolveCommercialAccess(input: {
  userId: string;
  environment?: BillingEnvironment;
  now?: string | Date;
}): Promise<CommercialAccess> {
  const environment = input.environment ?? readCommercialBillingEnvironment();
  const admin = createBlundrSupabaseAdminClient();
  if (!admin) return FREE_COMMERCIAL_ACCESS;
  const now =
    input.now instanceof Date
      ? input.now
      : new Date(String(input.now ?? new Date().toISOString()));
  const nowMs = now.valueOf();
  try {
    const [entitlement, subscription] = await Promise.all([
      admin
        .from("blundr_trusted_entitlements")
        .select(
          "active,source_provider,expires_at,last_verified_at,last_provider_event_at,provider_subscription_id",
        )
        .eq("user_id", input.userId)
        .eq("billing_environment", environment)
        .eq("entitlement_identifier", "pro")
        .maybeSingle(),
      admin
        .from("blundr_billing_subscriptions")
        .select(
          "status,trial_start_at,trial_end_at,current_period_end_at,cancel_at_period_end,expires_at,last_provider_event_at,last_reconciled_at,plan_interval,provider_price_id",
        )
        .eq("user_id", input.userId)
        .eq("billing_environment", environment)
        .order("last_provider_event_at", { ascending: false })
        .order("last_reconciled_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    if (entitlement.error || subscription.error) return FREE_COMMERCIAL_ACCESS;
    const entitlementRow = (entitlement.data ?? null) as Row | null;
    const subscriptionRow = (subscription.data ?? null) as Row | null;
    const subscriptionStatus = text(subscriptionRow?.status) || null;
    const planInterval =
      subscriptionRow?.plan_interval === "monthly" ||
      subscriptionRow?.plan_interval === "annual"
        ? (subscriptionRow.plan_interval as BillingPlan)
        : null;
    const providerPriceId = text(subscriptionRow?.provider_price_id) || null;
    const trialEndAt = iso(subscriptionRow?.trial_end_at);
    const currentPeriodEndAt = iso(subscriptionRow?.current_period_end_at);
    const subscriptionExpiresAt = iso(subscriptionRow?.expires_at);
    const cancelAtPeriodEnd = subscriptionRow?.cancel_at_period_end === true;
    const expiresAt = iso(entitlementRow?.expires_at);
    const entitlementActive =
      entitlementRow?.active === true &&
      (!expiresAt || Date.parse(expiresAt) > nowMs);
    const lifecycleState = resolveCommercialLifecycleState({
      entitlementActive,
      subscriptionStatus,
      trialEndAt,
      expiresAt: expiresAt ?? subscriptionExpiresAt,
      currentPeriodEndAt,
      cancelAtPeriodEnd,
      planInterval,
      nowMs,
    });
    if (!entitlementActive) {
      return {
        ...FREE_COMMERCIAL_ACCESS,
        lifecycleState,
        subscriptionStatus,
        planInterval,
        providerPriceId,
        trialStatus: subscriptionStatus === "trialing" ? "expired" : "none",
        expiresAt: expiresAt ?? subscriptionExpiresAt,
        currentPeriodEndAt,
        cancelAtPeriodEnd,
      };
    }
    const trialActive =
      subscriptionStatus === "trialing" &&
      Boolean(trialEndAt && Date.parse(trialEndAt) > nowMs);
    return {
      plan: "pro",
      entitlementActive: true,
      entitlementSource: "revenuecat",
      lifecycleState,
      subscriptionStatus,
      planInterval,
      providerPriceId,
      trialStatus: trialActive ? "active" : "none",
      expiresAt,
      currentPeriodEndAt,
      cancelAtPeriodEnd,
      limits: {
        dailyBlundrCards: 99,
        reviewCompletionsPerDay: null,
        activeOpenings: null,
        premiumInsights: true,
      },
    };
  } catch {
    return FREE_COMMERCIAL_ACCESS;
  }
}
