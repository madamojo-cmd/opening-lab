import assert from "node:assert/strict";

import { validateGeneratedTrainingTargets, validateTrainingTargetCard, validateTrainingTargetRegistry } from "../validation/dailyTrainingTargetValidation";
import { makeTrainingTargetContext, makeValidTrainingTargetCards } from "./dailyValidationFixtures";

export function testDailyTrainingTargetValidation(): void {
  assert.ok(validateTrainingTargetRegistry().valid);

  const cards = makeValidTrainingTargetCards();
  assert.equal(cards.length, 5);
  for (const card of cards) {
    assert.ok(validateTrainingTargetCard(card).valid);
  }

  assert.ok(validateGeneratedTrainingTargets(makeTrainingTargetContext()).valid);

  const multipleChoiceMissingCorrect = validateTrainingTargetCard({
    ...cards[0]!,
    trainingTarget: {
      ...cards[0]!.trainingTarget,
      interactionKind: "multiple_choice",
      candidateMoves: (cards[0]!.trainingTarget.candidateMoves ?? []).map((candidate) => ({
        ...candidate,
        isCorrect: false,
      })),
    },
  });
  assert.ok(!multipleChoiceMissingCorrect.valid);
  assert.ok(multipleChoiceMissingCorrect.issues.some((issue) => issue.code === "missing_correct_multiple_choice"));

  const squareClickMissingTarget = validateTrainingTargetCard({
    ...cards[4]!,
    trainingTarget: {
      ...cards[4]!.trainingTarget,
      correctSquareKeys: [],
      targetSquares: [],
    },
  });
  assert.ok(!squareClickMissingTarget.valid);
  assert.ok(squareClickMissingTarget.issues.some((issue) => issue.code === "missing_square_targets"));

  const sequenceMissingLength = validateTrainingTargetCard({
    ...cards[1]!,
    trainingTarget: {
      ...cards[1]!.trainingTarget,
      interactionKind: "sequence",
      expectedSequenceUci: ["e2e4"],
    },
  });
  assert.ok(!sequenceMissingLength.valid);
  assert.ok(sequenceMissingLength.issues.some((issue) => issue.code === "missing_sequence"));
}

testDailyTrainingTargetValidation();
console.log("dailyTrainingTargetValidation ok");
