import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import {
  gradeBlundrRecall,
  type StoredBlundrFsrsCard,
} from "../../lib/blundr/learning/core/blundrFsrs";

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
const scope = `pr04-${Date.now()}-${randomUUID().slice(0, 8)}`;
const made: string[] = [];
type Rating = "again" | "hard" | "good" | "easy";

function scopedEmail(base: string, suffix: string) {
  const at = base.indexOf("@");
  return at < 0
    ? `${base}+${scope}-${suffix}`
    : `${base.slice(0, at)}+${scope}-${suffix}${base.slice(at)}`;
}
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
  assert.equal(
    (await client.auth.signInWithPassword({ email, password })).error,
    null,
  );
  return client;
}
function reservation(id: string, version = 0, priorReps = 0) {
  return {
    attempt_id: `attempt-${id}`,
    review_item_id: `item-${id}`,
    opening_id: `opening-${id}`,
    play_key: `play-${id}`,
    review_state_version: version,
    expected_move_uci: "a1a2",
    prior_reps: priorReps,
  };
}
async function seedDueState(userId: string, r: ReturnType<typeof reservation>) {
  const result = await service.from("blundr_review_states").insert({
    user_id: userId,
    opening_id: r.opening_id,
    play_key: r.play_key,
    due_at: "2020-01-01T00:00:00.000Z",
    srs_state: {},
    last_attempt_id: "seed",
    last_outcome: "again",
    fsrs_algorithm_version: "blundr-fsrs-v1",
    fsrs_state_version: 0,
    fsrs_desired_retention: 0.9,
    review_state_version: r.review_state_version,
  });
  assert.equal(result.error, null);
}
function event(
  userId: string,
  r: ReturnType<typeof reservation>,
  input: {
    correct: boolean;
    rating: Rating;
    reveal?: boolean;
    id?: string;
    key?: string;
    prior?: StoredBlundrFsrsCard | null;
    masteryBad?: boolean;
  },
) {
  const id = input.id ?? `event-${randomUUID()}`;
  const reveal = input.reveal ?? false;
  const fsrs = gradeBlundrRecall({
    previous: input.prior ?? null,
    correct: input.correct,
    occurredAt: new Date().toISOString(),
    hinted: reveal,
    elapsedMs: input.rating === "easy" ? 1_000 : 10_000,
  });
  assert.equal(fsrs.rating, input.rating);
  return {
    event_id: id,
    user_id: userId,
    idempotency_key: input.key ?? `key-${id}`,
    schema_version: "2026-08-06.v1",
    session_id: r.attempt_id,
    attempt_id: r.attempt_id,
    occurred_at: new Date().toISOString(),
    taxonomy: input.correct ? "move_correct" : "move_incorrect",
    position_key: `position-${r.review_item_id}`,
    canonical_fen: "8/8/8/8/8/8/8/K6k w - - 0 1",
    opening_id: r.opening_id,
    expected_move_uci: r.expected_move_uci,
    played_move_uci: reveal ? null : input.correct ? "a1a2" : "a1b1",
    repertoire_side: "white",
    move_order_key: r.play_key,
    source: "review",
    first_attempt: true,
    finding: input.correct
      ? null
      : { category: "opening_move", explanation: "miss" },
    content_version: "pr04-test",
    classifier_version: "weakness-classifier-v1",
    evidence_kind: "recall_attempt",
    exposure_id: `exposure-${id}`,
    evidence_version: "blundr-learning-evidence-v2",
    authority_fingerprint: `fingerprint-${id}`,
    correct: input.correct,
    review_rating: input.rating,
    answer_evidence: {
      evidenceType: reveal ? "reveal" : "answer",
      submittedAnswer: reveal ? null : input.correct ? "a1a2" : "a1b1",
      expectedAnswerIdentity: "a1a2",
      correct: input.correct,
      firstAttempt: true,
      retry: false,
      revealOccurred: reveal,
      hinted: reveal,
      elapsedMs: input.rating === "easy" ? 1_000 : 10_000,
      priorReps: r.prior_reps,
      taskId: r.attempt_id,
      reservationId: r.attempt_id,
      ratingRequested: true,
    },
    access_decision: "active",
    fsrs: {
      ...fsrs,
      algorithmVersion: "blundr-fsrs-v1",
      desiredRetention: 0.9,
    },
    mastery: {
      recallAttemptCount: input.masteryBad ? "bad" : 1,
      correctRecallCount: input.correct ? 1 : 0,
      lapseCount: input.correct ? 0 : 1,
      state: input.correct ? "learning" : "weak",
    },
    expected_review_state_version: r.review_state_version,
    expected_mastery_state_version: 0,
  };
}
async function reserve(userId: string, r: ReturnType<typeof reservation>) {
  const result = await service.rpc("blundr_reserve_review_attempt_v1", {
    p_user_id: userId,
    p_reservation: r,
  });
  assert.equal(result.error, null);
  assert.equal(result.data.state, "awaiting_answer");
}
async function answer(
  userId: string,
  r: ReturnType<typeof reservation>,
  move: string | null,
  reveal: boolean,
  e: ReturnType<typeof event> | null,
) {
  return service.rpc("blundr_commit_review_attempt_v1", {
    p_user_id: userId,
    p_item_id: r.review_item_id,
    p_attempt_id: r.attempt_id,
    p_played_move_uci: move,
    p_reveal: reveal,
    p_event: e,
  });
}
async function rate(
  userId: string,
  r: ReturnType<typeof reservation>,
  rating: Rating,
  id: string,
  e: ReturnType<typeof event>,
) {
  return service.rpc("blundr_commit_review_rating_v1", {
    p_user_id: userId,
    p_item_id: r.review_item_id,
    p_attempt_id: r.attempt_id,
    p_rating: rating,
    p_idempotency_id: id,
    p_event: e,
  });
}

