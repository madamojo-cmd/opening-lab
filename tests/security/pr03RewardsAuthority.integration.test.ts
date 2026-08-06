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
const scope = `pr03-${Date.now()}-${randomUUID().slice(0, 8)}`;
const made: string[] = [];
const scopedEmail = (base: string, suffix: string) => {
  const at = base.indexOf("@");
  return `${base.slice(0, at)}+${scope}-${suffix}${base.slice(at)}`;
};

async function createUser(email: string, password: string) {
  const result = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  assert.equal(result.error, null);
  assert.ok(result.data.user);
  made.push(result.data.user!.id);
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

async function seedCompletedDaily(
  userId: string,
  day: string,
  completed = true,
) {
  const deckId = `deck-${scope}-${day}`;
  const sessionId = `session-${scope}-${day}`;
  const deck = await service.from("blundr_daily_decks").insert({
    deck_id: deckId,
    user_id: userId,
    local_date: day,
    deck_fingerprint: `fingerprint-${deckId}`,
    public_cards: [],
    server_cards: [],
    content_version: "pr03-test",
  });
  assert.equal(deck.error, null);
  const session = await service.from("blundr_daily_sessions").insert({
    session_id: sessionId,
    deck_id: deckId,
    user_id: userId,
    state: { status: completed ? "completed" : "in_progress" },
    completed_at: completed ? new Date().toISOString() : null,
  });
  assert.equal(session.error, null);
  return sessionId;
}

const rewardArgs = (
  userId: string,
  evidenceId: string,
  policy = "rewards-v2-test",
) => ({
  p_user_id: userId,
  p_completion_id: `client-completion-${randomUUID()}`,
  p_source: "daily_blundr_deck_completed",
  p_evidence_id: evidenceId,
  p_idempotency_key: `client-key-${randomUUID()}`,
  p_policy_version: policy,
  p_randomness_key_version: null,
});

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
    for (const userId of [userAId, userBId]) {
      assert.equal(
        (
          await service.from("blundr_user_profiles").insert({
            user_id: userId,
            time_zone: "UTC",
            daily_tempo_goal: 1,
            daily_battery_goal: 1,
            daily_blundr_goal: 1,
          })
        ).error,
        null,
      );
      assert.equal(
        (
          await service.from("blundr_user_repertoires").insert({
            user_id: userId,
            locked_opening_ids: ["sicilian-defense"],
          })
        ).error,
        null,
      );
    }

    const acceptedSession = await seedCompletedDaily(userAId, "2026-08-06");
    const deniedArgs = rewardArgs(userAId, acceptedSession);
    for (const [label, client] of [
      ["anonymous", anonymous],
      ["userA", userA],
      ["userB", userB],
    ] as const) {
      const result = await client.rpc(
        "blundr_apply_reward_transaction_v2",
        deniedArgs,
      );
      assert.ok(result.error, `${label} cannot invoke reward authority`);
    }

    const acceptedArgs = rewardArgs(userAId, acceptedSession);
    const first = await service.rpc(
      "blundr_apply_reward_transaction_v2",
      acceptedArgs,
    );
    assert.equal(first.error, null);
    assert.equal(first.data.duplicate, false);
    assert.equal(first.data.randomEvaluation, "unavailable");
    const retry = await service.rpc(
      "blundr_apply_reward_transaction_v2",
      rewardArgs(userAId, acceptedSession),
    );
    assert.equal(retry.error, null);
    assert.equal(retry.data.duplicate, true);
    const conflict = await service.rpc(
      "blundr_apply_reward_transaction_v2",
      rewardArgs(userAId, acceptedSession, "conflicting-policy"),
    );
    assert.ok(conflict.error);

    const concurrentSession = await seedCompletedDaily(userAId, "2026-08-07");
    const concurrent = await Promise.all([
      service.rpc(
        "blundr_apply_reward_transaction_v2",
        rewardArgs(userAId, concurrentSession),
      ),
      service.rpc(
        "blundr_apply_reward_transaction_v2",
        rewardArgs(userAId, concurrentSession),
      ),
    ]);
    assert.ok(concurrent.every((result) => !result.error));
    assert.deepEqual(
      new Set(concurrent.map((result) => result.data.duplicate)),
      new Set([false, true]),
    );

    const unacceptedSession = await seedCompletedDaily(
      userAId,
      "2026-08-08",
      false,
    );
    assert.ok(
      (
        await service.rpc(
          "blundr_apply_reward_transaction_v2",
          rewardArgs(userAId, unacceptedSession),
        )
      ).error,
    );

    const transactions = await service
      .from("blundr_reward_transactions_v2")
      .select("id")
      .eq("user_id", userAId)
      .eq("transaction_kind", "reward_grant");
    assert.equal(transactions.error, null);
    assert.equal(transactions.data?.length, 2);
    const ring = await service
      .from("blundr_daily_retention_progress")
      .select("daily_blundr_progress,opening_points_earned")
      .eq("user_id", userAId);
    assert.equal(ring.error, null);
    assert.deepEqual(
      ring.data?.map((row) => row.daily_blundr_progress),
      [1, 1],
    );

    const claim = await service.rpc("blundr_claim_reward_presentation_v2", {
      p_user_id: userAId,
      p_claimed_by: `tab-${scope}`,
      p_lease_seconds: 60,
    });
    assert.equal(claim.error, null);
    assert.ok(claim.data?.id);
    assert.equal(
      (
        await service.rpc("blundr_claim_reward_presentation_v2", {
          p_user_id: userAId,
          p_claimed_by: `other-${scope}`,
          p_lease_seconds: 60,
        })
      ).data?.id,
      undefined,
    );
    assert.ok(
      (
        await userB.rpc("blundr_mark_reward_presentation_v2", {
          p_user_id: userAId,
          p_presentation_id: claim.data.id,
          p_claimed_by: `tab-${scope}`,
          p_action: "acknowledged",
        })
      ).error,
    );
    assert.equal(
      (
        await service.rpc("blundr_mark_reward_presentation_v2", {
          p_user_id: userAId,
          p_presentation_id: claim.data.id,
          p_claimed_by: `tab-${scope}`,
          p_action: "rendered",
        })
      ).error,
      null,
    );
    assert.equal(
      (
        await service.rpc("blundr_mark_reward_presentation_v2", {
          p_user_id: userAId,
          p_presentation_id: claim.data.id,
          p_claimed_by: `tab-${scope}`,
          p_action: "acknowledged",
        })
      ).error,
      null,
    );

    const seedTx = await service
      .from("blundr_reward_transactions_v2")
      .insert({
        user_id: userAId,
        idempotency_key: `seed-${scope}`,
        transaction_kind: "reward_grant",
        source: "test_seed",
        policy_version: "rewards-v2-test",
      })
      .select("id")
      .single();
    assert.equal(seedTx.error, null);
    assert.equal(
      (
        await service
          .from("blundr_reward_inventory_v2")
          .insert({
            user_id: userAId,
            inventory_kind: "opening_fragment",
            quantity: 3,
            version: 1,
          })
      ).error,
      null,
    );
    assert.equal(
      (
        await service
          .from("blundr_reward_inventory_events_v2")
          .insert({
            transaction_id: seedTx.data!.id,
            user_id: userAId,
            event_key: `grant-${scope}`,
            event_kind: "grant",
            inventory_kind: "opening_fragment",
            quantity_delta: 3,
            policy_version: "rewards-v2-test",
          })
      ).error,
      null,
    );
    const spendArgs = {
      p_user_id: userAId,
      p_opening_id: "sicilian-defense",
      p_inventory_kind: "opening_fragment",
      p_idempotency_key: `spend-${scope}`,
      p_policy_version: "rewards-v2-test",
    };
    assert.ok(
      (await userA.rpc("blundr_spend_inventory_and_unlock_v2", spendArgs))
        .error,
    );
    const spend = await service.rpc(
      "blundr_spend_inventory_and_unlock_v2",
      spendArgs,
    );
    assert.equal(spend.error, null);
    assert.equal(spend.data.cost, 3);
    assert.equal(
      (await service.rpc("blundr_spend_inventory_and_unlock_v2", spendArgs))
        .data.duplicate,
      true,
    );
    assert.ok(
      (
        await service.rpc("blundr_spend_inventory_and_unlock_v2", {
          ...spendArgs,
          p_user_id: userBId,
        })
      ).error,
    );
    const reconciliation = await service.rpc(
      "blundr_reconcile_reward_inventory_v2",
      { p_user_id: userAId },
    );
    assert.equal(reconciliation.error, null);
    assert.ok(
      reconciliation.data.every((row: { matches: boolean }) => row.matches),
    );

    const crossOwner = await service
      .from("blundr_reward_inventory_events_v2")
      .insert({
        transaction_id: seedTx.data!.id,
        user_id: userBId,
        event_key: `cross-${scope}`,
        event_kind: "grant",
        inventory_kind: "choice_token",
        quantity_delta: 1,
        policy_version: "rewards-v2-test",
      });
    assert.ok(crossOwner.error);
    console.log(
      "PR-03 remote reward authority matrix passed: transactions=2 idempotency=passed inventory=passed presentations=passed isolation=passed skips=0",
    );
  } finally {
    for (const id of made.reverse()) await service.auth.admin.deleteUser(id);
  }
}

void main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "remote_reward_authority_failed",
  );
  process.exitCode = 1;
});
