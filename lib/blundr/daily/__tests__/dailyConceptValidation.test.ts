import assert from "node:assert/strict";

import { validateConceptIds, validateConceptRegistry, validateDailyCardConcepts } from "../validation/dailyConceptValidation";
import { makeValidRecallCard } from "./dailyValidationFixtures";

export function testDailyConceptValidation(): void {
  assert.ok(validateConceptRegistry().valid);

  const validConceptIds = validateConceptIds(["concept:tactical_ideas:fork"]);
  assert.ok(validConceptIds.valid);

  const unknownConceptIds = validateConceptIds(["concept:tactical_ideas:not_real"]);
  assert.ok(!unknownConceptIds.valid);
  assert.ok(unknownConceptIds.issues.some((issue) => issue.code === "unknown_concept_id"));

  const card = makeValidRecallCard();
  assert.ok(validateDailyCardConcepts(card).valid);

  const primaryMismatch = validateDailyCardConcepts({
    ...card,
    conceptIds: ["concept:tactical_ideas:fork"],
    primaryConceptId: "concept:tactical_ideas:pin",
  });
  assert.ok(!primaryMismatch.valid);
  assert.ok(primaryMismatch.issues.some((issue) => issue.code === "primary_concept_not_tagged"));
}

testDailyConceptValidation();
console.log("dailyConceptValidation ok");

