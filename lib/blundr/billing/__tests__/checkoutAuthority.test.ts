import assert from "node:assert/strict";
import test from "node:test";

import type { CurrentBlundrUser } from "@/lib/blundr/accounts/accountTypes";

import {
  LOCKED_STRIPE_PRO_ANNUAL_PRICE_ID,
  LOCKED_STRIPE_PRO_MONTHLY_PRICE_ID,
  PRO_TRIAL_DAYS,
  STRIPE_APP_USER_ID_METADATA_KEY,
  type BillingConfig,
} from "../billingConfig";
import { createInMemoryBillingRepository } from "../billingRepository.server";
import {
  createBillingCheckoutSession,
  createBillingPortalSession,
} from "../checkout.server";

const user: CurrentBlundrUser = {
  userId: "11111111-1111-4111-8111-111111111111",
  email: "user@example.test",
  mode: "authenticated",
  isAuthenticated: true,
  isAdmin: false,
  accessToken: "token",
  provider: "email",
  age13Confirmed: true,
  launchPlanIntent: null,
};

const config: BillingConfig = {
  environment: "test",
  appOrigin: "https://blundr.test",
  stripeSecretKey: "sk_test_placeholder",
  stripeWebhookSecret: "whsec_placeholder",
  stripePrices: {
    monthly: LOCKED_STRIPE_PRO_MONTHLY_PRICE_ID,
    annual: LOCKED_STRIPE_PRO_ANNUAL_PRICE_ID,
  },
  revenueCatWebhookAuthorization: "Bearer rc",
  revenueCatApiKey: null,
};

function fakeStripe() {
  const checkoutSessions: unknown[] = [];
  const checkoutRequests: unknown[] = [];
  const portalSessions: unknown[] = [];
  return {
    checkoutSessions,
    checkoutRequests,
    portalSessions,
    customers: {
      create: async (_body: unknown, request: { idempotencyKey?: string }) => ({
        id: `cus_${request.idempotencyKey?.split(":").at(-1)?.replaceAll("-", "")}`,
      }),
    },
    checkout: {
      sessions: {
        create: async (body: unknown, request: unknown) => {
          checkoutSessions.push(body);
          checkoutRequests.push(request);
          return { id: "cs_test_123", url: "https://checkout.stripe.test/session" };
        },
      },
    },
    billingPortal: {
      sessions: {
        create: async (body: unknown) => {
          portalSessions.push(body);
          return { url: "https://billing.stripe.test/session" };
        },
      },
    },
  };
}

test("checkout requires authentication and rejects browser-supplied authority", async () => {
  const repository = createInMemoryBillingRepository();
  const stripe = fakeStripe();

  assert.deepEqual(
    await createBillingCheckoutSession({
      user: null,
      body: { plan: "monthly" },
      config,
      repository,
      stripe: stripe as never,
    }),
    { ok: false, status: 401, error: "authentication_required" },
  );

  const spoofed = await createBillingCheckoutSession({
    user,
    body: {
      plan: "monthly",
      priceId: "price_attacker",
      customerId: "cus_attacker",
      app_user_id: "22222222-2222-4222-8222-222222222222",
    },
    config,
    repository,
    stripe: stripe as never,
  });
  assert.deepEqual(spoofed, {
    ok: false,
    status: 400,
    error: "client_billing_authority_rejected",
  });
});

test("checkout maps plan enum to locked prices and writes authenticated UUID metadata", async () => {
  const repository = createInMemoryBillingRepository();
  const stripe = fakeStripe();

  const monthly = await createBillingCheckoutSession({
    user,
    body: { plan: "monthly" },
    config,
    repository,
    stripe: stripe as never,
  });
  assert.equal(monthly.ok, true);
  assert.equal(monthly.trialApplied, true);
  const session = stripe.checkoutSessions[0] as {
    line_items: Array<{ price: string; quantity: number }>;
    metadata: Record<string, string>;
    subscription_data: {
      metadata: Record<string, string>;
      trial_period_days?: number;
    };
    payment_method_collection: string;
  };
  assert.equal(session.line_items[0]?.price, LOCKED_STRIPE_PRO_MONTHLY_PRICE_ID);
  assert.equal(session.line_items[0]?.quantity, 1);
  assert.equal(session.payment_method_collection, "always");
  assert.equal(
    session.metadata[STRIPE_APP_USER_ID_METADATA_KEY],
    user.userId,
  );
  assert.equal(
    session.subscription_data.metadata[STRIPE_APP_USER_ID_METADATA_KEY],
    user.userId,
  );
  assert.equal(session.subscription_data.trial_period_days, PRO_TRIAL_DAYS);

  repository.consumedTrials.add(`${config.environment}:${user.userId}`);
  const annual = await createBillingCheckoutSession({
    user,
    body: { plan: "annual" },
    config,
    repository,
    stripe: stripe as never,
  });
  assert.equal(annual.ok, true);
  const annualSession = stripe.checkoutSessions[1] as {
    line_items: Array<{ price: string }>;
    subscription_data: { trial_period_days?: number };
  };
  assert.equal(annualSession.line_items[0]?.price, LOCKED_STRIPE_PRO_ANNUAL_PRICE_ID);
  assert.equal(annualSession.subscription_data.trial_period_days, undefined);
});

test("duplicate checkout reuses one customer mapping without granting Pro", async () => {
  const repository = createInMemoryBillingRepository();
  const stripe = fakeStripe();
  await createBillingCheckoutSession({
    user,
    body: { plan: "monthly" },
    config,
    repository,
    stripe: stripe as never,
  });
  await createBillingCheckoutSession({
    user,
    body: { plan: "monthly" },
    config,
    repository,
    stripe: stripe as never,
  });
  assert.equal(repository.customers.size, 1);
  assert.equal(repository.entitlements.length, 0);
  assert.deepEqual(stripe.checkoutRequests[0], stripe.checkoutRequests[1]);
});

test("portal uses trusted mapping and rejects client-selected customers", async () => {
  const repository = createInMemoryBillingRepository();
  const stripe = fakeStripe();
  assert.deepEqual(
    await createBillingPortalSession({
      user: null,
      body: {},
      config,
      repository,
      stripe: stripe as never,
    }),
    { ok: false, status: 401, error: "authentication_required" },
  );
  await createBillingCheckoutSession({
    user,
    body: { plan: "monthly" },
    config,
    repository,
    stripe: stripe as never,
  });

  assert.deepEqual(
    await createBillingPortalSession({
      user,
      body: { customerId: "cus_attacker" },
      config,
      repository,
      stripe: stripe as never,
    }),
    { ok: false, status: 400, error: "client_customer_rejected" },
  );
  const portal = await createBillingPortalSession({
    user,
    body: {},
    config,
    repository,
    stripe: stripe as never,
  });
  assert.equal(portal.ok, true);
  assert.equal((stripe.portalSessions[0] as { customer: string }).customer.startsWith("cus_"), true);
});
