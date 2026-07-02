import assert from "node:assert/strict";
import { Chess } from "chess.js";

import { buildDailyBlundrDeck } from "../dailyBlundrDeckBuilder";
import { updateDailyBlundrMasteryFromAttempt } from "../dailyBlundrMastery";
import type { DailyBlundrAttempt, DailyBlundrCard, DailyBlundrMasteryState } from "../dailyBlundrTypes";

function makeCard(): DailyBlundrCard {
  const fen = new Chess().fen();
  const deck = buildDailyBlundrDeck({
    progress: {
      attempts: 0,
      correct: 0,
      incorrect: 0,
      streak: 0,
      trainedPositions: {},
      mistakes: {
        a: { fen, expectedMove: "e4", playedMove: "e5", count: 1, opening: "Italian Game", repertoireId: "italian-white" },
      },
    },
    learningEvents: [],
    mastery: null,
    dateKey: "2026-07-02",
    limit: 5,
  });
  assert.ok(deck.cards.length > 0);
  return deck.cards[0];
}

function makeAttempt(card: DailyBlundrCard, overrides: Partial<DailyBlundrAttempt> = {}): DailyBlundrAttempt {
  const now = "2026-07-02T09:00:00.000Z";
  const outcome = overrides.outcome ?? "correct";
  const usedReveal = overrides.usedReveal ?? false;
  const correct = overrides.correct ?? outcome === "correct";
  return {
    id: `attempt-${Math.random().toString(36).slice(2, 8)}`,
    cardId: card.cardKey,
    source: card.source,
    createdAt: now,
    completedAt: now,
    outcome,
    correct,
    attemptedMoveUci: card.expectedMoveUci,
    attemptedMoveSan: card.expectedMoveSan,
    responseMoveUci: card.expectedMoveUci,
    responseMoveSan: card.expectedMoveSan,
    expectedMoveUci: card.expectedMoveUci,
    expectedMoveSan: card.expectedMoveSan,
    usedReveal,
    responseTimeMs: 1400,
    note: null,
    ...overrides,
  };
}

function getTargetKey(card: DailyBlundrCard): string {
  const target = card.masteryTargets.find((entry) => entry.domain !== "daily_recall") ?? card.masteryTargets.find((entry) => entry.conceptKey !== card.masteryKey) ?? card.masteryTargets[0];
  assert.ok(target);
  return target.conceptKey;
}

function makeMasteryState(key: string, currentMastery: number, confidence: number): DailyBlundrMasteryState {
  return {
    schemaVersion: 1,
    updatedAt: "2026-07-02T09:00:00.000Z",
    records: {
      [key]: {
        key,
        label: "Ruy Lopez",
        domain: "daily_recall",
        cardKind: "recall",
        sources: ["progress_mistake"],
        exposureCount: 12,
        attemptCount: 12,
        attempts: 12,
        correctCount: 11,
        correct: 11,
        incorrectCount: 1,
        incorrect: 1,
        recentAccuracy: 0.92,
        lifetimeAccuracy: 0.9,
        avgResponseTimeMs: 1200,
        hintRate: 0.04,
        revealRate: 0.03,
        currentMastery,
        confidence,
        currentDifficulty: "expert",
        streak: 6,
        lapses: 1,
        firstSeenAt: "2026-07-01T00:00:00.000Z",
        lastSeenAt: "2026-07-02T08:30:00.000Z",
        lastAttemptAt: "2026-07-02T08:30:00.000Z",
        lastCorrectAt: "2026-07-02T08:30:00.000Z",
        lastIncorrectAt: "2026-07-01T08:30:00.000Z",
        updatedAt: "2026-07-02T08:30:00.000Z",
      },
    },
  };
}

export function testDailyBlundrMastery(): void {
  const card = makeCard();
  const cardKey = card.masteryKey;
  const targetKey = getTargetKey(card);

  const correctState = updateDailyBlundrMasteryFromAttempt({
    previousMastery: null,
    card,
    attempt: makeAttempt(card, { outcome: "correct", correct: true, usedReveal: false }),
    now: "2026-07-02T09:00:00.000Z",
  });
  assert.ok(correctState.records[cardKey]);
  assert.ok(correctState.records[targetKey]);
  assert.equal(correctState.records[targetKey].key, targetKey);
  assert.notEqual(correctState.records[targetKey].domain, correctState.records[cardKey].domain);
  assert.ok(correctState.records[cardKey].currentMastery > 0.35);
  assert.ok(correctState.records[cardKey].confidence > 0.4);

  const revealState = updateDailyBlundrMasteryFromAttempt({
    previousMastery: null,
    card,
    attempt: makeAttempt(card, { outcome: "correct", correct: true, usedReveal: true }),
    now: "2026-07-02T09:01:00.000Z",
  });
  assert.ok(revealState.records[cardKey].currentMastery <= correctState.records[cardKey].currentMastery);

  const wrongState = updateDailyBlundrMasteryFromAttempt({
    previousMastery: null,
    card,
    attempt: makeAttempt(card, {
      outcome: "incorrect",
      correct: false,
      attemptedMoveUci: "e7e5",
      attemptedMoveSan: "e5",
      responseMoveUci: "e7e5",
      responseMoveSan: "e5",
    }),
    now: "2026-07-02T09:02:00.000Z",
  });
  assert.ok(wrongState.records[cardKey].currentMastery <= 0.35);

  let growthState: DailyBlundrMasteryState | null = null;
  for (let index = 0; index < 8; index += 1) {
    growthState = updateDailyBlundrMasteryFromAttempt({
      previousMastery: growthState,
      card,
      attempt: makeAttempt(card, { outcome: "correct", correct: true, usedReveal: false, createdAt: `2026-07-02T09:0${index}:00.000Z`, completedAt: `2026-07-02T09:0${index}:00.000Z` }),
      now: `2026-07-02T09:0${index}:00.000Z`,
    });
  }
  assert.ok(growthState);
  const grownRecord = growthState.records[cardKey];
  assert.ok(grownRecord.currentMastery >= 0 && grownRecord.currentMastery <= 1);
  assert.ok(grownRecord.confidence >= 0 && grownRecord.confidence <= 1);
  assert.ok(grownRecord.confidence > correctState.records[cardKey].confidence);
  assert.ok(grownRecord.attemptCount > correctState.records[cardKey].attemptCount);
}

testDailyBlundrMastery();
console.log("dailyBlundrMastery ok");
