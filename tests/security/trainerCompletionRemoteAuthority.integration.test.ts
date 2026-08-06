import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { gradeBlundrRecall } from "../../lib/blundr/learning/core/blundrFsrs";

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

const sha = (value: string) => createHash("sha256").update(value).digest("hex");
const url = process.env.BLUNDR_RLS_TEST_URL!;
const anonKey = process.env.BLUNDR_RLS_TEST_ANON_KEY!;
const service = createClient(
  url,
  process.env.BLUNDR_RLS_TEST_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  },
);
const scope = `trainer-${Date.now()}-${randomUUID().slice(0, 8)}`;
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

async function userClient(email: string, password: string) {
  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const signedIn = await client.auth.signInWithPassword({ email, password });
  assert.equal(signedIn.error, null);
  return client;
}

function targets() {
  return Array.from({ length: 6 }, (_, index) => {
    const ordinal = index + 1;
    const openingId = "italian-white";
    const positionKey = `trainer-position-${scope}-${ordinal}`;
    const expected = "a1a2";
    const play = `trainer-play-${scope}-${ordinal}`;
    const fingerprint = sha(
      `${ordinal}:${openingId}:${positionKey}:${expected}:${play}`,
    );
    return {
      target_id: `trainer-target:${ordinal}:${fingerprint.slice(0, 24)}`,
      target_fingerprint: fingerprint,
      opening_id: openingId,
      position_key: positionKey,
      canonical_fen: "8/8/8/8/8/8/8/K6k w - - 0 1",
      expected_move_uci: expected,
      move_order_key: play,
      full_ply: index * 2,
    };
  });
}

async function reserve(userId: string) {
  const line = targets();
  const lineFingerprint = sha(
    line.map((target) => target.target_fingerprint).join(":"),
  );
  const lineId = `line-${scope}`;
  const seed = randomUUID();
  const sessionId = `trainer-session:${sha(`${userId}:${lineId}:${lineFingerprint}:${seed}`)}`;
  const result = await service.rpc("blundr_reserve_trainer_session_v2", {
    p_user_id: userId,
    p_reservation: {
      session_id: sessionId,
      server_session_seed: seed,
      line_id: lineId,
      line_fingerprint: lineFingerprint,
      canonical_line: line,
    },
  });
  assert.equal(result.error, null);
  return { sessionId, line, version: 1 };
}

function learningEvent(
  userId: string,
  sessionId: string,
  target: ReturnType<typeof targets>[number],
  requestId: string,
) {
  const occurredAt = "2026-08-06T12:00:00.000Z";
  const fsrs = gradeBlundrRecall({
    previous: null,
    correct: true,
    occurredAt,
    hinted: false,
    elapsedMs: 9000,
  });
  assert.equal(fsrs.rating, "good");
  return {
    event_id: `trainer-event-${requestId}`,
    user_id: userId,
    idempotency_key: `trainer-key-${requestId}`,
    schema_version: "2026-07-13.v1",
    session_id: sessionId,
    attempt_id: `trainer-attempt-${requestId}`,
    occurred_at: occurredAt,
    taxonomy: "move_correct",
    position_key: target.position_key,
    canonical_fen: target.canonical_fen,
    opening_id: target.opening_id,
    expected_move_uci: target.expected_move_uci,
    played_move_uci: target.expected_move_uci,
    repertoire_side: "white",
    move_order_key: target.move_order_key,
    source: "train",
    first_attempt: true,
    finding: null,
    content_version: "trainer-contract-test",
    classifier_version: "weakness-classifier-v1",
    evidence_kind: "recall_attempt",
    exposure_id: `trainer-exposure-${requestId}`,
    evidence_version: "blundr-learning-evidence-v2",
    authority_fingerprint: sha(`learning:${requestId}`),
    correct: true,
    review_rating: "good",
    answer_evidence: {
      evidenceType: "answer",
      submittedAnswer: target.expected_move_uci,
      expectedAnswerIdentity: target.expected_move_uci,
      correct: true,
      firstAttempt: true,
      retry: false,
      revealOccurred: false,
      hinted: false,
      elapsedMs: 9000,
      priorReps: 0,
      taskId: requestId,
      reservationId: sessionId,
    },
    access_decision: "active",
    fsrs: {
      ...fsrs,
      algorithmVersion: "blundr-fsrs-v1",
      desiredRetention: 0.9,
    },
    mastery: {
      recallAttemptCount: 1,
      correctRecallCount: 1,
      lapseCount: 0,
      state: "learning",
    },
    expected_review_state_version: 0,
    expected_mastery_state_version: 0,
  };
}

