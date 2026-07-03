import assert from "node:assert/strict";

import {
  assertDailyConceptRegistryIsValid,
  getAllDailyConcepts,
  getDailyConceptsByDomain,
} from "../concepts/dailyConceptRegistry";

export function testDailyConceptRegistry(): void {
  assert.doesNotThrow(() => assertDailyConceptRegistryIsValid());

  const allConcepts = getAllDailyConcepts();
  assert.equal(allConcepts.length, 68);

  assert.equal(getDailyConceptsByDomain("pawn_structures").length, 14);
  assert.equal(getDailyConceptsByDomain("key_squares").length, 12);
  assert.equal(getDailyConceptsByDomain("piece_imbalances").length, 12);
  assert.equal(getDailyConceptsByDomain("tactical_ideas").length, 16);
  assert.equal(getDailyConceptsByDomain("special_techniques").length, 14);

  assert.equal(new Set(allConcepts.map((concept) => concept.id)).size, allConcepts.length);
  assert.equal(new Set(allConcepts.map((concept) => concept.masteryKey)).size, allConcepts.length);
  assert.ok(allConcepts.every((concept) => concept.displayName.trim().length > 0));
  assert.ok(allConcepts.every((concept) => concept.summary.trim().length > 0));
  assert.ok(allConcepts.every((concept) => concept.trainedBy.length > 0));
}

testDailyConceptRegistry();
console.log("dailyConceptRegistry ok");
