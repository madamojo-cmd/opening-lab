import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
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
const REWARD_RPC = "blundr_apply_completion_reward_v3";
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
  source:
    | "daily_blundr_deck_completed"
    | "opening_run_completed"
    | "continuation_completed" = "daily_blundr_deck_completed",
) => ({
  p_user_id: userId,
  p_completion_id: `client-completion-${randomUUID()}`,
  p_source: source,
  p_evidence_id: evidenceId,
  p_idempotency_key: `client-key-${randomUUID()}`,
  p_policy_version: policy,
  p_randomness_key_version:
    process.env.BLUNDR_REWARDS_HMAC_KEY_VERSION ?? "pr03-test-key-v1",
});

async function countPendingPresentations(userId: string) {
  const result = await service
    .from("blundr_reward_presentations_v2")
    .select("id")
    .eq("user_id", userId)
    .is("acknowledged_at", null)
    .is("dismissed_at", null);
  assert.equal(result.error, null);
  return result.data?.length ?? 0;
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
      const result = await client.rpc(REWARD_RPC, deniedArgs);
      assert.ok(result.error, `${label} cannot invoke reward authority`);
    }
    const acceptedArgs = rewardArgs(userAId, acceptedSession);
    const first = await service.rpc(REWARD_RPC, acceptedArgs);
    assert.equal(first.error, null);
    assert.equal(first.data.duplicate, false);
    assert.match(
      String(first.data.randomEvaluation),
      /^(evaluated|unavailable)$/,
    );
    assert.equal(
      await countPendingPresentations(userAId),
      1,
      "one verified Daily completion creates one pending completion presentation",
    );
    const compatibilityRetry = await service.rpc(
      "blundr_apply_reward_transaction_v2",
      deniedArgs,
    );
    assert.equal(compatibilityRetry.error, null);
    assert.equal(
      compatibilityRetry.data.duplicate,
      true,
      "the shipped v2 RPC must delegate to the hydrated writer",
    );
    const retry = await service.rpc(
      REWARD_RPC,
      rewardArgs(userAId, acceptedSession),
    );
    assert.equal(retry.error, null);
    assert.equal(retry.data.duplicate, true);
    assert.equal(
      await countPendingPresentations(userAId),
      1,
      "repeating the Daily completion must not duplicate its presentation",
    );
    const conflict = await service.rpc(
      REWARD_RPC,
      rewardArgs(userAId, acceptedSession, "conflicting-policy"),
    );
    assert.ok(conflict.error);

    const concurrentSession = await seedCompletedDaily(userAId, "2026-08-07");
    const concurrent = await Promise.all([
      service.rpc(REWARD_RPC, rewardArgs(userAId, concurrentSession)),
      service.rpc(REWARD_RPC, rewardArgs(userAId, concurrentSession)),
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
      (await service.rpc(REWARD_RPC, rewardArgs(userAId, unacceptedSession)))
        .error,
    );

    const trainerSessionId = `trainer-session:${createHash("sha256").update(`${scope}:trainer`).digest("hex")}`;
    const terminalCompletionId = `trainer-terminal:${createHash("sha256").update(`${scope}:terminal`).digest("hex")}`;
    const lineFingerprint = createHash("sha256")
      .update(`${scope}:line`)
      .digest("hex");
    assert.equal(
      (
        await service.from("blundr_trainer_sessions_v2").insert({
          session_id: trainerSessionId,
          user_id: userAId,
          opening_id: "italian-white",
          line_id: `line-${scope}`,
          line_fingerprint: lineFingerprint,
          canonical_line: [{ target_id: `target-${scope}` }],
          line_length: 1,
          current_cursor: 1,
          state: "completed",
          state_version: 2,
          terminal_completion_id: terminalCompletionId,
          completed_at: new Date().toISOString(),
        })
      ).error,
      null,
    );
    const pathUci = ["e7e5", "g1f3"];
    const identityMaterial = [
      userAId,
      trainerSessionId,
      terminalCompletionId,
      pathUci.join(","),
    ].join(":");
    const continuationEvidenceId = `continuation-completion:${createHash("sha256").update(identityMaterial).digest("hex")}`;
    const terminalFen =
      "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";
    const completedFen =
      "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2";
    const requestFingerprint = createHash("sha256")
      .update(
        [identityMaterial, "italian-white", terminalFen, completedFen].join(
          ":",
        ),
      )
      .digest("hex");
    const continuation = await service.rpc(
      "blundr_commit_continuation_completion_v1",
      {
        p_user_id: userAId,
        p_completion: {
          completion_id: continuationEvidenceId,
          trainer_session_id: trainerSessionId,
          terminal_completion_id: terminalCompletionId,
          opening_id: "italian-white",
          path_uci: pathUci,
          terminal_fen: terminalFen,
          completed_fen: completedFen,
          request_fingerprint: requestFingerprint,
        },
      },
    );
    assert.equal(continuation.error, null);
    assert.equal(continuation.data.status, "inserted");
    const genericContinuationReward = await service.rpc(
      REWARD_RPC,
      rewardArgs(
        userAId,
        continuationEvidenceId,
        "rewards-v2-test",
        "continuation_completed",
      ),
    );
    assert.ok(
      genericContinuationReward.error,
      "generic continuation evidence must not award Battery",
    );
    assert.equal(
      genericContinuationReward.error?.message,
      "completion_evidence_unverified",
    );

    const checkmatePathUci = ["f7h7"];
    const checkmateTerminalFen = "7k/5Q2/6K1/8/8/8/8/8 w - - 0 1";
    const checkmateFen = "7k/7Q/6K1/8/8/8/8/8 b - - 1 1";
    const checkmateIdentityMaterial = [
      userAId,
      trainerSessionId,
      terminalCompletionId,
      checkmatePathUci.join(","),
    ].join(":");
    const checkmateEvidenceId = `continuation-checkmate:${createHash("sha256")
      .update(checkmateIdentityMaterial)
      .digest("hex")}`;
    const checkmateRequestFingerprint = createHash("sha256")
      .update(
        [
          checkmateIdentityMaterial,
          "italian-white",
          checkmateTerminalFen,
          checkmateFen,
          checkmatePathUci.at(-1),
          "chess.js-server-v1",
        ].join(":"),
      )
      .digest("hex");

    const checkmateEvidence = await service.rpc(
      "blundr_commit_continuation_checkmate_v1",
      {
        p_user_id: userAId,
        p_completion: {
          completion_id: checkmateEvidenceId,
          trainer_session_id: trainerSessionId,
          terminal_completion_id: terminalCompletionId,
          opening_id: "italian-white",
          path_uci: checkmatePathUci,
          terminal_fen: checkmateTerminalFen,
          checkmate_fen: checkmateFen,
          mating_move_uci: checkmatePathUci.at(-1),
          request_fingerprint: checkmateRequestFingerprint,
          verification_version: "chess.js-server-v1",
        },
      },
    );
    assert.equal(checkmateEvidence.error, null);
    assert.equal(checkmateEvidence.data.status, "inserted");
    const pendingBeforeTempo = await countPendingPresentations(userAId);
    const tempoReward = await service.rpc(
      REWARD_RPC,
      rewardArgs(
        userAId,
        terminalCompletionId,
        "rewards-v2-test",
        "opening_run_completed",
      ),
    );
    assert.equal(tempoReward.error, null);
    assert.equal(tempoReward.data.duplicate, false);
    assert.equal(tempoReward.data.dayRecord.dailyTempo.progress, 1);
    assert.equal(
      await countPendingPresentations(userAId),
      pendingBeforeTempo + 1,
      "verified Tempo completion creates one pending completion presentation",
    );
    assert.equal(
      (
        await service.rpc(
          REWARD_RPC,
          rewardArgs(
            userAId,
            terminalCompletionId,
            "rewards-v2-test",
            "opening_run_completed",
          ),
        )
      ).data.duplicate,
      true,
    );

    const pendingBeforeContinuationReward =
      await countPendingPresentations(userAId);
    const continuationReward = await service.rpc(
      REWARD_RPC,
      rewardArgs(
        userAId,
        checkmateEvidenceId,
        "rewards-v2-test",
        "continuation_completed",
      ),
    );
    assert.equal(continuationReward.error, null);
    assert.equal(continuationReward.data.duplicate, false);
    assert.equal(continuationReward.data.dayRecord.dailyBattery.progress, 1);
    assert.equal(
      await countPendingPresentations(userAId),
      pendingBeforeContinuationReward + 1,
      "verified Battery completion creates one pending completion presentation",
    );
    assert.equal(
      (
        await service.rpc(
          REWARD_RPC,
          rewardArgs(
            userAId,
            checkmateEvidenceId,
            "rewards-v2-test",
            "continuation_completed",
          ),
        )
      ).data.duplicate,
      true,
    );
    assert.equal(
      await countPendingPresentations(userAId),
      pendingBeforeContinuationReward + 1,
      "repeating the Battery completion must not duplicate its presentation",
    );
    const allRingsDay = new Date().toISOString().slice(0, 10);
    const allRingsDailySession = await seedCompletedDaily(userAId, allRingsDay);
    const pendingBeforeAllRings = await countPendingPresentations(userAId);
    const allRingsDailyReward = await service.rpc(
      REWARD_RPC,
      rewardArgs(
        userAId,
        allRingsDailySession,
        "rewards-v2-test",
        "daily_blundr_deck_completed",
      ),
    );
    assert.equal(allRingsDailyReward.error, null);
    assert.equal(allRingsDailyReward.data.duplicate, false);
    assert.equal(allRingsDailyReward.data.dayRecord.dailyBlundr.progress, 1);
    assert.equal(
      await countPendingPresentations(userAId),
      pendingBeforeAllRings + 1,
      "the third same-day verified ring must create exactly one new presentation",
    );
    assert.equal(
      (
        await service.rpc(
          REWARD_RPC,
          rewardArgs(
            userAId,
            allRingsDailySession,
            "rewards-v2-test",
            "daily_blundr_deck_completed",
          ),
        )
      ).data.duplicate,
      true,
    );
    assert.equal(
      await countPendingPresentations(userAId),
      pendingBeforeAllRings + 1,
      "repeating the third completion must not duplicate its presentation",
    );
    assert.ok(
      (
        await service.rpc(
          REWARD_RPC,
          rewardArgs(
            userBId,
            checkmateEvidenceId,
            "rewards-v2-test",
            "continuation_completed",
          ),
        )
      ).error,
    );

    const transactions = await service
      .from("blundr_reward_transactions_v2")
      .select("id")
      .eq("user_id", userAId)
      .eq("transaction_kind", "reward_grant");
    assert.equal(transactions.error, null);
    assert.equal(transactions.data?.length, 5);
    const grants = await service
      .from("blundr_completion_grants")
      .select("source,evidence_id")
      .eq("user_id", userAId);
    assert.equal(grants.error, null);
    assert.equal(grants.data?.length, 5);
    assert.ok(
      grants.data?.some(
        (grant) =>
          grant.source === "continuation_completed" &&
          grant.evidence_id === checkmateEvidenceId,
      ),
    );
    const ring = await service
      .from("blundr_daily_retention_progress")
      .select(
        "daily_blundr_progress,daily_battery_progress,opening_points_earned",
      )
      .eq("user_id", userAId);
    assert.equal(ring.error, null);
    assert.deepEqual(
      ring.data
        ?.map(
          (row) => `${row.daily_blundr_progress}:${row.daily_battery_progress}`,
        )
        .sort(),
      ["1:0", "1:0", "1:1"],
    );

    const pendingBeforeClaims = await countPendingPresentations(userAId);
    let claimedCount = 0;
    while (claimedCount < pendingBeforeClaims) {
      const claimedBy = `tab-${scope}-${claimedCount}`;
      const claim = await service.rpc("blundr_claim_reward_presentation_v2", {
        p_user_id: userAId,
        p_claimed_by: claimedBy,
        p_lease_seconds: 60,
      });
      assert.equal(claim.error, null);
      assert.ok(claim.data?.id);
      const otherClaim = await service.rpc(
        "blundr_claim_reward_presentation_v2",
        {
          p_user_id: userAId,
          p_claimed_by: `other-${scope}-${claimedCount}`,
          p_lease_seconds: 60,
        },
      );
      assert.equal(otherClaim.error, null);
      assert.equal(otherClaim.data, null);
      assert.ok(
        (
          await userB.rpc("blundr_mark_reward_presentation_v2", {
            p_user_id: userAId,
            p_presentation_id: claim.data.id,
            p_claimed_by: claimedBy,
            p_action: "acknowledged",
          })
        ).error,
      );
      assert.equal(
        (
          await service.rpc("blundr_mark_reward_presentation_v2", {
            p_user_id: userAId,
            p_presentation_id: claim.data.id,
            p_claimed_by: claimedBy,
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
            p_claimed_by: claimedBy,
            p_action: "acknowledged",
          })
        ).error,
        null,
      );
      const acknowledged = await service
        .from("blundr_reward_presentations_v2")
        .select("id,acknowledged_at")
        .eq("id", claim.data.id)
        .single();
      assert.equal(acknowledged.error, null);
      assert.ok(acknowledged.data?.acknowledged_at);
      claimedCount += 1;
    }
    assert.equal(claimedCount, pendingBeforeClaims);
    const nextClaim = await service.rpc("blundr_claim_reward_presentation_v2", {
      p_user_id: userAId,
      p_claimed_by: `other-${scope}`,
      p_lease_seconds: 60,
    });
    assert.equal(nextClaim.error, null);
    assert.equal(
      nextClaim.data,
      null,
      "refresh/reclaim after acknowledgement must not duplicate the presentation",
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
        await service.from("blundr_reward_inventory_v2").insert({
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
        await service.from("blundr_reward_inventory_events_v2").insert({
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
      "PR-03 remote reward authority matrix passed: transactions=3 idempotency=passed continuation=passed inventory=passed presentations=passed isolation=passed skips=0",
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
