import assert from "node:assert/strict";
import { Chess } from "chess.js";

import {
  DAILY_BLUNDR_REVIEW_ATTEMPTS_KEY,
  DAILY_BLUNDR_REVIEW_CARDS_KEY,
  appendDailyBlundrReviewAttempt,
  loadDailyBlundrReviewStore,
  readDailyBlundrReviewAttempts,
  readDailyBlundrReviewCards,
  upsertDailyBlundrReviewCards,
  writeDailyBlundrReviewAttempts,
  writeDailyBlundrReviewCards,
} from "../dailyBlundrReviewStorage";
import type { DailyBlundrReviewAttempt, DailyBlundrReviewCard } from "../dailyBlundrReviewTypes";

function installLocalStorage(initialEntries: Record<string, string> = {}): void {
  const entries = new Map(Object.entries(initialEntries));
  const localStorageMock = {
    get length() {
      return entries.size;
    },
    key(index: number): string | null {
      return Array.from(entries.keys())[index] ?? null;
    },
    getItem(key: string): string | null {
      return entries.has(key) ? entries.get(key)! : null;
    },
    setItem(key: string, value: string): void {
      entries.set(key, String(value));
    },
    removeItem(key: string): void {
      entries.delete(key);
    },
    clear(): void {
      entries.clear();
    },
  } as Storage;

  (globalThis as { localStorage?: Storage }).localStorage = localStorageMock;
}

function makeReviewCard(overrides: Partial<DailyBlundrReviewCard> = {}): DailyBlundrReviewCard {
  const completedAt = "2026-07-02T09:00:00.000Z";
  return {
    schemaVersion: 1,
    id: "review:storage",
    dedupeKey: "position|e2e4|target_move_recall|wrong_book_move|daily:storage",
    status: "learning",
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
    masteryTargets: [],
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

function makeReviewAttempt(overrides: Partial<DailyBlundrReviewAttempt> = {}): DailyBlundrReviewAttempt {
  const completedAt = "2026-07-02T09:01:00.000Z";
  return {
    schemaVersion: 1,
    id: "review-attempt-storage",
    reviewCardId: "review:storage",
    sessionId: "2026-07-02",
    cardId: "daily:storage",
    startedAt: "2026-07-02T09:00:00.000Z",
    completedAt,
    grade: "GOOD",
    score: 0.8,
    correct: true,
    partialCredit: 1,
    responseMoveUci: "e2e4",
    usedReveal: false,
    responseTimeMs: 1400,
    failureType: null,
    ...overrides,
  };
}

export function testDailyBlundrReviewStorage(): void {
  const originalLocalStorage = (globalThis as { localStorage?: Storage }).localStorage;
  try {
    installLocalStorage({
      [DAILY_BLUNDR_REVIEW_CARDS_KEY]: "{not-json",
      [DAILY_BLUNDR_REVIEW_ATTEMPTS_KEY]: "{not-json",
    });

    assert.equal(readDailyBlundrReviewCards().length, 0);
    assert.equal(readDailyBlundrReviewAttempts().length, 0);
    assert.equal(loadDailyBlundrReviewStore().reviewCards.length, 0);

    const card = makeReviewCard();
    const attempt = makeReviewAttempt();
    const writtenCards = writeDailyBlundrReviewCards([card]);
    const writtenAttempts = writeDailyBlundrReviewAttempts([attempt]);

    assert.equal(writtenCards.length, 1);
    assert.equal(writtenAttempts.length, 1);
    assert.equal(readDailyBlundrReviewCards()[0].schemaVersion, 1);
    assert.equal(readDailyBlundrReviewAttempts()[0].schemaVersion, 1);

    const mergedCards = upsertDailyBlundrReviewCards([
      card,
      {
        ...card,
        id: "review:storage-2",
        dedupeKey: "position|e2e4|target_move_recall|wrong_book_move|daily:storage-2",
      },
    ]);
    assert.equal(mergedCards.length, 2);

    const appended = appendDailyBlundrReviewAttempt(makeReviewAttempt({ id: "review-attempt-storage-2" }));
    assert.equal(appended.length, 2);
    assert.equal(readDailyBlundrReviewAttempts().length, 2);
  } finally {
    if (originalLocalStorage) {
      (globalThis as { localStorage?: Storage }).localStorage = originalLocalStorage;
    } else {
      delete (globalThis as { localStorage?: Storage }).localStorage;
    }
  }
}

testDailyBlundrReviewStorage();
console.log("dailyBlundrReviewStorage ok");