function action(
  userId: string,
  sessionId: string,
  target: ReturnType<typeof targets>[number],
  cursor: number,
  version: number,
  requestId: string,
) {
  return {
    p_user_id: userId,
    p_session_id: sessionId,
    p_action: {
      request_id: requestId,
      request_fingerprint: sha(`request:${requestId}`),
      target_id: target.target_id,
      target_fingerprint: target.target_fingerprint,
      cursor,
      expected_version: version,
      learning_event: learningEvent(userId, sessionId, target, requestId),
    },
  };
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
    const userA = await userClient(
      emailA,
      process.env.BLUNDR_RLS_TEST_USER_A_PASSWORD!,
    );
    const userB = await userClient(
      emailB,
      process.env.BLUNDR_RLS_TEST_USER_B_PASSWORD!,
    );
    for (const userId of [userAId, userBId]) {
      assert.equal(
        (
          await service
            .from("blundr_user_profiles")
            .insert({
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
          await service
            .from("blundr_user_repertoires")
            .insert({
              user_id: userId,
              unlocked_opening_ids: ["italian-white"],
            })
        ).error,
        null,
      );
    }
    for (const client of [userA, userB]) {
      assert.ok(
        (
          await client.rpc("blundr_reserve_trainer_session_v2", {
            p_user_id: userAId,
            p_reservation: {},
          })
        ).error,
      );
      assert.ok(
        (await client.from("blundr_trainer_sessions_v2").select("session_id"))
          .error,
      );
    }

    const reserved = await reserve(userAId);
    assert.ok(
      (
        await service.rpc("blundr_apply_reward_transaction_v2", {
          p_user_id: userAId,
          p_completion_id: "untrusted",
          p_source: "opening_run_completed",
          p_evidence_id: reserved.sessionId,
          p_idempotency_key: "untrusted",
          p_policy_version: "rewards-v2-test",
          p_randomness_key_version: null,
        })
      ).error,
      "an active Trainer session cannot reward",
    );
    assert.ok(
      (
        await service.rpc(
          "blundr_commit_trainer_action_v2",
          action(
            userBId,
            reserved.sessionId,
            reserved.line[0],
            0,
            1,
            "cross-user",
          ),
        )
      ).error,
    );
    assert.ok(
      (
        await service.rpc(
          "blundr_commit_trainer_action_v2",
          action(
            userAId,
            reserved.sessionId,
            reserved.line[0],
            3,
            1,
            "fabricated-cursor",
          ),
        )
      ).error,
    );

    let version = reserved.version;
    let terminalCompletionId = "";
    for (let cursor = 0; cursor < reserved.line.length; cursor += 1) {
      const requestId = `action-${scope}-${cursor}`;
      const args = action(
        userAId,
        reserved.sessionId,
        reserved.line[cursor],
        cursor,
        version,
        requestId,
      );
      const result =
        cursor === reserved.line.length - 1
          ? await Promise.all([
              service.rpc("blundr_commit_trainer_action_v2", args),
              service.rpc("blundr_commit_trainer_action_v2", args),
            ]).then((items) => {
              assert.ok(items.every((item) => !item.error));
              assert.deepEqual(
                new Set(items.map((item) => item.data.status)),
                new Set(["inserted", "duplicate"]),
              );
              return items[0];
            })
          : await service.rpc("blundr_commit_trainer_action_v2", args);
      assert.equal(result.error, null);
      version = Number(result.data.version);
      terminalCompletionId = String(
        result.data.terminalCompletionId ?? terminalCompletionId,
      );
      const duplicate = await service.rpc(
        "blundr_commit_trainer_action_v2",
        args,
      );
      assert.equal(duplicate.error, null);
      assert.equal(duplicate.data.status, "duplicate");
      const conflict = structuredClone(args);
      conflict.p_action.request_fingerprint = sha(`conflict:${requestId}`);
      assert.ok(
        (await service.rpc("blundr_commit_trainer_action_v2", conflict)).error,
      );
    }
    assert.ok(terminalCompletionId.startsWith("trainer-terminal:"));
    const rewardArgs = {
      p_user_id: userAId,
      p_completion_id: `browser-${randomUUID()}`,
      p_source: "opening_run_completed",
      p_evidence_id: terminalCompletionId,
      p_idempotency_key: `browser-${randomUUID()}`,
      p_policy_version: "rewards-v2-test",
      p_randomness_key_version: null,
    };
    const reward = await service.rpc(
      "blundr_apply_reward_transaction_v2",
      rewardArgs,
    );
    assert.equal(reward.error, null);
    assert.equal(reward.data.duplicate, false);
    const rewardRetry = await service.rpc(
      "blundr_apply_reward_transaction_v2",
      {
        ...rewardArgs,
        p_completion_id: "different",
        p_idempotency_key: "different",
      },
    );
    assert.equal(rewardRetry.error, null);
    assert.equal(rewardRetry.data.duplicate, true);
    const transactions = await service
      .from("blundr_reward_transactions_v2")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userAId)
      .eq("source", "opening_run_completed");
    assert.equal(transactions.error, null);
    assert.equal(transactions.count, 1);
    console.log(
      "Trainer remote authority passed: terminal=1 reward=1 duplicate=passed concurrency=passed isolation=passed skips=0",
    );
  } finally {
    for (const id of made) await service.auth.admin.deleteUser(id);
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
