import assert from "node:assert/strict";
import test from "node:test";

import { authorizeRevenueCatWebhook } from "../revenueCatWebhook.server";
import { processRevenueCatWebhook } from "../revenueCatWebhook.server";
import { createInMemoryBillingRepository } from "../billingRepository.server";
import { reconcileRevenueCatSubscriber } from "../entitlementReconciliation.server";
import { processStripeBillingEvent } from "../stripeWebhook.server";

const userId = "11111111-1111-4111-8111-111111111111";

function stripeSubscriptionEvent(input: {
  id: string;
  created: number;
  status?: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: number;
}) {
  return {
    id: input.id,
    type: "customer.subscription.updated",
    created: input.created,
    data: {
      object: {
        id: "sub_123",
        customer: "cus_123",
        status: input.status ?? "trialing",
        trial_start: 1_800_000_000,
        trial_end: 1_800_604_800,
        current_period_end: input.currentPeriodEnd ?? 1_800_604_800,
        cancel_at_period_end: input.cancelAtPeriodEnd ?? false,
        metadata: { app_user_id: userId },
        items: {
          data: [
            {
              price: {
                id: "price_1UBaUQLGvBclDkdEYam8Nz43",
                product: "prod_web_monthly",
              },
            },
          ],
        },
      },
    },
  };
}

test("Stripe webhook records billing facts but does not grant entitlement", async () => {
  const repository = createInMemoryBillingRepository();
  const first = await processStripeBillingEvent({
    event: stripeSubscriptionEvent({ id: "evt_1", created: 1_800_000_001 }) as never,
    environment: "test",
    repository,
  });
  assert.deepEqual(first, { ok: true, duplicate: false });
  assert.equal(repository.subscriptions.length, 1);
  assert.equal(repository.entitlements.length, 0);
  assert.equal(repository.consumedTrials.has(`test:${userId}`), true);

  const duplicate = await processStripeBillingEvent({
    event: stripeSubscriptionEvent({ id: "evt_1", created: 1_800_000_001 }) as never,
    environment: "test",
    repository,
  });
  assert.deepEqual(duplicate, { ok: true, duplicate: true });
});

test("Stripe webhook leaves malformed subscription events retryable", async () => {
  const repository = createInMemoryBillingRepository();
  const result = await processStripeBillingEvent({
    event: {
      ...stripeSubscriptionEvent({ id: "evt_bad", created: 1_800_000_001 }),
      data: {
        object: {
          id: "sub_bad",
          customer: "cus_123",
          status: "active",
          metadata: {},
        },
      },
    } as never,
    environment: "test",
    repository,
  });
  assert.deepEqual(result, {
    ok: false,
    retryable: true,
    error: "stripe_subscription_identity_missing",
  });
  assert.equal(repository.entitlements.length, 0);
});

test("older Stripe events cannot overwrite newer subscription facts", async () => {
  const repository = createInMemoryBillingRepository();
  await processStripeBillingEvent({
    event: stripeSubscriptionEvent({
      id: "evt_new",
      created: 1_800_100_000,
      status: "active",
      currentPeriodEnd: 1_803_000_000,
    }) as never,
    environment: "test",
    repository,
  });
  await processStripeBillingEvent({
    event: stripeSubscriptionEvent({
      id: "evt_old",
      created: 1_800_000_000,
      status: "canceled",
      currentPeriodEnd: 1_800_100_000,
    }) as never,
    environment: "test",
    repository,
  });
  assert.equal(repository.subscriptions[0]?.status, "active");
});

test("RevenueCat authorization uses exact configured header", () => {
  assert.equal(
    authorizeRevenueCatWebhook("Bearer expected", {
      revenueCatWebhookAuthorization: "Bearer expected",
    }),
    true,
  );
  assert.equal(
    authorizeRevenueCatWebhook("Bearer attacker", {
      revenueCatWebhookAuthorization: "Bearer expected",
    }),
    false,
  );
});

