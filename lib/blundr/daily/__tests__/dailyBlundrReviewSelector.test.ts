import assert from "node:assert/strict";
import { Chess } from "chess.js";

import { buildDailyBlundrDeck } from "../dailyBlundrDeckBuilder";
import { buildDailyBlundrDeckFromReviews, selectDueDailyBlundrReviewCards } from "../dailyBlundrReviewSelector";
import type { DailyBlundrCard } from "../dailyBlundrTypes";
import type { DailyBlundrMasteryState } from "../dailyBlundrTypes";
import type { DailyBlundrReviewCard } from "../dailyBlundrReviewTypes";

function makeReviewCard(overrides: Partial<DailyBlundrReviewCard> = {}): DailyBlundrReviewCard {
  const completedAt = "2026-07-02T09:00:00.000Z";
  return {
    schemaVersion: 1,
    id: "review:base",
    dedupeKey: "position|e2e4|target_move_recall|wrong_book_move|daily:base",
    status: "new",
    promptKind: "target_move_recall",
    source: "progress_mistake",
    fen: new Chess().fen(),
    positionHash: "position",
    expectedMoveUci: "e2e4",
    expectedMoveSan: "e4",
    playedMoveUci: "e7e5",
    playedMoveSan: "e5",
    openingId: "italian-white",
    repertoireId: "italian-white",
    openingName: "Italian Game",
    domain: "daily_recall",
    masteryTargets: [
      {
        conceptKey: "daily:position:e2e4",
        domain: "daily_recall",
        label: "Italian Game",
        difficultyHint: "beginner",
      },
    ],
    failureType: "wrong_book_move",
    severity: 3,
    signals: ["progress_mistake"],
    dueAt: completedAt,
    intervalDays: 0,
    ease: 2.35,
    correctStreak: 0,
    lapses: 0,
    totalAttempts: 0,
    revealUses: 0,
    avgResponseTimeMs: null,
    lastReviewedAt: null,
    createdAt: completedAt,
    updatedAt: completedAt,
    ...overrides,
  };
}

function makeMasteryState(entries: Record<string, { currentMastery: number; confidence: number }>): DailyBlundrMasteryState {
  const records: DailyBlundrMasteryState["records"] = {};
  for (const [key, entry] of Object.entries(entries)) {
    records[key] = {
      key,
      label: key,
      domain: "daily_recall",
      cardKind: "recall",
      sources: ["progress_mistake"],
      exposureCount: 5,
      attemptCount: 5,
      attempts: 5,
      correctCount: 4,
      correct: 4,
      incorrectCount: 1,
      incorrect: 1,
      recentAccuracy: 0.8,
      lifetimeAccuracy: 0.8,
      avgResponseTimeMs: 1300,
      hintRate: 0.1,
      revealRate: 0.1,
      currentMastery: entry.currentMastery,
      confidence: entry.confidence,
      currentDifficulty: "expert",
      streak: 3,
      lapses: 1,
      firstSeenAt: "2026-07-01T00:00:00.000Z",
      lastSeenAt: "2026-07-02T00:00:00.000Z",
      lastAttemptAt: "2026-07-02T00:00:00.000Z",
      lastCorrectAt: "2026-07-02T00:00:00.000Z",
      lastIncorrectAt: "2026-07-01T00:00:00.000Z",
      updatedAt: "2026-07-02T00:00:00.000Z",
    };
  }
  return {
    schemaVersion: 1,
    updatedAt: "2026-07-02T00:00:00.000Z",
    records,
  };
}