async function main() {
  const emailA = scopedEmail(process.env.BLUNDR_RLS_TEST_USER_A_EMAIL!, "a");
  const emailB = scopedEmail(process.env.BLUNDR_RLS_TEST_USER_B_EMAIL!, "b");
  try {
    const userAId = await createUser(
      emailA,
      process.env.BLUNDR_RLS_TEST_USER_A_PASSWORD!,
    );
    const userBId = await createUser(
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
    const deniedReservation = reservation("denied");
    for (const client of [anonymous, userA, userB]) {
      assert.ok(
        (
          await client.rpc("blundr_project_learning_evidence_v3", {
            p_user_id: userAId,
            p_event: {},
          })
        ).error,
      );
      assert.ok(
        (
          await client.rpc("blundr_reserve_review_attempt_v1", {
            p_user_id: userAId,
            p_reservation: deniedReservation,
          })
        ).error,
      );
      assert.ok(
        (
          await client.rpc("blundr_commit_review_attempt_v1", {
            p_user_id: userAId,
            p_item_id: "x",
            p_attempt_id: "x",
            p_played_move_uci: "a1a2",
            p_reveal: false,
            p_event: {},
          })
        ).error,
      );
      assert.ok(
        (
          await client.rpc("blundr_commit_review_rating_v1", {
            p_user_id: userAId,
            p_item_id: "x",
            p_attempt_id: "x",
            p_rating: "good",
            p_idempotency_id: "x",
            p_event: {},
          })
        ).error,
      );
    }

    const wrong = reservation("wrong");
    await seedDueState(userAId, wrong);
    await reserve(userAId, wrong);
    const wrongEvent = event(userAId, wrong, {
      correct: false,
      rating: "again",
    });
    const wrongResult = await answer(userAId, wrong, "a1b1", false, wrongEvent);
    assert.equal(wrongResult.error, null);
    assert.equal(wrongResult.data.rating, "again");
    const reveal = reservation("reveal");
    await seedDueState(userAId, reveal);
    await reserve(userAId, reveal);
    const revealEvent = event(userAId, reveal, {
      correct: false,
      rating: "again",
      reveal: true,
    });
    assert.equal(
      (await answer(userAId, reveal, null, true, revealEvent)).error,
      null,
    );

    const ratings: Array<{
      rating: Exclude<Rating, "again">;
      prior?: StoredBlundrFsrsCard;
    }> = [{ rating: "hard" }, { rating: "good" }];
    const seed = gradeBlundrRecall({
      previous: null,
      correct: true,
      occurredAt: "2026-08-01T00:00:00.000Z",
    }).card;
    ratings.push({ rating: "easy", prior: { ...seed, reps: 8 } });
    const dueAt = new Set<string>();
    for (const { rating, prior } of ratings) {
      const r = reservation(`rating-${rating}`, 0, prior?.reps ?? 0);
      await seedDueState(userAId, r);
      await reserve(userAId, r);
      const e = event(userAId, r, { correct: true, rating, prior });
      const answered = await answer(userAId, r, "a1a2", false, null);
      assert.equal(answered.error, null);
      assert.equal(answered.data.state, "awaiting_rating");
      const committed = await rate(
        userAId,
        r,
        rating,
        `rating-id-${rating}`,
        e,
      );
      assert.equal(committed.error, null);
      assert.equal(committed.data.rating, rating);
      dueAt.add(e.fsrs.dueAt);
    }
    assert.equal(dueAt.size, 3);

    const cross = reservation("cross");
    await seedDueState(userAId, cross);
    await reserve(userAId, cross);
    assert.ok(
      (await answer(userBId, cross, "a1a2", false, null)).error,
      "cross-user service request denied",
    );
    const stale = reservation("stale", 1);
    await seedDueState(userAId, { ...stale, review_state_version: 2 });
    await reserve(userAId, stale);
    assert.ok(
      (await answer(userAId, stale, "a1a2", false, null)).error,
      "stale reservation rejected",
    );

    const duplicate = reservation("duplicate");
    await seedDueState(userAId, duplicate);
    await reserve(userAId, duplicate);
    const duplicateEvent = event(userAId, duplicate, {
      correct: true,
      rating: "good",
    });
    assert.equal(
      (await answer(userAId, duplicate, "a1a2", false, null)).error,
      null,
    );
    const first = await rate(
      userAId,
      duplicate,
      "good",
      "duplicate-id",
      duplicateEvent,
    );
    const second = await rate(
      userAId,
      duplicate,
      "good",
      "duplicate-id",
      duplicateEvent,
    );
    assert.equal(first.error, null);
    assert.equal(second.error, null);
    assert.equal(second.data.status, "duplicate");
    assert.ok(
      (
        await rate(userAId, duplicate, "hard", "conflict-id", {
          ...duplicateEvent,
          review_rating: "hard",
          fsrs: { ...duplicateEvent.fsrs, rating: "hard" },
        })
      ).error,
    );

    const concurrent = reservation("concurrent");
    await seedDueState(userAId, concurrent);
    await reserve(userAId, concurrent);
    const concurrentEvent = event(userAId, concurrent, {
      correct: true,
      rating: "good",
    });
    assert.equal(
      (await answer(userAId, concurrent, "a1a2", false, null)).error,
      null,
    );
    const pair = await Promise.all([
      rate(userAId, concurrent, "good", "concurrent-id", concurrentEvent),
      rate(userAId, concurrent, "good", "concurrent-id", concurrentEvent),
    ]);
    assert.ok(pair.every((result) => !result.error));
    assert.deepEqual(
      new Set(pair.map((result) => result.data.status)),
      new Set(["inserted", "duplicate"]),
    );

    const fabricated = reservation("fabricated");
    await seedDueState(userAId, fabricated);
    await reserve(userAId, fabricated);
    assert.equal(
      (await answer(userAId, fabricated, "a1a2", false, null)).error,
      null,
    );
    const fabricatedEvent = event(userAId, fabricated, {
      correct: true,
      rating: "good",
    });
    assert.ok(
      (await rate(userAId, fabricated, "easy", "fabricated", fabricatedEvent))
        .error,
      "rating/event mismatch rejected",
    );

    const rollback = reservation("rollback");
    await seedDueState(userAId, rollback);
    await reserve(userAId, rollback);
    assert.equal(
      (await answer(userAId, rollback, "a1a2", false, null)).error,
      null,
    );
    const rollbackEvent = event(userAId, rollback, {
      correct: true,
      rating: "good",
      masteryBad: true,
    });
    assert.ok(
      (await rate(userAId, rollback, "good", "rollback-id", rollbackEvent))
        .error,
    );
    assert.equal(
      (
        await service
          .from("blundr_learning_events")
          .select("event_id")
          .eq("event_id", rollbackEvent.event_id)
      ).data?.length,
      0,
    );
    assert.equal(
      (
        await service
          .from("blundr_review_attempts")
          .select("state")
          .eq("attempt_id", rollback.attempt_id)
          .single()
      ).data?.state,
      "awaiting_rating",
    );

    const eventIds = [
      wrongEvent.event_id,
      revealEvent.event_id,
      duplicateEvent.event_id,
      concurrentEvent.event_id,
    ];
    assert.equal(
      (
        await service
          .from("blundr_learning_events")
          .select("event_id")
          .in("event_id", eventIds)
      ).data?.length,
      eventIds.length,
    );
    assert.ok(
      (
        await service
          .from("blundr_review_states")
          .select("review_state_version")
          .eq("user_id", userAId)
      ).data?.length,
    );
    assert.ok(
      (
        await service
          .from("blundr_node_mastery")
          .select("mastery_state_version")
          .eq("user_id", userAId)
      ).data?.length,
    );
    assert.ok(
      (
        await service
          .from("blundr_weakness_projection")
          .select("position_key")
          .eq("user_id", userAId)
      ).data?.length,
    );
    console.log(
      "PR-04 remote Review authority matrix passed: users=2 ratings=4 atomicity=passed concurrency=passed skips=0",
    );
  } finally {
    for (const id of made.reverse()) await service.auth.admin.deleteUser(id);
  }
}
void main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "remote_review_authority_failed",
  );
  process.exitCode = 1;
});