test("RevenueCat controls pro entitlement with duplicate and cancellation precedence", async () => {
  const repository = createInMemoryBillingRepository({ knownUsers: [userId] });
  const baseEvent = {
    id: "rc_1",
    type: "INITIAL_PURCHASE",
    app_user_id: userId,
    entitlement_ids: ["pro"],
    environment: "SANDBOX",
    event_timestamp_ms: 1_800_000_000_000,
    expiration_at_ms: 1_800_604_800_000,
    product_id: "stripe_monthly",
    original_transaction_id: "sub_rc_1",
    period_type: "TRIAL",
  };
  const first = await processRevenueCatWebhook({
    body: { event: baseEvent },
    expectedEnvironment: "test",
    repository,
  });
  assert.deepEqual(first, {
    ok: true,
    duplicate: false,
    entitlementChanged: true,
  });
  assert.equal(repository.entitlements.at(-1)?.active, true);

  const duplicate = await processRevenueCatWebhook({
    body: { event: baseEvent },
    expectedEnvironment: "test",
    repository,
  });
  assert.deepEqual(duplicate, {
    ok: true,
    duplicate: true,
    entitlementChanged: false,
  });

  await processRevenueCatWebhook({
    body: { event: { ...baseEvent, id: "rc_cancel", type: "CANCELLATION" } },
    expectedEnvironment: "test",
    repository,
  });
  assert.equal(repository.entitlements.at(-1)?.active, true);

  await processRevenueCatWebhook({
    body: { event: { ...baseEvent, id: "rc_billing_issue", type: "BILLING_ISSUE" } },
    expectedEnvironment: "test",
    repository,
  });
  assert.equal(repository.entitlements.at(-1)?.active, true);

  await processRevenueCatWebhook({
    body: {
      event: {
        ...baseEvent,
        id: "rc_expire",
        type: "EXPIRATION",
        event_timestamp_ms: 1_800_604_801_000,
        expiration_at_ms: 1_800_604_800_000,
      },
    },
    expectedEnvironment: "test",
    repository,
  });
  assert.equal(repository.entitlements.at(-1)?.active, false);

  await processRevenueCatWebhook({
    body: {
      event: {
        ...baseEvent,
        id: "rc_restore",
        type: "RENEWAL",
        event_timestamp_ms: 1_800_604_900_000,
        expiration_at_ms: 1_803_000_000_000,
      },
    },
    expectedEnvironment: "test",
    repository,
  });
  assert.equal(repository.entitlements.at(-1)?.active, true);
});

test("RevenueCat enforces pro entitlement, Supabase UUID identity, environment isolation, and transfer safety", async () => {
  const repository = createInMemoryBillingRepository({ knownUsers: [userId] });
  const event = {
    id: "rc_bad",
    type: "RENEWAL",
    app_user_id: userId,
    entitlement_id: "not_pro",
    environment: "SANDBOX",
  };
  assert.equal(
    (
      await processRevenueCatWebhook({
        body: { event },
        expectedEnvironment: "test",
        repository,
      })
    ).ok,
    false,
  );
  assert.deepEqual(
    await processRevenueCatWebhook({
      body: { event: { ...event, entitlement_id: "pro", app_user_id: "email@example.test" } },
      expectedEnvironment: "test",
      repository,
    }),
    {
      ok: false,
      status: 400,
      error: "revenuecat_app_user_id_not_supabase_uuid",
    },
  );
  assert.equal(
    (
      await processRevenueCatWebhook({
        body: { event: { ...event, entitlement_id: "pro", environment: "PRODUCTION" } },
        expectedEnvironment: "test",
        repository,
      })
    ).error,
    "revenuecat_environment_ignored",
  );
  assert.equal(
    (
      await processRevenueCatWebhook({
        body: {
          event: {
            ...event,
            entitlement_id: "pro",
            transferred_from: ["22222222-2222-4222-8222-222222222222"],
          },
        },
        expectedEnvironment: "test",
        repository,
      })
    ).error,
    "revenuecat_transfer_requires_manual_reconciliation",
  );
  assert.equal(
    (
      await processRevenueCatWebhook({
        body: {
          event: {
            ...event,
            id: "rc_alias",
            entitlement_id: "pro",
            aliases: ["22222222-2222-4222-8222-222222222222"],
          },
        },
        expectedEnvironment: "test",
        repository,
      })
    ).error,
    "revenuecat_transfer_requires_manual_reconciliation",
  );
  assert.equal(
    (
      await processRevenueCatWebhook({
        body: {
          event: {
            ...event,
            id: "rc_unknown",
            entitlement_id: "pro",
            app_user_id: "33333333-3333-4333-8333-333333333333",
          },
        },
        expectedEnvironment: "test",
        repository,
      })
    ).error,
    "revenuecat_app_user_id_not_found",
  );
});

test("RevenueCat reconciliation restores trusted entitlement from subscriber state", async () => {
  const repository = createInMemoryBillingRepository({ knownUsers: [userId] });
  const result = await reconcileRevenueCatSubscriber({
    appUserId: userId,
    config: {
      environment: "test",
      appOrigin: "https://blundr.test",
      stripeSecretKey: "sk_test_placeholder",
      stripeWebhookSecret: "whsec_placeholder",
      stripePrices: {
        monthly: "price_1UBaUQLGvBclDkdEYam8Nz43",
        annual: "price_1UBaUQLGvBclDkdEZNLeAfpq",
      },
      revenueCatWebhookAuthorization: "Bearer rc",
      revenueCatApiKey: "rc_test_key",
    },
    repository,
    fetchImpl: async () =>
      new Response(
        JSON.stringify({
          subscriber: {
            entitlements: {
              pro: { expires_date: "2030-01-01T00:00:00Z" },
            },
          },
        }),
        { status: 200 },
      ),
  });
  assert.deepEqual(result, { ok: true });
  assert.equal(repository.entitlements.at(-1)?.active, true);
  assert.equal(repository.entitlements.at(-1)?.expiresAt, "2030-01-01T00:00:00Z");
});
