import assert from "node:assert/strict";

import {
  findOverrepresentedConcepts,
  findUntaggedContent,
  findUnderrepresentedConcepts,
  summarizeConceptCoverage,
  summarizeConceptCoverageByDomain,
  summarizeConceptCoverageBySurface,
} from "../validation/dailyConceptCoverage";
import { makeValidMiniGameCards, makeValidTrainingTargetCards } from "./dailyValidationFixtures";

export function testDailyConceptCoverage(): void {
  const items = [...makeValidMiniGameCards(), ...makeValidTrainingTargetCards()];
  const firstItem = items[0]!;
  const secondItem = items[1]!;
  const byDomain = summarizeConceptCoverageByDomain(items);
  assert.ok(byDomain.some((bucket) => bucket.key === "key_squares" && bucket.count > 0));
  assert.ok(byDomain.some((bucket) => bucket.key === "tactical_ideas" && bucket.count > 0));

  const bySurface = summarizeConceptCoverageBySurface(items);
  assert.ok(bySurface.some((bucket) => bucket.key === "mini_game" && bucket.count > 0));
  assert.ok(bySurface.some((bucket) => bucket.key === "training_target" && bucket.count > 0));

  const untagged = findUntaggedContent([
    ...items,
    {
      ...firstItem,
      id: `${firstItem.id}:untagged`,
      cardKey: `${firstItem.cardKey}:untagged`,
      conceptIds: [],
      primaryConceptId: null,
      conceptMasteryKeys: [],
    },
  ]);
  assert.equal(untagged.length, 1);

  const overrepresented = findOverrepresentedConcepts([firstItem, firstItem, secondItem], 1);
  assert.equal(overrepresented.length, 1);
  assert.ok(overrepresented[0].count >= 2);

  const underrepresented = findUnderrepresentedConcepts(items, 3);
  assert.equal(underrepresented.length, 3);

  const summary = summarizeConceptCoverage(items);
  assert.equal(summary.conceptCoverage.length, 68);
  assert.equal(summary.domainCoverage.length, 5);
}

testDailyConceptCoverage();
console.log("dailyConceptCoverage ok");
