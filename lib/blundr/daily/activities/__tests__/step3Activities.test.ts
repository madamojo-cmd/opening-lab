import assert from "node:assert/strict";
import test from "node:test";
import {
  hasSolutionBearingFields,
  FEATURE_FLAGS,
} from "@/lib/blundr/contracts";
import {
  validateAnswerSafePresentation,
  rejection,
} from "@/lib/blundr/daily/core/dailyActivityConformance";
import { answerSafePresentation } from "../activityPresentation";
import {
  buildCandidateSet,
  validateCandidateSet,
  initialCandidateChoiceState,
  reduceCandidateChoice,
} from "../candidateChoice";
import {
  approvedPlanEvidence,
  buildPlanRecall,
  initialPlanRecallState,
  reducePlanRecall,
} from "../planRecall";
import {
  buildTranspositionActivity,
  initialTranspositionState,
  reduceTransposition,
  validateTranspositionActivity,
} from "../samePositionDifferentRoute";
import {
  buildContinuationChallenge,
  initialContinuationState,
  reduceContinuation,
  scoreContinuation,
} from "../continuationChallenge";
import {
  buildPunishmentActivity,
  initialPunishmentState,
  reducePunishment,
  scorePunishment,
} from "../punishTheMistake";
import { registerStep3Activities } from "../registerStep3Activities";

const startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const active = {
  decision: "active",
  checkedAt: new Date().toISOString(),
  expiresAt: null,
};

test("shared activity conformance rejects unsafe payloads and keeps flags off", () => {
  assert.equal(
    Object.values(FEATURE_FLAGS).every((flag) => flag === false),
    true,
  );
  const presentation = answerSafePresentation({
    build: { activityId: "x", cardFingerprint: "c", positionKey: "p" },
    positionFen: startFen,
    prompt: "Choose a move",
    options: [{ id: "a", label: "e4" }],
  });
  assert.deepEqual(validateAnswerSafePresentation(presentation), []);
  assert.equal(hasSolutionBearingFields(presentation), false);
  assert.equal(rejection("unsupported_objective", "no").ok, false);
});

test("candidate choice enforces legal three-way contrast and immutable reveal/retry", () => {
  const built = buildCandidateSet({
    userId: "u",
    openingId: "italian-white",
    side: "white",
    positionKey: "p",
    positionFen: startFen,
    approvedMoves: ["e2e4"],
    mistakeMove: "d2d4",
    alternativeMove: "g1f3",
    access: active,
  });
  assert.equal(built.ok, true);
  if (!built.ok) return;
  assert.deepEqual(validateCandidateSet(startFen, built.solution), []);
  const presentation = answerSafePresentation({
    build: built,
    positionFen: startFen,
    prompt: "Choose the practical move",
    options: built.solution.candidates.map((candidate) => ({
      id: candidate.id,
      label: candidate.label,
    })),
  });
  assert.equal(hasSolutionBearingFields(presentation), false);
  const revealed = reduceCandidateChoice(
    reduceCandidateChoice(initialCandidateChoiceState(), {
      type: "select",
      id: built.solution.acceptedIds[0],
    }),
    { type: "reveal", now: "2026-07-14T00:00:00Z", solution: built.solution },
  );
  assert.equal(revealed.firstAttempt, "reveal");
  const retry = reduceCandidateChoice(revealed, { type: "retry" });
  assert.equal(retry.firstAttempt, "reveal");
  assert.equal(retry.retryCount, 1);
  const rejected = buildCandidateSet({
    userId: "u",
    openingId: "italian-white",
    side: "white",
    positionKey: "p",
    positionFen: startFen,
    approvedMoves: ["e2e4"],
    mistakeMove: "e2e4",
    alternativeMove: "g1f3",
    access: active,
  });
  assert.equal(rejected.ok, false);
});

test("plan recall accepts curated multiple answers and emits no answer fields", () => {
  const built = buildPlanRecall({
    openingId: "italian-white",
    side: "white",
    positionKey: "p2",
    positionFen: startFen,
    access: active,
    question: {
      type: "key_square",
      prompt: "Which square supports the plan?",
      choices: [
        { id: "d4", label: "d4" },
        { id: "e4", label: "e4" },
      ],
      acceptedIds: ["d4", "e4"],
      validForFen: true,
      evidence: approvedPlanEvidence({
        sourceId: "packet-1",
        type: "key_square",
      }),
      explanation:
        "Both squares support the approved plan in this exact position.",
    },
  });
  assert.equal(built.ok, true);
  if (!built.ok) return;
  const presentation = answerSafePresentation({
    build: built,
    positionFen: startFen,
    prompt: built.solution.question.prompt,
    options: built.solution.question.choices,
  });
  assert.equal(hasSolutionBearingFields(presentation), false);
  const state = reducePlanRecall(initialPlanRecallState(), {
    type: "select",
    id: "e4",
  });
  const result = reducePlanRecall(state, {
    type: "submit",
    now: "2026-07-14T00:00:00Z",
    solution: built.solution,
  });
  assert.equal(result.firstAttempt, "correct");
});

