import assert from "node:assert/strict";

import { advanceOpeningBranchBuilderTrainingTarget, generateOpeningBranchBuilderTrainingTargetCard } from "../trainingTargets/openingBranchBuilder";
import type { DailyTrainingTargetGenerationContext } from "../trainingTargets/dailyTrainingTargetTypes";

function makeContext(): DailyTrainingTargetGenerationContext {
  return {
    dateKey: "2026-07-02",
    now: "2026-07-02T09:00:00.000Z",
    mastery: null,
    difficulty: "intro",
    currentMastery: 0.12,
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

export function testOpeningBranchBuilder(): void {
  const generated = generateOpeningBranchBuilderTrainingTargetCard(makeContext());
  assert.ok(generated);
  assert.equal(generated?.kind, "training_target");
  assert.equal(generated?.trainingTarget.trainingTargetId, "opening_branch_builder");
  assert.equal(generated?.trainingTarget.interactionKind, "sequence");
  assert.equal(generated?.masteryTargets.length, 2);

  const sequence = generated?.trainingTarget.expectedSequenceUci ?? [];
  assert.ok(sequence.length >= 2);

  let currentState = generated!.trainingTarget;
  for (let index = 0; index < sequence.length; index += 1) {
    const result = advanceOpeningBranchBuilderTrainingTarget(currentState, {
      uci: sequence[index],
      legal: true,
    });
    currentState = result.state;
    assert.equal(result.state.plyCount, index + 1);
    if (index < sequence.length - 1) {
      assert.equal(result.completed, false);
      assert.equal(result.won, false);
    } else {
      assert.equal(result.completed, true);
      assert.equal(result.won, true);
      assert.equal(result.reason, "sequence_complete");
    }
  }

  const revealResult = advanceOpeningBranchBuilderTrainingTarget(generated!.trainingTarget, {
    usedReveal: true,
  });
  assert.equal(revealResult.completed, true);
  assert.equal(revealResult.won, false);
  assert.equal(revealResult.reason, "reviewed_after_reveal");
}

testOpeningBranchBuilder();
console.log("openingBranchBuilder ok");
