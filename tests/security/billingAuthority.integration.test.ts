import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const required = [
  "BLUNDR_RLS_TEST_URL",
  "BLUNDR_RLS_TEST_ANON_KEY",
  "BLUNDR_RLS_TEST_SERVICE_ROLE_KEY",
  "BLUNDR_RLS_TEST_USER_A_EMAIL",
  "BLUNDR_RLS_TEST_USER_A_PASSWORD",
  "BLUNDR_RLS_TEST_USER_B_EMAIL",
  "BLUNDR_RLS_TEST_USER_B_PASSWORD",
];
for (const name of required) assert.ok(process.env[name], `${name} required`);
assert.equal(process.env.BLUNDR_RLS_TEST_ENVIRONMENT_ROLE, "disposable");

const url = process.env.BLUNDR_RLS_TEST_URL!;
const anonKey = process.env.BLUNDR_RLS_TEST_ANON_KEY!;
const service = createClient(
  url,
  process.env.BLUNDR_RLS_TEST_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  },
);
const anonymous = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const scope = `billing-${Date.now()}-${randomUUID().slice(0, 8)}`;
const billingEnvironment = "test";
const madeUsers: string[] = [];
const madeEvents: string[] = [];

const scopedEmail = (base: string, suffix: string) => {
  const at = base.indexOf("@");
  return `${base.slice(0, at)}+${scope}-${suffix}${base.slice(at)}`;
};
const customerId = (suffix: string) =>
  `cus_${scope.replace(/[^A-Za-z0-9]/g, "")}${suffix}`;
const subscriptionId = (suffix: string) =>
  `sub_${scope.replace(/[^A-Za-z0-9]/g, "")}${suffix}`;
const eventId = (suffix: string) => {
  const id = `evt_${scope}_${suffix}`;
  madeEvents.push(id);
  return id;
};

async function createUser(email: string, password: string) {
  const result = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  assert.equal(result.error, null);
  assert.ok(result.data.user);
  madeUsers.push(result.data.user!.id);
  return result.data.user!.id;
}

async function clientFor(email: string, password: string) {
  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const result = await client.auth.signInWithPassword({ email, password });
  assert.equal(result.error, null);
  return client;
}

async function seedAuthorityRows(userId: string, suffix: string) {
  assert.equal(
    (
      await service.from("blundr_billing_customers").insert({
        user_id: userId,
        billing_environment: billingEnvironment,
        stripe_customer_id: customerId(suffix),
        revenuecat_app_user_id: userId,
      })
    ).error,
    null,
  );
  assert.equal(
    (
      await service.from("blundr_billing_subscriptions").insert({
        user_id: userId,
        billing_environment: billingEnvironment,
        provider: "stripe",
        provider_customer_id: customerId(suffix),
        provider_subscription_id: subscriptionId(suffix),
        provider_product_id: "prod_test",
        provider_price_id: "price_test",
        plan_interval: "monthly",
        status: "active",
        trial_start_at: new Date("2026-09-04T00:00:00.000Z").toISOString(),
        trial_end_at: new Date("2026-09-11T00:00:00.000Z").toISOString(),
        current_period_end_at: new Date("2026-10-04T00:00:00.000Z").toISOString(),
        cancel_at_period_end: false,
        expires_at: new Date("2026-10-04T00:00:00.000Z").toISOString(),
        last_provider_event_at: new Date("2026-09-04T00:00:00.000Z").toISOString(),
      })
    ).error,
    null,
  );
  assert.equal(
    (
      await service.from("blundr_trusted_entitlements").insert({
        user_id: userId,
        billing_environment: billingEnvironment,
        entitlement_identifier: "pro",
        active: true,
        source_provider: "revenuecat",
        expires_at: new Date("2026-10-04T00:00:00.000Z").toISOString(),
        last_verified_at: new Date("2026-09-04T00:00:00.000Z").toISOString(),
        last_provider_event_at: new Date("2026-09-04T00:00:00.000Z").toISOString(),
        provider_subscription_id: subscriptionId(suffix),
      })
    ).error,
    null,
  );
  assert.equal(
    (
      await service.from("blundr_billing_trial_eligibility").insert({
        user_id: userId,
        billing_environment: billingEnvironment,
      })
    ).error,
    null,
  );
  assert.equal(
    (
      await service.from("blundr_paid_offer_acceptances").insert({
        user_id: userId,
        billing_environment: billingEnvironment,
        offer_version: "paid-offer-v1",
        legal_version: "subscription-terms-20260904",
        selected_plan: "monthly",
        displayed_price_cents: 999,
        displayed_currency: "usd",
        displayed_interval: "month",
        trial_eligible: false,
        displayed_at: new Date("2026-09-04T00:00:00.000Z").toISOString(),
        accepted_at: new Date("2026-09-04T00:01:00.000Z").toISOString(),
        disclosed_conversion_at: new Date("2026-09-04T00:00:00.000Z").toISOString(),
        expires_at: new Date("2026-09-04T00:30:00.000Z").toISOString(),
      })
    ).error,
    null,
  );
  assert.equal(
    (
      await service.from("blundr_free_active_opening_selections").insert({
        user_id: userId,
        billing_environment: billingEnvironment,
        active_opening_ids: [
          `italian-white-${suffix}`,
          `scotch-white-${suffix}`,
          `french-black-${suffix}`,
        ],
        selection_required: false,
      })
    ).error,
    null,
  );
}

