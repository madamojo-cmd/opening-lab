import assert from "node:assert/strict";

import { getDailyConceptById } from "../concepts/dailyConceptRegistry";
import {
  getRecommendedConceptDifficulty,
  shouldAdvanceConceptDifficulty,
  shouldSuppressIntroConcept,
} from "../concepts/dailyConceptDifficulty";

export function testDailyConceptDifficulty(): void {
  const weakSquare = getDailyConceptById("concept:key_squares:weak_square");
  const pawnBreak = getDailyConceptById("concept:tactical_ideas:pawn_break");
  assert.ok(weakSquare);
  assert.ok(pawnBreak);

  const lowMastery = { currentMastery: 0.12, confidence: 0.18 };
  const mediumMastery = { currentMastery: 0.52, confidence: 0.56 };
  const highMastery = { currentMastery: 0.92, confidence: 0.9 };

  assert.equal(getRecommendedConceptDifficulty(weakSquare!, lowMastery), "intro");
  assert.equal(getRecommendedConceptDifficulty(weakSquare!, mediumMastery), "beginner");
  assert.equal(shouldSuppressIntroConcept(weakSquare!, highMastery), true);
  assert.equal(shouldAdvanceConceptDifficulty(weakSquare!, highMastery), true);
  assert.equal(getRecommendedConceptDifficulty(weakSquare!, highMastery), "beginner");

  assert.equal(shouldAdvanceConceptDifficulty(pawnBreak!, highMastery), true);
  assert.equal(getRecommendedConceptDifficulty(pawnBreak!, highMastery), "intermediate");
}

testDailyConceptDifficulty();
console.log("dailyConceptDifficulty ok");
