import assert from "node:assert/strict";

import { validateDailyCard, validateDailyCards } from "../validation/dailyCardValidation";
import { makeSampleDeckCards, makeValidMiniGameCards, makeValidRecallCard, makeValidTrainingTargetCards } from "./dailyValidationFixtures";

export function testDailyCardValidation(): void {
  const recallCard = makeValidRecallCard();
  assert.ok(validateDailyCard(recallCard).valid);

  const miniGameCard = makeValidMiniGameCards()[0]!;
  assert.ok(validateDailyCard(miniGameCard).valid);

  const trainingTargetCard = makeValidTrainingTargetCards()[0]!;
  assert.ok(validateDailyCard(trainingTargetCard).valid);

  const missingCardKey = validateDailyCard({
    ...recallCard,
    cardKey: "",
  } as typeof recallCard);
  assert.ok(!missingCardKey.valid);
  assert.ok(missingCardKey.issues.some((issue) => issue.code === "missing_card_key"));

  const invalidConceptId = validateDailyCard({
    ...recallCard,
    conceptIds: ["concept:tactical_ideas:not_real"],
    primaryConceptId: "concept:tactical_ideas:not_real" as never,
    conceptMasteryKeys: ["concept:tactical_ideas:not_real:mastery"],
  });
  assert.ok(!invalidConceptId.valid);
  assert.ok(invalidConceptId.issues.some((issue) => issue.code === "unknown_concept_id"));

  const legacyRecallCard = {
    ...recallCard,
  };
  delete legacyRecallCard.conceptIds;
  delete legacyRecallCard.primaryConceptId;
  delete legacyRecallCard.conceptMasteryKeys;
  assert.ok(validateDailyCard(legacyRecallCard).valid);

  assert.ok(validateDailyCards(makeSampleDeckCards()).valid);
}

testDailyCardValidation();
console.log("dailyCardValidation ok");
