import type Stripe from "stripe";

import type { CurrentBlundrUser } from "@/lib/blundr/accounts/accountTypes";

import {
  billingUrl,
  priceForBillingPlan,
  PRO_TRIAL_DAYS,
  STRIPE_APP_USER_ID_METADATA_KEY,
  type BillingConfig,
} from "./billingConfig";
import {
  createSupabaseBillingRepository,
  type BillingRepository,
} from "./billingRepository.server";
import {
  attachCheckoutSessionToPaidOffer,
  claimAcceptedPaidOffer,
} from "./paidOffer.server";
import { createStripeClient } from "./stripeClient.server";

type CheckoutStripe = Pick<Stripe, "customers" | "checkout">;

export type CheckoutResult =
  | { ok: true; url: string; sessionId: string; trialApplied: boolean }
  | { ok: false; status: number; error: string };

type CheckoutTrialAuthority = {
  offerId?: string;
  eligible: boolean;
  reservationId: string | null;
};

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function invalidClientAuthority(body: Record<string, unknown>): boolean {
  return [
    "priceId",
    "price_id",
    "customer",
    "customerId",
    "customer_id",
    "app_user_id",
    "appUserId",
    "trial",
    "trialEligible",
    "entitlement",
  ].some((key) => key in body);
}

export async function createBillingCheckoutSession(input: {
  user: CurrentBlundrUser | null;
  body: unknown;
  config: BillingConfig;
  repository?: BillingRepository;
  stripe?: CheckoutStripe;
  requireAcceptedOffer?: boolean;
}): Promise<CheckoutResult> {
  if (!input.user?.isAuthenticated || !input.user.accessToken) {
    return { ok: false, status: 401, error: "authentication_required" };
  }
  const body =
    input.body && typeof input.body === "object"
      ? (input.body as Record<string, unknown>)
      : {};
  if (invalidClientAuthority(body)) {
    return { ok: false, status: 400, error: "client_billing_authority_rejected" };
  }
  const plan = priceForBillingPlan(input.config, body.plan);
  if (!plan.ok) return { ok: false, status: 400, error: "invalid_billing_plan" };

  const repository = input.repository ?? createSupabaseBillingRepository();
  const stripe = input.stripe ?? createStripeClient(input.config);
  const mapping = await repository.getOrCreateCustomerMapping({
    userId: input.user.userId,
    email: input.user.email ?? null,
    environment: input.config.environment,
    createStripeCustomer: async (idempotencyKey) => {
      const customer = await stripe.customers.create(
        {
          email: input.user?.email ?? undefined,
          metadata: {
            [STRIPE_APP_USER_ID_METADATA_KEY]: input.user!.userId,
          },
        },
        { idempotencyKey },
      );
      return customer.id;
    },
  });
  if (!mapping.stripeCustomerId || mapping.revenueCatAppUserId !== input.user.userId) {
    return { ok: false, status: 503, error: "billing_customer_unavailable" };
  }

  const acceptedOffer = input.requireAcceptedOffer
    ? await claimAcceptedPaidOffer({
        userId: input.user.userId,
        environment: input.config.environment,
        plan: plan.plan,
      })
    : null;
  if (input.requireAcceptedOffer && !acceptedOffer) {
    return { ok: false, status: 409, error: "paid_offer_acknowledgement_required" };
  }
  const trial: CheckoutTrialAuthority = acceptedOffer
    ? {
        offerId: acceptedOffer.offerId,
        eligible: acceptedOffer.trialEligible,
        reservationId: acceptedOffer.reservationId,
      }
    : await repository.reserveTrial({
        userId: input.user.userId,
        environment: input.config.environment,
      });
  const metadata = {
    [STRIPE_APP_USER_ID_METADATA_KEY]: input.user.userId,
    billing_environment: input.config.environment,
    blundr_plan: plan.plan,
    revenuecat_app_user_id: input.user.userId,
  };
  const session = await stripe.checkout.sessions.create(
    {
      mode: "subscription",
      customer: mapping.stripeCustomerId,
      line_items: [{ price: plan.priceId, quantity: 1 }],
      payment_method_collection: "always",
      success_url: billingUrl(input.config.appOrigin, "/billing/success"),
      cancel_url: billingUrl(input.config.appOrigin, "/billing/cancel"),
      metadata,
      subscription_data: {
        metadata,
        ...(trial.eligible ? { trial_period_days: PRO_TRIAL_DAYS } : {}),
      },
    },
    {
      idempotencyKey: `checkout:${input.config.environment}:${input.user.userId}:${plan.plan}:${trial.reservationId ?? "no-trial"}`,
    },
  );
  if (!session.url) {
    return { ok: false, status: 503, error: "checkout_session_unavailable" };
  }
  if (input.requireAcceptedOffer && trial.offerId) {
    await attachCheckoutSessionToPaidOffer({
      offerId: trial.offerId,
      checkoutSessionId: session.id,
    });
  }
  if (trial.eligible && trial.reservationId) {
    await repository.recordCheckoutTrialSession({
      userId: input.user.userId,
      environment: input.config.environment,
      reservationId: trial.reservationId,
      checkoutSessionId: session.id,
    });
  }
  return {
    ok: true,
    url: session.url,
    sessionId: session.id,
    trialApplied: trial.eligible,
  };
}

export async function createBillingPortalSession(input: {
  user: CurrentBlundrUser | null;
  body: unknown;
  config: BillingConfig;
  repository?: BillingRepository;
  stripe?: Pick<Stripe, "billingPortal">;
}): Promise<{ ok: true; url: string } | { ok: false; status: number; error: string }> {
  if (!input.user?.isAuthenticated || !input.user.accessToken) {
    return { ok: false, status: 401, error: "authentication_required" };
  }
  const body =
    input.body && typeof input.body === "object"
      ? (input.body as Record<string, unknown>)
      : {};
  if (text(body.customer) || text(body.customerId) || text(body.customer_id)) {
    return { ok: false, status: 400, error: "client_customer_rejected" };
  }
  const repository = input.repository ?? createSupabaseBillingRepository();
  const stripe = input.stripe ?? createStripeClient(input.config);
  const customerId = await repository.getStripeCustomerId({
    userId: input.user.userId,
    environment: input.config.environment,
  });
  if (!customerId) {
    return { ok: false, status: 404, error: "billing_customer_not_found" };
  }
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: billingUrl(input.config.appOrigin, "/settings"),
  });
  return { ok: true, url: session.url };
}
