import assert from "node:assert/strict";

import { advanceBreakTimingDrillTrainingTarget, generateBreakTimingDrillTrainingTargetCard } from "../trainingTargets/breakTimingDrill";
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

export function testBreakTimingDrill(): void {
  const generated = generateBreakTimingDrillTrainingTargetCard(makeContext());
  assert.ok(generated);
  assert.equal(generated?.kind, "training_target");
  assert.equal(generated?.trainingTarget.trainingTargetId, "break_timing_drill");
  assert.ok(generated?.trainingTarget.interactionKind === "move_input" || generated?.trainingTarget.interactionKind === "multiple_choice");
  assert.equal(generated?.masteryTargets.length, 2);
  assert.ok(generated?.trainingTarget.expectedMoveUci);

  const correctResult = advanceBreakTimingDrillTrainingTarget(generated!.trainingTarget, {
    uci: generated!.trainingTarget.expectedMoveUci,
    legal: true,
  });
  assert.equal(correctResult.completed, true);
  assert.equal(correctResult.won, true);
  assert.equal(correctResult.reason, "found_break");

  const revealResult = advanceBreakTimingDrillTrainingTarget(generated!.trainingTarget, {
    usedReveal: true,
  });
  assert.equal(revealResult.completed, true);
  assert.equal(revealResult.won, false);
  assert.equal(revealResult.reason, "reviewed_after_reveal");
}

testBreakTimingDrill();
console.log("breakTimingDrill ok");
