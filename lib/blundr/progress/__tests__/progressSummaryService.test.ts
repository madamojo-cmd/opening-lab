import assert from "node:assert/strict";

import { createDefaultDailyRetentionProgress, createDefaultTrainingProfile } from "../../accounts/accountDefaults";
import { getLocalTrainingProfile, resetLocalAccountState, setLocalAccountCurrentUserId, upsertLocalDailyRetentionProgress, upsertLocalTrainingProfile } from "../../accounts/localAccountStorage";
import { clearLocalLearningEvents, createLearningSessionId, recordLearningEvent } from "../../learning/learningEvents";
import { loadBlundrProgressSummary } from "../progressSummaryService";
import { writeDailyBlundrReviewAttempts } from "../../daily/dailyBlundrReviewStorage";

class MemoryStorage implements Storage {
  private readonly store = new Map<string, string>();
  get length(): number {
    return this.store.size;
  }
  clear(): void {
    this.store.clear();
  }
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key) ?? null : null;
  }
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

function installLocalStorageMock(): () => void {
  const previous = (globalThis as { localStorage?: Storage }).localStorage;
  const storage = new MemoryStorage();
  (globalThis as { localStorage?: Storage }).localStorage = storage;
  return () => {
    if (previous) {
      (globalThis as { localStorage?: Storage }).localStorage = previous;
    } else {
      delete (globalThis as { localStorage?: Storage }).localStorage;
    }
  };
}

const restore = installLocalStorageMock();
try {
  const userId = "progress-user";
  const now = "2026-07-06T10:00:00.000Z";
  const localDate = now.slice(0, 10);

  resetLocalAccountState(userId);
  setLocalAccountCurrentUserId(userId);
  upsertLocalTrainingProfile({
    ...createDefaultTrainingProfile(userId, now),
    dailyTempoGoal: 2,
    dailyBatteryGoal: 1,
    dailyBlundrGoal: 1,
    updatedAt: now,
  });
  upsertLocalDailyRetentionProgress(
    createDefaultDailyRetentionProgress(userId, localDate, {
      dailyTempoGoal: 2,
      dailyBatteryGoal: 1,
      dailyBlundrGoal: 1,
    }, now),
  );

  writeDailyBlundrReviewAttempts([
    {
      schemaVersion: 1,
      id: "review-attempt-1",
      reviewCardId: "review-card-1",
      completedAt: now,
      grade: "GOOD",
      score: 88,
      correct: true,
      partialCredit: 1,
      usedReveal: false,
    },
  ]);

  clearLocalLearningEvents();
  recordLearningEvent({
    type: "move_correct",
    source: "train",
    sessionId: createLearningSessionId(),
    userId,
    createdAt: now,
    fen: "start",
    openingId: "italian-white",
    openingName: "Italian Game",
    trainingMode: "restricted",
    correct: true,
    metadata: { practiceMode: "opening" },
  });
  recordLearningEvent({
    type: "move_correct",
    source: "train",
    sessionId: createLearningSessionId(),
    userId,
    createdAt: now,
    fen: "start",
    openingId: "italian-white",
    openingName: "Italian Game",
    trainingMode: "continuation",
    correct: true,
    metadata: { practiceMode: "continuation" },
  });
  recordLearningEvent({
    type: "move_correct",
    source: "review",
    sessionId: createLearningSessionId(),
    userId,
    createdAt: now,
    fen: "start",
    correct: true,
    metadata: { practiceMode: "mini_game", miniGameId: "king_race" },
  });

  const summary = loadBlundrProgressSummary({ userId, now });

  assert.equal(summary.userId, userId);
  assert.equal(summary.trainingVolume.openingRunsToday, 1);
  assert.equal(summary.trainingVolume.batteryToday, 1);
  assert.equal(summary.trainingVolume.dailyBlundrToday, 1);
  assert.equal(summary.trainingVolume.minigamesToday, 1);
  assert.equal(summary.today.rings.length, 3);
  assert.equal(summary.nextActions.length >= 3, true);
  assert.equal(summary.repertoire.unlockedOpenings >= 0, true);
  assert.equal(summary.streak.week.length, 7);
  assert.equal(getLocalTrainingProfile(userId)?.dailyTempoGoal, 2);
  assert.equal(summary.recentActivity.some((item) => item.key === "minigames"), true);

  console.log("progressSummaryService.test.ts passed");
} finally {
  restore();
  resetLocalAccountState("progress-user");
  clearLocalLearningEvents();
}
