import assert from "node:assert/strict";

import {
  containsAnswerBearingPresentationKeys,
  toAnswerFreeMiniGameScenario,
  toAnswerFreeTrainingTarget,
} from "../core/dailyAnswerSafety";
import type { DailyMiniGameScenario } from "../miniGames/dailyMiniGameTypes";
import type { DailyTrainingTargetState } from "../trainingTargets/dailyTrainingTargetTypes";

function testAnswerSafetyProjection(): void {
  const trainingTarget = {
    interactionKind: "multiple_choice",
    expectedMoveUci: "e2e4",
    expectedMoveSan: "e4",
    expectedSequenceUci: ["e2e4"],
    targetSquares: ["e4"],
    correctSquareKeys: ["e4"],
    candidateMoves: [
      {
        uci: "e2e4",
        san: "e4",
        label: "Choice A",
        isCorrect: true,
        explanation: "Best",
      },
      {
        uci: "d2d4",
        san: "d4",
        label: "Choice B",
        isCorrect: false,
        explanation: "Inferior",
      },
    ],
  } as unknown as DailyTrainingTargetState;
  const safeTarget = toAnswerFreeTrainingTarget(trainingTarget);
  assert.equal(containsAnswerBearingPresentationKeys(safeTarget), false);
  assert.deepEqual(safeTarget.candidateMoves, [
    { uci: "e2e4", san: "e4", label: "Choice A" },
    { uci: "d2d4", san: "d4", label: "Choice B" },
  ]);

  const scenario = {
    acceptedMoves: ["e2e4"],
    solution: { uci: "e2e4", san: "e4" },
    targetSquares: ["e4"],
    goalSquares: ["e4"],
    acceptedSquares: ["e4"],
    candidateMoves: [
      { uci: "e2e4", san: "e4", label: "Choice", correct: true },
    ],
    id: "scenario",
    miniGameId: "tactic_shots",
    source: "daily_deck",
    seed: "seed",
    generatedAt: "2026-07-13T00:00:00.000Z",
    createdAt: "2026-07-13T00:00:00.000Z",
    fen: "8/8/8/8/8/8/4K3/4k3 w - - 0 1",
    sideToMove: "w",
    prompt: "Solve",
    instructions: "Solve",
    goal: "Solve",
    explanation: "Explanation",
    conceptTags: [],
    difficulty: "beginner",
    estimatedTimeSeconds: 10,
    validation: {
      checkedAt: "2026-07-13T00:00:00.000Z",
      valid: true,
      attempts: 1,
      issues: [],
    },
    scoring: {
      mode: "single_move",
      maxAttempts: 1,
      revealPenalty: 1,
      canRetry: true,
      correctMoveReward: 1,
    },
    retryBehavior: {
      allowRetry: true,
      refreshSeedOnRetry: true,
      nextLabel: "Next",
    },
    revealBehavior: { revealLabel: "Reveal", continueLabel: "Continue" },
    novelty: {
      scenarioKey: "scenario",
      cooldownGroup: "tactic",
      recentScenarioKeys: [],
      avoidedRepeat: true,
    },
    theme: "tactic",
  } as unknown as DailyMiniGameScenario;
  assert.equal(
    containsAnswerBearingPresentationKeys(
      toAnswerFreeMiniGameScenario(scenario),
    ),
    false,
  );
}

testAnswerSafetyProjection();
console.log("dailyAnswerSafety ok");
