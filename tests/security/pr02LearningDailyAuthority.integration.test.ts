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
const url = process.env.BLUNDR_RLS_TEST_URL!,
  anonKey = process.env.BLUNDR_RLS_TEST_ANON_KEY!,
  serviceKey = process.env.BLUNDR_RLS_TEST_SERVICE_ROLE_KEY!;
const service = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const anonymous = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const scope = `pr02-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const scoped = (base: string, s: string) => {
  const at = base.indexOf("@");
  return at < 0
    ? `${base}+${s}`
    : `${base.slice(0, at)}+${s}@${base.slice(at + 1)}`;
};
const emailA = scoped(process.env.BLUNDR_RLS_TEST_USER_A_EMAIL!, scope + "-a"),
  emailB = scoped(process.env.BLUNDR_RLS_TEST_USER_B_EMAIL!, scope + "-b");
const passwordA = process.env.BLUNDR_RLS_TEST_USER_A_PASSWORD!,
  passwordB = process.env.BLUNDR_RLS_TEST_USER_B_PASSWORD!;
const made: string[] = [];
async function createUser(email: string, password: string) {
  const r = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  assert.equal(r.error, null);
  assert.ok(r.data.user);
  made.push(r.data.user!.id);
  return r.data.user!.id;
}
async function clientFor(email: string, password: string) {
  const c = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const r = await c.auth.signInWithPassword({ email, password });
  assert.equal(r.error, null);
  return c;
}
const now = "2026-08-06T12:00:00.000Z";
type Rating = "again" | "hard" | "good" | "easy";
function event(
  userId: string,
  input: {
    id?: string;
    key?: string;
    position?: string;
    play?: string;
    exposure?: string;
    correct: boolean;
    rating: Rating;
    kind?: "answer" | "reveal";
    elapsedMs: number | null;
    prior?: StoredBlundrFsrsCard | null;
    masteryBad?: boolean;
  },
) {
  const id = input.id ?? `evt-${randomUUID()}`,
    key = input.key ?? `key-${randomUUID()}`,
    position = input.position ?? `pos-${randomUUID()}`,
    play = input.play ?? `play-${randomUUID()}`,
    exposure = input.exposure ?? `exp-${randomUUID()}`,
    kind = input.kind ?? "answer";
  const fsrs = gradeBlundrRecall({
    previous: input.prior ?? null,
    correct: input.correct,
    occurredAt: now,
    hinted: kind === "reveal",
    elapsedMs: input.elapsedMs,
  });
  assert.equal(fsrs.rating, input.rating);
  return {
    event_id: id,
    user_id: userId,
    idempotency_key: key,
    schema_version: "2026-07-13.v1",
    session_id: `session-${scope}`,
    attempt_id: `attempt-${id}`,
    occurred_at: now,
    taxonomy:
      kind === "reveal"
        ? "cue_revealed"
        : input.correct
          ? "move_correct"
          : "move_incorrect",
    position_key: position,
    canonical_fen: "8/8/8/8/8/8/8/K6k w - - 0 1",
    opening_id: "italian-white",
    expected_move_uci: "a1a2",
    played_move_uci: kind === "reveal" ? null : input.correct ? "a1a2" : "a1b1",
    repertoire_side: "white",
    move_order_key: play,
    source: "daily",
    first_attempt: true,
    finding: input.correct
      ? null
      : { category: "opening_move", explanation: "miss" },
    content_version: "test",
    classifier_version: "weakness-classifier-v1",
    evidence_kind: "recall_attempt",
    exposure_id: exposure,
    evidence_version: "blundr-learning-evidence-v2",
    authority_fingerprint: `fingerprint-${id}-${input.rating}-${kind}`,
    correct: input.correct,
    review_rating: input.rating,
    answer_evidence: {
      evidenceType: kind,
      submittedAnswer:
        kind === "reveal" ? null : input.correct ? "a1a2" : "a1b1",
      expectedAnswerIdentity: "a1a2",
      correct: input.correct,
      firstAttempt: true,
      retry: false,
      revealOccurred: kind === "reveal",
      hinted: kind === "reveal",
      elapsedMs: input.elapsedMs,
      priorReps: input.prior?.reps ?? 0,
      taskId: `attempt-${id}`,
      reservationId: `session-${scope}`,
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
    expected_review_state_version: 0,
    expected_mastery_state_version: 0,
  };
}

async function main() {
  let userAId = "",
    userBId = "";
  try {
    userAId = await createUser(emailA, passwordA);
    userBId = await createUser(emailB, passwordB);
    const userA = await clientFor(emailA, passwordA),
      userB = await clientFor(emailB, passwordB);
    const deniedEvent = event(userAId, {
      correct: false,
      rating: "again",
      kind: "reveal",
      elapsedMs: null,
    });
    for (const [label, c] of [
      ["anonymous", anonymous],
      ["userA", userA],
      ["userB", userB],
    ] as const) {
      const r = await c.rpc("blundr_project_learning_evidence_v2", {
        p_user_id: userAId,
        p_event: deniedEvent,
      });
      assert.ok(r.error, `${label} direct RPC denied`);
    }

    const reveal = event(userAId, {
      correct: false,
      rating: "again",
      kind: "reveal",
      elapsedMs: null,
      position: `reveal-pos-${scope}`,
      play: `reveal-play-${scope}`,
      exposure: `reveal-exp-${scope}`,
    });
    const revealResult = await service.rpc(
      "blundr_project_learning_evidence_v2",
      { p_user_id: userAId, p_event: reveal },
    );
    assert.equal(revealResult.error, null);
    assert.equal(revealResult.data.reviewRating, "again");
    const retry = event(userAId, {
      correct: true,
      rating: "good",
      elapsedMs: 10_000,
      position: reveal.position_key,
      play: reveal.move_order_key,
      exposure: reveal.exposure_id,
    });
    retry.expected_review_state_version = 1;
    retry.expected_mastery_state_version = 1;
    const retryResult = await service.rpc(
      "blundr_project_learning_evidence_v2",
      { p_user_id: userAId, p_event: retry },
    );
    assert.equal(retryResult.error, null);
    assert.equal(retryResult.data.projected, false);
    const storedReveal = await service
      .from("blundr_learning_events")
      .select(
        "event_id,first_attempt,review_rating,answer_evidence,review_projection",
      )
      .in("event_id", [reveal.event_id, retry.event_id])
      .order("occurred_at");
    assert.equal(storedReveal.error, null);
    assert.equal(
      storedReveal.data?.find((x) => x.event_id === reveal.event_id)
        ?.review_rating,
      "again",
    );
    assert.equal(
      storedReveal.data?.find((x) => x.event_id === retry.event_id)
        ?.review_rating,
      null,
    );

    const good = event(userAId, {
      correct: true,
      rating: "good",
      elapsedMs: 10_000,
    });
    const hard = event(userAId, {
      correct: true,
      rating: "hard",
      elapsedMs: 30_000,
    });
    const seed = gradeBlundrRecall({
      previous: null,
      correct: true,
      occurredAt: "2026-08-05T12:00:00.000Z",
    }).card;
    const mature = { ...seed, reps: 8 };
    const easy = event(userAId, {
      correct: true,
      rating: "easy",
      elapsedMs: 4_000,
      prior: mature,
    });
    for (const e of [hard, good, easy]) {
      const r = await service.rpc("blundr_project_learning_evidence_v2", {
        p_user_id: userAId,
        p_event: e,
      });
      assert.equal(r.error, null);
      assert.equal(r.data.reviewRating, e.review_rating);
    }
    const schedules = await service
      .from("blundr_learning_events")
      .select("review_rating,review_projection")
      .in("event_id", [hard.event_id, good.event_id, easy.event_id]);
    assert.equal(schedules.error, null);
    assert.equal(new Set(schedules.data?.map((x) => x.review_rating)).size, 3);
    assert.equal(
      new Set(schedules.data?.map((x) => x.review_projection.dueAt)).size,
      3,
    );

    const impossible = {
      ...event(userAId, { correct: false, rating: "again", elapsedMs: null }),
      review_rating: "easy",
    };
    impossible.fsrs = { ...impossible.fsrs, rating: "easy" };
    const impossibleResult = await service.rpc(
      "blundr_project_learning_evidence_v2",
      { p_user_id: userAId, p_event: impossible },
    );
    assert.ok(impossibleResult.error);
    assert.equal(
      (
        await service
          .from("blundr_learning_events")
          .select("event_id")
          .eq("event_id", impossible.event_id)
      ).data?.length,
      0,
    );
    const duplicate = event(userAId, {
      correct: true,
      rating: "good",
      elapsedMs: 10_000,
    });
    const pair = await Promise.all([
      service.rpc("blundr_project_learning_evidence_v2", {
        p_user_id: userAId,
        p_event: duplicate,
      }),
      service.rpc("blundr_project_learning_evidence_v2", {
        p_user_id: userAId,
        p_event: duplicate,
      }),
    ]);
    assert.ok(pair.every((x) => !x.error));
    assert.equal(
      (
        await service
          .from("blundr_learning_events")
          .select("event_id")
          .eq("event_id", duplicate.event_id)
      ).data?.length,
      1,
    );
    const conflict = {
      ...duplicate,
      authority_fingerprint: duplicate.authority_fingerprint + "-conflict",
      review_rating: "hard",
      fsrs: { ...duplicate.fsrs, rating: "hard" },
    };
    assert.ok(
      (
        await service.rpc("blundr_project_learning_evidence_v2", {
          p_user_id: userAId,
          p_event: conflict,
        })
      ).error,
    );
    const rollback = event(userAId, {
      correct: true,
      rating: "good",
      elapsedMs: 10_000,
      masteryBad: true,
    });
    assert.ok(
      (
        await service.rpc("blundr_project_learning_evidence_v2", {
          p_user_id: userAId,
          p_event: rollback,
        })
      ).error,
    );
    assert.equal(
      (
        await service
          .from("blundr_learning_events")
          .select("event_id")
          .eq("event_id", rollback.event_id)
      ).data?.length,
      0,
    );

    const deckId = `deck-${scope}`,
      sessionId = `session-daily-${scope}`;
    const cards = [0, 1, 2].map((i) => ({
      cardFingerprint: `card-${scope}-${i}`,
      positionKey: `daily-pos-${i}`,
    }));
    const initialState = {
      status: "in_progress",
      currentIndex: 0,
      attempts: [],
      revealedCardIds: [],
      firstAttemptIds: [],
      activityProgress: {},
    };
    const reservation = {
      deck_id: deckId,
      session_id: sessionId,
      deck_fingerprint: `fp-${scope}`,
      public_cards: cards,
      server_cards: cards,
      content_version: "test",
      composer_version: "test",
      runtime_package_id: "test",
      profile_version: "test",
      access_policy_id: "adaptive-daily-v2",
      access_policy_version: "v1",
      time_zone: "UTC",
      state: initialState,
    };
    const reservations = await Promise.all([
      service.rpc("blundr_reserve_daily_v2", {
        p_user_id: userAId,
        p_local_date: "2026-08-06",
        p_reservation: reservation,
      }),
      service.rpc("blundr_reserve_daily_v2", {
        p_user_id: userAId,
        p_local_date: "2026-08-06",
        p_reservation: reservation,
      }),
    ]);
    assert.ok(
      reservations.every((x) => !x.error),
      JSON.stringify(
        reservations.map(
          (x) => x.error && { code: x.error.code, message: x.error.message },
        ),
      ),
    );
    assert.equal(
      (
        await service
          .from("blundr_daily_decks")
          .select("deck_id")
          .eq("user_id", userAId)
          .eq("local_date", "2026-08-06")
      ).data?.length,
      1,
    );
    const actionId = `action-${scope}`,
      cardId = cards[0].cardFingerprint;
    const action = {
      action_id: actionId,
      attempt_id: `attempt-${scope}`,
      card_fingerprint: cardId,
      attempt_kind: "answer",
      outcome: "correct",
      answer: { move: "a1a2" },
      step_id: `${cardId}:0`,
      step_index: 0,
      expected_version: 1,
      next_state: initialState,
      learning_exposure_id: `daily:${sessionId}:${cardId}`,
      learning_event: null,
    };
    const actions = await Promise.all([
      service.rpc("blundr_commit_daily_action_v2", {
        p_user_id: userAId,
        p_session_id: sessionId,
        p_action: action,
      }),
      service.rpc("blundr_commit_daily_action_v2", {
        p_user_id: userAId,
        p_session_id: sessionId,
        p_action: action,
      }),
    ]);
    assert.ok(
      actions.every((x) => !x.error),
      JSON.stringify(
        actions.map(
          (x) => x.error && { code: x.error.code, message: x.error.message },
        ),
      ),
    );
    assert.deepEqual(
      new Set(actions.map((x) => x.data.status)),
      new Set(["inserted", "duplicate"]),
    );
    assert.equal(
      (
        await service
          .from("blundr_daily_attempts")
          .select("attempt_id")
          .eq("user_id", userAId)
          .eq("action_id", actionId)
      ).data?.length,
      1,
    );
    const ownRead = await userA
      .from("blundr_learning_events")
      .select("event_id")
      .eq("user_id", userBId);
    assert.equal(ownRead.error, null);
    assert.equal(ownRead.data?.length, 0);
    const crossWrite = await userA.from("blundr_learning_events").insert({
      ...good,
      event_id: `cross-${scope}`,
      idempotency_key: `cross-${scope}`,
      user_id: userBId,
    });
    assert.ok(crossWrite.error);
    console.log(
      `PR-02 remote authority matrix passed: ratings=4 isolation=passed concurrency=passed rollback=passed reservations=passed skips=0`,
    );
  } finally {
    for (const id of made.reverse()) await service.auth.admin.deleteUser(id);
  }
}
void main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "remote_authority_failed",
  );
  process.exitCode = 1;
});