function makeCandidateCard(): DailyBlundrCard {
  const deck = buildDailyBlundrDeck({
    progress: {
      attempts: 0,
      correct: 0,
      incorrect: 0,
      streak: 0,
      trainedPositions: {},
      mistakes: {
        a: { fen: new Chess().fen(), expectedMove: "e4", playedMove: "e5", count: 1, opening: "Italian Game", repertoireId: "italian-white" },
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

export function testDailyBlundrReviewSelector(): void {
  const now = "2026-07-02T09:00:00.000Z";
  const dueHigh = makeReviewCard({
    id: "review:due-high",
    dedupeKey: "position|e2e4|target_move_recall|wrong_book_move|daily:due-high",
    severity: 5,
    dueAt: "2026-07-02T08:00:00.000Z",
    totalAttempts: 4,
    correctStreak: 2,
  });
  const dueLow = makeReviewCard({
    id: "review:due-low",
    dedupeKey: "position|e7e5|review_prompt|hint_dependency|daily:due-low",
    promptKind: "review_prompt",
    expectedMoveUci: null,
    expectedMoveSan: "e5",
    failureType: "hint_dependency",
    severity: 2,
    dueAt: "2026-07-02T08:00:00.000Z",
    totalAttempts: 2,
    correctStreak: 1,
  });
  const leechA = makeReviewCard({
    id: "review:leech-a",
    dedupeKey: "position|e2e4|target_move_recall|wrong_book_move|daily:leech-a",
    severity: 5,
    status: "leech",
    dueAt: "2026-07-02T08:00:00.000Z",
    lapses: 8,
    totalAttempts: 12,
  });
  const leechB = makeReviewCard({
    id: "review:leech-b",
    dedupeKey: "position|e2e4|target_move_recall|wrong_book_move|daily:leech-b",
    severity: 4,
    status: "leech",
    dueAt: "2026-07-02T08:00:00.000Z",
    lapses: 9,
    totalAttempts: 15,
  });
  const masteredFuture = makeReviewCard({
    id: "review:mastered-future",
    dedupeKey: "position|e2e4|target_move_recall|wrong_book_move|daily:mastered-future",
    status: "mastered",
    dueAt: "2026-07-10T09:00:00.000Z",
    lapses: 0,
    totalAttempts: 10,
    correctStreak: 5,
    severity: 4,
  });
  const masteredRecentFail = makeReviewCard({
    id: "review:mastered-recent",
    dedupeKey: "position|e2e4|target_move_recall|wrong_book_move|daily:mastered-recent",
    status: "mastered",
    dueAt: "2026-07-10T09:00:00.000Z",
    lapses: 1,
    totalAttempts: 10,
    correctStreak: 4,
    lastReviewedAt: "2026-07-01T09:30:00.000Z",
    severity: 4,
  });

  const dueCards = selectDueDailyBlundrReviewCards({
    reviewCards: [dueHigh, dueLow, leechA, leechB, masteredFuture, masteredRecentFail],
    mastery: makeMasteryState({
      [masteredFuture.id]: { currentMastery: 0.95, confidence: 0.85 },
    }),
    now,
    limit: 5,
  });

  assert.equal(dueCards[0].id, dueHigh.id);
  assert.ok(dueCards.find((card) => card.id === masteredRecentFail.id));
  assert.equal(dueCards.filter((card) => card.status === "leech").length, 1);
  assert.equal(dueCards.some((card) => card.id === masteredFuture.id), false);

  const candidateCard = makeCandidateCard();
  const bootstrap = buildDailyBlundrDeckFromReviews({
    dateKey: "2026-07-02",
    existingReviewCards: [
      makeReviewCard({
        id: "review:existing",
        dedupeKey: candidateCard.cardKey
          ? `${candidateCard.positionKey}|${candidateCard.expectedMoveUci ?? candidateCard.expectedMoveSan ?? "target"}|target_move_recall|wrong_book_move|${candidateCard.masteryTargets.find((target) => target.domain !== "daily_recall")?.conceptKey ?? candidateCard.masteryKey}`
          : "position|target|target_move_recall|wrong_book_move|daily:existing",
        status: "mastered",
        dueAt: "2026-07-10T09:00:00.000Z",
        lapses: 0,
        totalAttempts: 10,
        correctStreak: 5,
        severity: 4,
        sourceCard: candidateCard,
      }),
    ],
    candidateDailyCards: [candidateCard],
    mastery: null,
    limit: 5,
    now,
  });

  assert.equal(bootstrap.dueReviewCount, 0);
  assert.equal(bootstrap.bootstrapUsed, true);
  assert.equal(bootstrap.selectionMode, "bootstrap");
  assert.equal(bootstrap.cards.length, 1);
  assert.equal(bootstrap.cards[0].cardKey, candidateCard.cardKey);
  assert.equal(bootstrap.cards[0].reviewCardId !== null, true);
}

testDailyBlundrReviewSelector();
console.log("dailyBlundrReviewSelector ok");
