import assert from "node:assert/strict";
import { Chess } from "chess.js";

import { buildDailyBlundrDeck } from "../dailyBlundrDeckBuilder";
import {
  DAILY_BLUNDR_MASTERY_KEY,
  DAILY_BLUNDR_PROGRESS_KEY,
  DAILY_BLUNDR_SESSIONS_KEY,
  buildDailyBlundrProgressAfterCompletion,
  createEmptyDailyBlundrSession,
  getDailyBlundrStorageBundle,
  loadDailyBlundrMastery,
  loadDailyBlundrProgress,
  loadDailyBlundrSessionStore,
  saveDailyBlundrProgress,
  saveDailyBlundrStore,
} from "../dailyBlundrStorage";
import type { DailyBlundrMasteryState, DailyBlundrProgress, DailyBlundrSessionStore } from "../dailyBlundrTypes";

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

function makeProgress(dateKey: string, currentDailyStreak: number, longestDailyStreak = currentDailyStreak): DailyBlundrProgress {
  return {
    schemaVersion: 1,
    currentDailyStreak,
    longestDailyStreak,
    dailyStreak: currentDailyStreak,
    lastCompletedDateKey: dateKey,
    lastRewardDateKey: dateKey,
    completionCount: currentDailyStreak,
    localDailyXp: currentDailyStreak * 10,
    lastRewardClaimedAt: `${dateKey}T08:00:00.000Z`,
    updatedAt: `${dateKey}T08:00:00.000Z`,
  };
}

export function testDailyBlundrStorage(): void {
  const originalLocalStorage = (globalThis as { localStorage?: Storage }).localStorage;
  try {
    installLocalStorage();

    const emptyBundle = getDailyBlundrStorageBundle();
    assert.equal(Object.keys(emptyBundle.sessions.sessionsByDate).length, 0);
    assert.equal(Object.keys(emptyBundle.mastery.records).length, 0);
    assert.equal(emptyBundle.progress.currentDailyStreak, 0);
    assert.equal(emptyBundle.progress.longestDailyStreak, 0);

    installLocalStorage({
      [DAILY_BLUNDR_PROGRESS_KEY]: "{not-json",
      [DAILY_BLUNDR_SESSIONS_KEY]: "{not-json",
      [DAILY_BLUNDR_MASTERY_KEY]: "{not-json",
    });
    assert.equal(loadDailyBlundrProgress().currentDailyStreak, 0);
    assert.equal(Object.keys(loadDailyBlundrSessionStore().sessionsByDate).length, 0);
    assert.equal(Object.keys(loadDailyBlundrMastery().records).length, 0);

    const previous = makeProgress("2026-07-01", 3, 5);
    const first = buildDailyBlundrProgressAfterCompletion({
      previous,
      dateKey: "2026-07-02",
      claimAt: "2026-07-02T08:00:00.000Z",
    });
    const second = buildDailyBlundrProgressAfterCompletion({
      previous: first,
      dateKey: "2026-07-02",
      claimAt: "2026-07-02T12:00:00.000Z",
    });
    assert.equal(first.currentDailyStreak, 4);
    assert.equal(first.longestDailyStreak, 5);
    assert.equal(first.completionCount, 4);
    assert.equal(first.localDailyXp, 40);
    assert.equal(second.currentDailyStreak, 4);
    assert.equal(second.longestDailyStreak, 5);
    assert.equal(second.completionCount, 4);
    assert.equal(second.localDailyXp, 40);

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
    const card = deck.cards[0];
    const session = createEmptyDailyBlundrSession("2026-07-02", deck.fingerprint);
    const hydratedSession = {
      ...session,
      status: "completed" as const,
      cardIds: [card.id],
      cards: [card],
      cardOrder: [card.id],
      completedCardIds: [card.id],
      currentCardId: null,
      startedAt: "2026-07-02T09:00:00.000Z",
      completedAt: "2026-07-02T09:15:00.000Z",
      rewardClaimedAt: "2026-07-02T09:16:00.000Z",
      rewardAwardedAt: "2026-07-02T09:16:00.000Z",
      attempts: [],
      updatedAt: "2026-07-02T09:16:00.000Z",
    };
    const mastery: DailyBlundrMasteryState = {
      schemaVersion: 1,
      records: {},
      updatedAt: "2026-07-02T09:16:00.000Z",
    };

    saveDailyBlundrStore({
      sessions: {
        schemaVersion: 1,
        sessionsByDate: {
          "2026-07-02": hydratedSession,
        },
        updatedAt: "2026-07-02T09:16:00.000Z",
      },
      progress: first,
      mastery,
    });

    const loadedBundle = getDailyBlundrStorageBundle();
    assert.equal(loadedBundle.sessions.schemaVersion, 1);
    assert.equal(loadedBundle.sessions.sessionsByDate["2026-07-02"].status, "completed");
    assert.equal(loadedBundle.sessions.sessionsByDate["2026-07-02"].cards.length, 1);
    assert.equal(loadedBundle.sessions.sessionsByDate["2026-07-02"].rewardAwardedAt, "2026-07-02T09:16:00.000Z");
    assert.equal(loadedBundle.progress.currentDailyStreak, 4);
    assert.equal(loadedBundle.progress.longestDailyStreak, 5);
    assert.equal(loadedBundle.mastery.schemaVersion, 1);

    installLocalStorage({
      blundr: "ignore",
      "blundr-v22-progress": JSON.stringify({ attempts: 1, correct: 1, incorrect: 0, streak: 11, trainedPositions: {}, mistakes: {} }),
    });
    saveDailyBlundrProgress(makeProgress("2026-07-02", 2));
    assert.equal(loadDailyBlundrProgress().currentDailyStreak, 2);
    assert.equal((globalThis as { localStorage?: Storage }).localStorage?.getItem("blundr-v22-progress")?.includes("11"), true);
  } finally {
    if (originalLocalStorage) {
      (globalThis as { localStorage?: Storage }).localStorage = originalLocalStorage;
    } else {
      delete (globalThis as { localStorage?: Storage }).localStorage;
    }
  }
}

testDailyBlundrStorage();
console.log("dailyBlundrStorage ok");
