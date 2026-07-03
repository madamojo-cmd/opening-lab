import assert from "node:assert/strict";

import { advanceKeySquareClickTrainingTarget, generateKeySquareClickTrainingTargetCard } from "../trainingTargets/keySquareClick";
import type { DailyTrainingTargetGenerationContext } from "../trainingTargets/dailyTrainingTargetTypes";

function makeContext(): DailyTrainingTargetGenerationContext {
  return {
    dateKey: "2026-07-02",
    now: "2026-07-02T09:00:00.000Z",
    mastery: null,
    difficulty: "intro",
    currentMastery: 0.14,
    confidence: 0.2,
    dueReviewCount: 0,
    selectedReviewCount: 0,
    reviewCards: [],
    reviewAttempts: [],
    candidateDailyCards: [],
    recentTrainingTargetIds: [],
    recentFenKeys: [],
    sessionTrainingTargetIds: [],
  };
}

export function testKeySquareClick(): void {
  const generated = generateKeySquareClickTrainingTargetCard(makeContext());
  assert.ok(generated);
  assert.equal(generated?.kind, "training_target");
  assert.equal(generated?.trainingTarget.trainingTargetId, "key_square_click");
  assert.equal(generated?.trainingTarget.interactionKind, "square_click");
  assert.equal(generated?.masteryTargets.length, 2);

  const correctSquare = generated?.trainingTarget.correctSquareKeys?.[0] ?? generated?.trainingTarget.targetSquares?.[0] ?? null;
  assert.ok(correctSquare);

  const correctResult = advanceKeySquareClickTrainingTarget(generated!.trainingTarget, {
    square: correctSquare,
  });
  assert.equal(correctResult.completed, true);
  assert.equal(correctResult.won, true);
  assert.equal(correctResult.reason, "key_square_found");

  const wrongResult = advanceKeySquareClickTrainingTarget(generated!.trainingTarget, {
    square: "a1",
  });
  assert.equal(wrongResult.completed, true);
  assert.equal(wrongResult.won, false);
  assert.ok(wrongResult.reason === "wrong_square" || wrongResult.reason === "nearby_square");
}

testKeySquareClick();
console.log("keySquareClick ok");
