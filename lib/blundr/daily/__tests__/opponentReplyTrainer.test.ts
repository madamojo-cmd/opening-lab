import assert from "node:assert/strict";

import { advanceOpponentReplyTrainerTrainingTarget, generateOpponentReplyTrainerTrainingTargetCard } from "../trainingTargets/opponentReplyTrainer";
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

export function testOpponentReplyTrainer(): void {
  const generated = generateOpponentReplyTrainerTrainingTargetCard(makeContext());
  assert.ok(generated);
  assert.equal(generated?.kind, "training_target");
  assert.equal(generated?.trainingTarget.trainingTargetId, "opponent_reply_trainer");
  assert.ok(generated?.trainingTarget.interactionKind === "multiple_choice" || generated?.trainingTarget.interactionKind === "move_input");
  assert.equal(generated?.masteryTargets.length, 2);

  const correctChoice = generated?.trainingTarget.candidateMoves?.find((move) => move.isCorrect)?.uci ?? generated?.trainingTarget.expectedMoveUci ?? null;
  assert.ok(correctChoice);

  const correctResult = advanceOpponentReplyTrainerTrainingTarget(generated!.trainingTarget, {
    choiceUci: correctChoice,
    legal: true,
  });
  assert.equal(correctResult.completed, true);
  assert.equal(correctResult.won, true);
  assert.equal(correctResult.reason, "matched_common_reply");

  const wrongChoice = generated?.trainingTarget.candidateMoves?.find((move) => !move.isCorrect)?.uci ?? null;
  if (wrongChoice) {
    const wrongResult = advanceOpponentReplyTrainerTrainingTarget(generated!.trainingTarget, {
      choiceUci: wrongChoice,
      legal: true,
    });
    assert.equal(wrongResult.completed, true);
    assert.equal(wrongResult.won, false);
    assert.equal(wrongResult.reason, "wrong_reply_pattern");
  }
}

testOpponentReplyTrainer();
console.log("opponentReplyTrainer ok");
