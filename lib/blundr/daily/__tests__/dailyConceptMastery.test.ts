import assert from "node:assert/strict";

import type { DailyBlundrMasteryRecord, DailyBlundrMasteryState } from "../dailyBlundrTypes";
import { getDailyConceptsByDomain } from "../concepts/dailyConceptRegistry";
import {
  getConceptMasteryRecord,
  rankStrongConcepts,
  rankWeakConcepts,
  selectConceptDifficulty,
  summarizeConceptMastery,
} from "../concepts/dailyConceptMastery";
import { makeConceptMasteryKey } from "../concepts/dailyConceptTagging";

function makeRecord(key: string, currentMastery: number, confidence: number, lapses = 0): DailyBlundrMasteryRecord {
  return {
    key,
    label: key,
    domain: "key_squares",
    cardKind: "training_target",
    sources: ["daily_attempt"],
    exposureCount: 5,
    attemptCount: 5,
    attempts: 5,
    correctCount: 4,
    correct: 4,
    incorrectCount: 1,
    incorrect: 1,
    recentAccuracy: 0.8,
    lifetimeAccuracy: 0.8,
    avgResponseTimeMs: 1000,
    hintRate: 0.1,
    revealRate: 0.1,
    currentMastery,
    confidence,
    currentDifficulty: "beginner",
    streak: 2,
    lapses,
    firstSeenAt: "2026-07-01T00:00:00.000Z",
    lastSeenAt: "2026-07-02T00:00:00.000Z",
    lastAttemptAt: "2026-07-02T00:00:00.000Z",
    lastCorrectAt: "2026-07-02T00:00:00.000Z",
    lastIncorrectAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-02T00:00:00.000Z",
  };
}

export function testDailyConceptMastery(): void {
  const weakKey = makeConceptMasteryKey("concept:key_squares:weak_square");
  const strongKey = makeConceptMasteryKey("concept:key_squares:outpost_square");
  const mastery: DailyBlundrMasteryState = {
    schemaVersion: 1,
    updatedAt: "2026-07-02T00:00:00.000Z",
    records: {
      [weakKey]: makeRecord(weakKey, 0.12, 0.2, 2),
      [strongKey]: makeRecord(strongKey, 0.92, 0.9, 0),
    },
  };

  const weakRecord = getConceptMasteryRecord(mastery, "concept:key_squares:weak_square");
  assert.ok(weakRecord);
  assert.equal(weakRecord?.key, weakKey);

  const summary = summarizeConceptMastery(mastery, ["concept:key_squares:weak_square", "concept:key_squares:outpost_square"]);
  assert.equal(summary.recordCount, 2);
  assert.equal(summary.missingCount, 0);
  assert.ok(summary.currentMastery > 0.4 && summary.currentMastery < 0.7);
  assert.ok(summary.confidence > 0.4 && summary.confidence < 0.7);

  const missingSummary = summarizeConceptMastery(mastery, ["concept:key_squares:promotion_square"]);
  assert.equal(missingSummary.recordCount, 0);
  assert.equal(missingSummary.missingCount, 1);
  assert.ok(missingSummary.currentMastery <= 0.2);
  assert.ok(missingSummary.confidence <= 0.2);

  const concepts = getDailyConceptsByDomain("key_squares");
  const weakRank = rankWeakConcepts(mastery, concepts, 2);
  const strongRank = rankStrongConcepts(mastery, concepts, 2);
  assert.equal(weakRank[0]?.id, "concept:key_squares:weak_square");
  assert.equal(strongRank[0]?.id, "concept:key_squares:outpost_square");
  assert.notEqual(selectConceptDifficulty(mastery, "concept:key_squares:outpost_square"), "intro");
}

testDailyConceptMastery();
console.log("dailyConceptMastery ok");
