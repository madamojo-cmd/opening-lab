import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { gradeBlundrRecall } from "../../lib/blundr/learning/core/blundrFsrs";

const required = [
  "BLUNDR_RLS_TEST_URL",
  "BLUNDR_RLS_TEST_ANON_KEY",
  "BLUNDR_RLS_TEST_SERVICE_ROLE_KEY",
  "BLUNDR_RLS_TEST_ENVIRONMENT_ROLE",
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
const scope = `daily-v3-${randomUUID().slice(0, 8)}`;
const password = "DailyAuthority!2026";
const made: string[] = [];
const initialState = {
  status: "in_progress",
  currentIndex: 0,
  attempts: [],
  revealedCardIds: [],
  firstAttemptIds: [],
  activityProgress: {},
};

type TaskCase = {
  taskType:
    | "daily_move_recall"
    | "daily_candidate_choice"
    | "daily_plan_recall"
    | "daily_continuation_challenge"
    | "daily_same_position_different_route"
    | "daily_punish_the_mistake";
  answer: string;
  interaction: "move" | "choice";
};

type Reserved = {
  userId: string;
  sessionId: string;
  cardId: string;
  card: Record<string, unknown>;
  task: TaskCase;
};

type ActionInput = {
  actionId?: string;
  kind?: "answer" | "reveal" | "retry";
  answer?: string | null;
  expectedVersion?: number;
  learningEvent?: Record<string, unknown> | null;
};

async function createUser(label: string) {
  const created = await service.auth.admin.createUser({
    email: `${label}-${scope}@example.test`,
    password,
    email_confirm: true,
  });
  assert.equal(created.error, null, created.error?.message);
  assert.ok(created.data.user);
  made.push(created.data.user.id);
  return created.data.user.id;
}

async function authenticated(email: string) {
  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const signedIn = await client.auth.signInWithPassword({ email, password });
  assert.equal(signedIn.error, null, signedIn.error?.message);
  return client;
}

async function reserve(
  userId: string,
  task: TaskCase,
  index: number,
  overrides: Record<string, unknown> = {},
): Promise<Reserved> {
  const cardId = `card-${scope}-${index}`;
  const sessionId = `session-${scope}-${index}`;
  const card = {
    cardFingerprint: cardId,
    activityId: task.taskType,
    positionKey: `position-${scope}-${index}`,
    openingId: "italian-white",
    playKey: `e2e4-${scope}-${index}`,
    side: "white",
    interaction: task.interaction,
    acceptedMoves: ["a1a2"],
    ...(task.interaction === "choice"
      ? { acceptedAnswers: [task.answer] }
      : {}),
    ...overrides,
  };
  const reservation = await service.rpc("blundr_reserve_daily_v2", {
    p_user_id: userId,
    p_local_date: `2026-09-${String(index + 1).padStart(2, "0")}`,
    p_reservation: {
      deck_id: `deck-${scope}-${index}`,
      session_id: sessionId,
      deck_fingerprint: `fingerprint-${scope}-${index}`,
      public_cards: [card],
      server_cards: [card],
      content_version: "test",
      composer_version: "test",
      runtime_package_id: "test",
      profile_version: "test",
      access_policy_id: "adaptive-daily-v2",
      access_policy_version: "v1",
      time_zone: "UTC",
      state: initialState,
    },
  });
  assert.equal(reservation.error, null, reservation.error?.message);
  return { userId, sessionId, cardId, card, task };
}

function expectedAnswer(reserved: Reserved) {
  return (reserved.card.acceptedAnswers as string[] | undefined)?.[0] ?? "a1a2";
}

function learningEvent(
  reserved: Reserved,
  input: {
    actionId: string;
    attemptId: string;
    answer: string | null;
    correct: boolean;
    kind: "answer" | "reveal";
    dailyEvidence: Record<string, unknown>;
  },
) {
  const fsrs = gradeBlundrRecall({
    previous: null,
    correct: input.correct,
    occurredAt: "2026-08-06T12:00:00.000Z",
    hinted: input.kind === "reveal",
    elapsedMs: input.kind === "reveal" ? null : 9_000,
  });
  const rating = fsrs.rating;
  if (input.kind === "reveal") assert.equal(rating, "again");
  const positionKey = String(reserved.card.positionKey);
  const playKey = String(reserved.card.playKey);
  return {
    event_id: `event-${input.actionId}`,
    user_id: reserved.userId,
    idempotency_key: `event-key-${input.actionId}`,
    schema_version: "2026-07-13.v1",
    session_id: reserved.sessionId,
    attempt_id: input.attemptId,
    occurred_at: "2026-08-06T12:00:00.000Z",
    taxonomy:
      input.kind === "reveal"
        ? "cue_revealed"
        : input.correct
          ? "move_correct"
          : "move_incorrect",
    position_key: positionKey,
    canonical_fen: "8/8/8/8/8/8/8/K6k w - - 0 1",
    opening_id: "italian-white",
    expected_move_uci: "a1a2",
    // Opaque option, plan, continuation, and route answers are deliberately
    // not coerced into chess moves.
    played_move_uci:
      reserved.task.interaction === "move" && input.kind === "answer"
        ? input.answer
        : null,
    repertoire_side: "white",
    move_order_key: playKey,
    source: "daily",
    first_attempt: true,
    finding: input.correct
      ? null
      : { category: "opening_move", explanation: "test miss" },
    content_version: "daily-v3-authority-test",
    classifier_version: "weakness-classifier-v1",
    evidence_kind: "recall_attempt",
    exposure_id: `exposure-${input.actionId}`,
    evidence_version: "blundr-learning-evidence-v2",
    authority_fingerprint: `authority-${input.actionId}`,
    correct: input.correct,
    review_rating: rating,
    answer_evidence: {
      evidenceType: input.kind,
      submittedAnswer: input.answer,
      expectedAnswerIdentity: "a1a2",
      correct: input.correct,
      firstAttempt: true,
      retry: false,
      revealOccurred: input.kind === "reveal",
      hinted: input.kind === "reveal",
      elapsedMs: input.kind === "reveal" ? null : 9_000,
      priorReps: 0,
      taskId: input.attemptId,
      reservationId: reserved.sessionId,
    },
    access_decision: "active",
    fsrs: {
      ...fsrs,
      algorithmVersion: "blundr-fsrs-v1",
      desiredRetention: 0.9,
    },
    mastery: {
      recallAttemptCount: 1,
      correctRecallCount: input.correct ? 1 : 0,
      lapseCount: input.correct ? 0 : 1,
      state: input.correct ? "learning" : "weak",
    },
    expected_review_state_version: 0,
    expected_mastery_state_version: 0,
    task_evidence: input.dailyEvidence,
  };
}

function action(reserved: Reserved, input: ActionInput = {}) {
  const kind = input.kind ?? "answer";
  const answer =
    input.answer ?? (kind === "answer" ? expectedAnswer(reserved) : null);
  const correct = kind === "answer" && answer === expectedAnswer(reserved);
  const outcome =
    kind === "reveal"
      ? "revealed"
      : kind === "retry"
        ? "skipped"
        : correct
          ? "correct"
          : "incorrect";
  const actionId =
    input.actionId ?? `action-${scope}-${reserved.cardId}-${kind}`;
  const dailyEvidence = {
    taskType: reserved.task.taskType,
    submittedAnswerIdentity: answer,
    expectedTaskAnswerIdentity: expectedAnswer(reserved),
    correct,
    canonicalTarget: {
      positionKey: reserved.card.positionKey,
      openingId: "italian-white",
      playKey: reserved.card.playKey,
      expectedMoveUci: "a1a2",
    },
  };
  const event =
    kind === "retry"
      ? null
      : input.learningEvent === undefined
        ? learningEvent(reserved, {
            actionId,
            attemptId: `attempt-${actionId}`,
            answer,
            correct,
            kind: kind === "reveal" ? "reveal" : "answer",
            dailyEvidence,
          })
        : input.learningEvent;
  return {
    action_id: actionId,
    attempt_id: `attempt-${actionId}`,
    card_fingerprint: reserved.cardId,
    attempt_kind: kind,
    outcome,
    answer,
    step_id: `${reserved.cardId}:0`,
    step_index: 0,
    expected_version: input.expectedVersion ?? 1,
    next_state: initialState,
    learning_exposure_id: `daily:${reserved.sessionId}:${reserved.cardId}`,
    learning_event: event,
    daily_evidence: dailyEvidence,
  };
}

async function commit(reserved: Reserved, input: ActionInput = {}) {
  return service.rpc("blundr_commit_daily_action_v3", {
    p_user_id: reserved.userId,
    p_session_id: reserved.sessionId,
    p_action: action(reserved, input),
  });
}

async function main() {
  try {
    const userAId = await createUser("daily-v3-a");
    const userBId = await createUser("daily-v3-b");
    const userA = await authenticated(`daily-v3-a-${scope}@example.test`);

    const taskCases: TaskCase[] = [
      { taskType: "daily_move_recall", answer: "a1a2", interaction: "move" },
      {
        taskType: "daily_candidate_choice",
        answer: "option-primary",
        interaction: "choice",
      },
      {
        taskType: "daily_plan_recall",
        answer: "plan-primary",
        interaction: "choice",
      },
      {
        taskType: "daily_continuation_challenge",
        answer: "continuation-primary",
        interaction: "choice",
      },
      {
        taskType: "daily_same_position_different_route",
        answer: "route-primary",
        interaction: "choice",
      },
    ];

    for (const [index, task] of taskCases.entries()) {
      const reserved = await reserve(userAId, task, index);
      const first = await commit(reserved);
      assert.equal(first.error, null, first.error?.message);
      const duplicate = await commit(reserved);
      assert.equal(duplicate.error, null, duplicate.error?.message);
      assert.equal(duplicate.data?.status, "duplicate");
    }

    const taskEvidence = await service
      .from("blundr_daily_task_evidence_v3")
      .select("task_type,submitted_answer_identity,learning_event_id")
      .eq("user_id", userAId);
    assert.equal(taskEvidence.error, null, taskEvidence.error?.message);
    assert.equal(taskEvidence.data?.length, taskCases.length);
    assert.equal(
      taskEvidence.data?.find(
        (row) => row.task_type === "daily_candidate_choice",
      )?.submitted_answer_identity,
      "option-primary",
    );
    assert.ok(taskEvidence.data?.every((row) => row.learning_event_id));

    const opaqueEvents = await service
      .from("blundr_learning_events")
      .select("played_move_uci")
      .eq("user_id", userAId)
      .in("move_order_key", [
        `e2e4-${scope}-1`,
        `e2e4-${scope}-2`,
        `e2e4-${scope}-3`,
        `e2e4-${scope}-4`,
      ]);
    assert.equal(opaqueEvents.error, null, opaqueEvents.error?.message);
    assert.ok(opaqueEvents.data?.every((row) => row.played_move_uci === null));

    const concurrentReserved = await reserve(userAId, taskCases[0], 5);
    const concurrent = await Promise.all([
      commit(concurrentReserved),
      commit(concurrentReserved),
    ]);
    assert.ok(
      concurrent.every((result) => !result.error),
      "concurrent duplicate must resolve without a second mutation",
    );
    assert.deepEqual(
      new Set(concurrent.map((result) => result.data?.status)),
      new Set(["inserted", "duplicate"]),
    );

    const conflictReserved = await reserve(userAId, taskCases[0], 6);
    const conflictAction = action(conflictReserved);
    assert.equal((await commit(conflictReserved)).error, null);
    const conflict = await service.rpc("blundr_commit_daily_action_v3", {
      p_user_id: userAId,
      p_session_id: conflictReserved.sessionId,
      p_action: { ...conflictAction, answer: "a1b1", outcome: "incorrect" },
    });
    assert.ok(conflict.error, "conflicting duplicate must fail");

    const staleReserved = await reserve(userAId, taskCases[0], 7);
    const stale = await commit(staleReserved, { expectedVersion: 9 });
    assert.ok(stale.error, "stale reservation version must fail");

    const crossReserved = await reserve(userAId, taskCases[0], 8);
    const cross = await service.rpc("blundr_commit_daily_action_v3", {
      p_user_id: userBId,
      p_session_id: crossReserved.sessionId,
      p_action: action(crossReserved),
    });
    assert.ok(cross.error, "cross-user reservation access must fail");

    const directReserved = await reserve(userAId, taskCases[0], 9);
    const direct = await userA.rpc("blundr_commit_daily_action_v3", {
      p_user_id: userAId,
      p_session_id: directReserved.sessionId,
      p_action: action(directReserved),
    });
    assert.ok(direct.error, "authenticated direct authority must fail");

    const revealReserved = await reserve(userAId, taskCases[0], 10);
    const revealed = await commit(revealReserved, { kind: "reveal" });
    assert.equal(revealed.error, null, revealed.error?.message);
    const retry = await commit(revealReserved, {
      kind: "retry",
      actionId: `retry-${scope}`,
      expectedVersion: 2,
    });
    assert.equal(retry.error, null, retry.error?.message);
    const revealEvidence = await service
      .from("blundr_daily_task_evidence_v3")
      .select("outcome,first_attempt,reveal_occurred,retry")
      .eq("user_id", userAId)
      .eq("session_id", revealReserved.sessionId)
      .order("created_at");
    assert.equal(revealEvidence.error, null, revealEvidence.error?.message);
    assert.deepEqual(
      revealEvidence.data?.map((row) => [
        row.outcome,
        row.first_attempt,
        row.reveal_occurred,
        row.retry,
      ]),
      [
        ["revealed", true, true, false],
        ["skipped", false, false, true],
      ],
    );

    const retryReserved = await reserve(userAId, taskCases[0], 13);
    const incorrect = await commit(retryReserved, {
      actionId: `incorrect-${scope}`,
      answer: "a1b1",
    });
    assert.equal(incorrect.error, null, incorrect.error?.message);
    const corrected = await commit(retryReserved, {
      actionId: `corrected-${scope}`,
      answer: "a1a2",
      expectedVersion: 2,
      learningEvent: null,
    });
    assert.equal(corrected.error, null, corrected.error?.message);
    const retryAttempts = await service
      .from("blundr_daily_attempts")
      .select("first_attempt,outcome")
      .eq("session_id", retryReserved.sessionId)
      .order("created_at");
    assert.equal(retryAttempts.error, null, retryAttempts.error?.message);
    assert.deepEqual(
      retryAttempts.data?.map((row) => [row.first_attempt, row.outcome]),
      [
        [true, "incorrect"],
        [false, "correct"],
      ],
      "a teaching retry cannot rewrite failed first-attempt evidence",
    );

    const badReserved = await reserve(userAId, taskCases[0], 11);
    const malformed = await commit(badReserved, { learningEvent: null });
    assert.ok(malformed.error, "first answer requires a valid learning event");
    const noAttempt = await service
      .from("blundr_daily_attempts")
      .select("attempt_id")
      .eq("session_id", badReserved.sessionId);
    assert.equal(noAttempt.error, null, noAttempt.error?.message);
    assert.equal(
      noAttempt.data?.length,
      0,
      "failed projection rolls back attempt",
    );

    const fixReserved = await reserve(
      userAId,
      {
        taskType: "daily_punish_the_mistake",
        answer: "a1a2",
        interaction: "move",
      },
      12,
    );
    const missingMistake = await commit(fixReserved);
    assert.ok(
      missingMistake.error,
      "Fix the Mistake requires documented evidence",
    );

    console.log(
      "Daily v3 remote authority passed: task_types=5 opaque_answers=passed ownership=passed idempotency=passed stale=passed reveal_retry=passed rollback=passed documented_mistake=passed skips=0",
    );
  } finally {
    for (const id of made.reverse()) await service.auth.admin.deleteUser(id);
  }
}

void main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "daily_v3_authority_failed",
  );
  process.exitCode = 1;
});
