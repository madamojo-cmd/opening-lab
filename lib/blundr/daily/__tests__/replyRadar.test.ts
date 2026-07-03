import assert from "node:assert/strict";

import { advanceReplyRadarTrainingTarget, generateReplyRadarTrainingTargetCard } from "../trainingTargets/replyRadar";
import type { DailyTrainingTargetGenerationContext } from "../trainingTargets/dailyTrainingTargetTypes";

function makeContext(): DailyTrainingTargetGenerationContext {
  return {
    dateKey: "2026-07-02",
    now: "2026-07-02T09:00:00.000Z",
    mastery: null,
    difficulty: "intro",
    currentMastery: 0.12,
    confidence: 0.18,
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

export function testReplyRadar(): void {
  const generated = generateReplyRadarTrainingTargetCard(makeContext());
  assert.ok(generated);
  assert.equal(generated?.kind, "training_target");
  assert.equal(generated?.trainingTarget.trainingTargetId, "reply_radar");
  assert.equal(generated?.trainingTarget.interactionKind, "multiple_choice");
  assert.ok((generated?.trainingTarget.candidateMoves?.length ?? 0) >= 2);
  assert.equal(generated?.masteryTargets.length, 2);

  const correctChoice = generated?.trainingTarget.candidateMoves?.find((move) => move.isCorrect)?.uci ?? generated?.trainingTarget.expectedMoveUci ?? null;
  assert.ok(correctChoice);

  const correctResult = advanceReplyRadarTrainingTarget(generated!.trainingTarget, {
    choiceUci: correctChoice,
    legal: true,
  });
  assert.equal(correctResult.completed, true);
  assert.equal(correctResult.won, true);
  assert.equal(correctResult.reason, "matched_expected_reply");

  const wrongChoice = generated?.trainingTarget.candidateMoves?.find((move) => !move.isCorrect)?.uci ?? null;
  assert.ok(wrongChoice);

  const wrongResult = advanceReplyRadarTrainingTarget(generated!.trainingTarget, {
    choiceUci: wrongChoice,
    legal: true,
  });
  assert.equal(wrongResult.completed, true);
  assert.equal(wrongResult.won, false);
  assert.equal(wrongResult.reason, "wrong_reply_pattern");
}

testReplyRadar();
console.log("replyRadar ok");