test("same position different route requires legal distinct routes", () => {
  const standard = ["e2e4", "e7e5", "g1f3"];
  const alternate = ["g1f3", "e7e5", "e2e4"];
  const built = buildTranspositionActivity({
    openingId: "italian-white",
    side: "white",
    positionKey: "p3",
    startFen,
    standardRoute: standard,
    alternateRoute: alternate,
    expectedMoves: ["b1c3"],
    access: active,
    sourceId: "transposition-1",
  });
  assert.equal(built.ok, true);
  if (!built.ok) return;
  assert.deepEqual(validateTranspositionActivity(startFen, built.solution), []);
  const state = reduceTransposition(initialTranspositionState(), {
    type: "move",
    uci: "b1c3",
  });
  const result = reduceTransposition(state, {
    type: "submit",
    now: "2026-07-14T00:00:00Z",
    solution: built.solution,
  });
  assert.equal(result.firstAttempt, "correct");
});

test("continuation challenge counts user moves and keeps legal progress active", () => {
  const built = buildContinuationChallenge({
    openingId: "italian-white",
    side: "white",
    positionKey: "p4",
    access: active,
    objective: "complete_development",
    userMoves: ["g1f3", "f1c4", "e1g1"],
    opponentReplies: ["b8c6", "g8f6", "f8c5"],
    sourceId: "continuation-1",
    evidenceVerified: true,
  });
  assert.equal(built.ok, true);
  if (!built.ok) return;
  let state = initialContinuationState();
  state = reduceContinuation(state, {
    type: "user_move",
    uci: "g1f3",
    now: "2026-07-14T00:00:00Z",
    solution: built.solution,
  });
  assert.equal(state.userMoveCount, 1);
  assert.equal(state.state, "in_progress");
  state = reduceContinuation(state, {
    type: "user_move",
    uci: "f1c4",
    now: "2026-07-14T00:01:00Z",
    solution: built.solution,
  });
  state = reduceContinuation(state, {
    type: "user_move",
    uci: "e1g1",
    now: "2026-07-14T00:02:00Z",
    solution: built.solution,
  });
  assert.equal(state.state, "completed");
  assert.deepEqual(
    scoreContinuation({
      objectiveScore: state.objectiveScore,
      moveQualityScore: state.moveQualityScore,
      requiredMoves: 3,
    }),
    { objectiveScore: 1, moveQualityScore: 1 },
  );
});

test("punish the mistake validates a reversible legal response sequence", () => {
  const built = buildPunishmentActivity({
    openingId: "italian-white",
    side: "white",
    positionKey: "p5",
    fen: startFen,
    mistakeMove: "d7d5",
    bestResponses: ["e2e4"],
    continuation: ["e7e5"],
    sourceId: "game-1",
    source: "imported_game",
    access: active,
    evidenceVerified: true,
    explanation: "The response takes space and keeps the initiative.",
  });
  assert.equal(built.ok, true);
  if (!built.ok) return;
  let state = initialPunishmentState();
  state = reducePunishment(state, {
    type: "move",
    uci: "e2e4",
    now: "2026-07-14T00:00:00Z",
    solution: built.solution,
  });
  state = reducePunishment(state, {
    type: "move",
    uci: "e7e5",
    now: "2026-07-14T00:01:00Z",
    solution: built.solution,
  });
  assert.equal(state.firstAttempt, "correct");
  assert.deepEqual(
    scorePunishment(state.sequence, built.solution).correct,
    true,
  );
});

test("Step 3 registrations are opt-in and register all five without duplicates", () => {
  const registered = registerStep3Activities({
    daily_candidate_choice: true,
    daily_plan_recall: true,
    daily_same_position_different_route: true,
    daily_continuation_challenge: true,
    daily_punish_the_mistake: true,
  });
  assert.equal(registered.length, 5);
  assert.equal(
    registerStep3Activities({ daily_candidate_choice: true }).length,
    0,
  );
});