async function expectOwnReadOnly(
  client: ReturnType<typeof createClient>,
  table: string,
  ownId: string,
  otherId: string,
) {
  const own = await client.from(table).select("user_id").eq("user_id", ownId);
  assert.equal(own.error, null, `${table} own read allowed`);
  assert.equal(own.data?.length, 1, `${table} own read returns one row`);

  const other = await client
    .from(table)
    .select("user_id")
    .eq("user_id", otherId);
  assert.equal(other.error, null, `${table} cross-user read is filtered`);
  assert.equal(other.data?.length, 0, `${table} cross-user read denied`);
}

async function expectWriteDenied(
  client: ReturnType<typeof createClient>,
  label: string,
  table: string,
  userId: string,
  row: Record<string, unknown>,
  update: Record<string, unknown>,
  filters: (query: unknown) => unknown,
) {
  const inserted = await client.from(table).insert(row);
  assert.ok(inserted.error, `${label} cannot insert ${table}`);
  const updated = await filters(client.from(table).update(update));
  assert.ok((updated as { error: unknown }).error, `${label} cannot update ${table}`);
  const deleted = await filters(client.from(table).delete());
  assert.ok((deleted as { error: unknown }).error, `${label} cannot delete ${table}`);

  if ("user_id" in row) {
    const crossUserInsert = await client.from(table).insert({
      ...row,
      user_id: userId,
    });
    assert.ok(crossUserInsert.error, `${label} cannot insert cross-user ${table}`);
  }
}

async function main() {
  const emailA = scopedEmail(process.env.BLUNDR_RLS_TEST_USER_A_EMAIL!, "a");
  const emailB = scopedEmail(process.env.BLUNDR_RLS_TEST_USER_B_EMAIL!, "b");
  let userAId = "";
  let userBId = "";
  try {
    userAId = await createUser(
      emailA,
      process.env.BLUNDR_RLS_TEST_USER_A_PASSWORD!,
    );
    userBId = await createUser(
      emailB,
      process.env.BLUNDR_RLS_TEST_USER_B_PASSWORD!,
    );
    const userA = await clientFor(
      emailA,
      process.env.BLUNDR_RLS_TEST_USER_A_PASSWORD!,
    );
    const userB = await clientFor(
      emailB,
      process.env.BLUNDR_RLS_TEST_USER_B_PASSWORD!,
    );

    await seedAuthorityRows(userAId, "A");
    await seedAuthorityRows(userBId, "B");

    for (const table of [
      "blundr_billing_customers",
      "blundr_billing_subscriptions",
      "blundr_trusted_entitlements",
      "blundr_billing_trial_eligibility",
      "blundr_paid_offer_acceptances",
      "blundr_free_active_opening_selections",
    ]) {
      await expectOwnReadOnly(userA, table, userAId, userBId);
      await expectOwnReadOnly(userB, table, userBId, userAId);
    }

    const eventA = eventId("A");
    assert.equal(
      (
        await service.from("blundr_billing_provider_events").insert({
          provider: "revenuecat",
          provider_event_id: eventA,
          event_type: "RENEWAL",
          billing_environment: billingEnvironment,
          event_occurred_at: new Date("2026-09-04T00:00:00.000Z").toISOString(),
          processing_status: "processed",
          normalized_facts: { entitlementIdentifier: "pro" },
        })
      ).error,
      null,
    );
    for (const [label, client] of [
      ["anonymous", anonymous],
      ["userA", userA],
      ["userB", userB],
    ] as const) {
      assert.ok(
        (await client.from("blundr_billing_provider_events").select("id")).error,
        `${label} cannot read provider event ledger`,
      );
    }

    for (const [label, client] of [
      ["anonymous", anonymous],
      ["userA", userA],
    ] as const) {
      await expectWriteDenied(
        client,
        label,
        "blundr_billing_customers",
        userBId,
        {
          user_id: userAId,
          billing_environment: billingEnvironment,
          stripe_customer_id: customerId(`${label}Insert`),
          revenuecat_app_user_id: userAId,
        },
        { stripe_customer_id: customerId(`${label}Update`) },
        (query) =>
          (query as { eq: (column: string, value: string) => unknown }).eq(
            "user_id",
            userAId,
          ),
      );
      await expectWriteDenied(
        client,
        label,
        "blundr_billing_subscriptions",
        userBId,
        {
          user_id: userAId,
          billing_environment: billingEnvironment,
          provider: "stripe",
          provider_customer_id: customerId(`${label}SubInsert`),
          provider_subscription_id: subscriptionId(`${label}SubInsert`),
          status: "active",
        },
        { status: "canceled" },
        (query) =>
          (query as { eq: (column: string, value: string) => unknown }).eq(
            "user_id",
            userAId,
          ),
      );
      await expectWriteDenied(
        client,
        label,
        "blundr_trusted_entitlements",
        userBId,
        {
          user_id: userAId,
          billing_environment: billingEnvironment,
          entitlement_identifier: "pro",
          active: true,
          source_provider: "revenuecat",
          last_verified_at: new Date().toISOString(),
        },
        { active: false },
        (query) =>
          (query as { eq: (column: string, value: string) => unknown }).eq(
            "user_id",
            userAId,
          ),
      );
      await expectWriteDenied(
        client,
        label,
        "blundr_billing_trial_eligibility",
        userBId,
        {
          user_id: userAId,
          billing_environment: "sandbox",
        },
        { checkout_session_id: "cs_client_update" },
        (query) =>
          (query as { eq: (column: string, value: string) => unknown }).eq(
            "user_id",
            userAId,
          ),
      );
      await expectWriteDenied(
        client,
        label,
        "blundr_billing_provider_events",
        userBId,
        {
          provider: "stripe",
          provider_event_id: eventId(`${label}Client`),
          event_type: "customer.subscription.updated",
          billing_environment: billingEnvironment,
        },
        { processing_status: "processed" },
        (query) =>
          (query as { eq: (column: string, value: string) => unknown }).eq(
            "provider_event_id",
            eventA,
          ),
      );
      await expectWriteDenied(
        client,
        label,
        "blundr_paid_offer_acceptances",
        userBId,
        {
          user_id: userAId,
          billing_environment: billingEnvironment,
          offer_version: "paid-offer-v1",
          legal_version: "subscription-terms-20260904",
          selected_plan: "annual",
          displayed_price_cents: 6999,
          displayed_currency: "usd",
          displayed_interval: "year",
          trial_eligible: false,
          disclosed_conversion_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        },
        { selected_plan: "monthly" },
        (query) =>
          (query as { eq: (column: string, value: string) => unknown }).eq(
            "user_id",
            userAId,
          ),
      );
      await expectWriteDenied(
        client,
        label,
        "blundr_free_active_opening_selections",
        userBId,
        {
          user_id: userAId,
          billing_environment: billingEnvironment,
          active_opening_ids: ["italian-white", "scotch-white", "french-black"],
          selection_required: false,
        },
        { active_opening_ids: ["italian-white"] },
        (query) =>
          (query as { eq: (column: string, value: string) => unknown }).eq(
            "user_id",
            userAId,
          ),
      );
    }

    for (const [label, client] of [
      ["anonymous", anonymous],
      ["userA", userA],
      ["userB", userB],
    ] as const) {
      const reserve = await client.rpc("blundr_reserve_pro_trial_v1", {
        p_user_id: userAId,
        p_billing_environment: billingEnvironment,
        p_reservation_minutes: 1440,
      });
      assert.ok(reserve.error, `${label} cannot reserve trials directly`);
      const consume = await client.rpc("blundr_mark_pro_trial_consumed_v1", {
        p_user_id: userAId,
        p_billing_environment: billingEnvironment,
        p_provider: "stripe",
        p_provider_subscription_id: subscriptionId("clientConsume"),
      });
      assert.ok(consume.error, `${label} cannot consume trials directly`);
    }

    const userCId = await createUser(
      scopedEmail(process.env.BLUNDR_RLS_TEST_USER_A_EMAIL!, "c"),
      process.env.BLUNDR_RLS_TEST_USER_A_PASSWORD!,
    );
    const reservation = await service.rpc("blundr_reserve_pro_trial_v1", {
      p_user_id: userCId,
      p_billing_environment: billingEnvironment,
      p_reservation_minutes: 1440,
    });
    assert.equal(reservation.error, null);
    assert.equal(reservation.data.eligible, true);
    const record = await service.rpc("blundr_record_checkout_trial_session_v1", {
      p_user_id: userCId,
      p_billing_environment: billingEnvironment,
      p_reservation_id: reservation.data.reservationId,
      p_checkout_session_id: "cs_billingRlsProof",
    });
    assert.equal(record.error, null);
    const consumed = await service.rpc("blundr_mark_pro_trial_consumed_v1", {
      p_user_id: userCId,
      p_billing_environment: billingEnvironment,
      p_provider: "stripe",
      p_provider_subscription_id: subscriptionId("Consumed"),
    });
    assert.equal(consumed.error, null);
    const repeatReservation = await service.rpc("blundr_reserve_pro_trial_v1", {
      p_user_id: userCId,
      p_billing_environment: billingEnvironment,
      p_reservation_minutes: 1440,
    });
    assert.equal(repeatReservation.error, null);
    assert.equal(repeatReservation.data.eligible, false);

    for (const environment of ["sandbox", "production"] as const) {
      assert.equal(
        (
          await service.from("blundr_trusted_entitlements").upsert({
            user_id: userAId,
            billing_environment: environment,
            entitlement_identifier: "pro",
            active: environment === "sandbox",
            source_provider: "revenuecat",
            expires_at: null,
            last_verified_at: new Date("2026-09-04T00:00:00.000Z").toISOString(),
            last_provider_event_at: new Date("2026-09-04T00:00:00.000Z").toISOString(),
          })
        ).error,
        null,
      );
    }
    const isolated = await userA
      .from("blundr_trusted_entitlements")
      .select("billing_environment, active")
      .eq("user_id", userAId)
      .in("billing_environment", ["sandbox", "production"]);
    assert.equal(isolated.error, null);
    assert.deepEqual(
      new Map(isolated.data?.map((row) => [row.billing_environment, row.active])),
      new Map([
        ["sandbox", true],
        ["production", false],
      ]),
      "sandbox and production entitlement rows remain isolated",
    );
    const crossEnvironment = await userB
      .from("blundr_trusted_entitlements")
      .select("billing_environment")
      .eq("user_id", userAId);
    assert.equal(crossEnvironment.error, null);
    assert.equal(crossEnvironment.data?.length, 0);
  } finally {
    if (madeEvents.length > 0) {
      await service
        .from("blundr_billing_provider_events")
        .delete()
        .in("provider_event_id", madeEvents);
    }
    await Promise.all(
      madeUsers.map((userId) => service.auth.admin.deleteUser(userId)),
    );
  }
}

main()
  .then(() => {
    console.log("Billing authority disposable RLS proof passed");
  })
  .catch((error) => {
    console.error(
      error instanceof Error ? error.message : "billing RLS proof failed",
    );
    process.exitCode = 1;
  });
