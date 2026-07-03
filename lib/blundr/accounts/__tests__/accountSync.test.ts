import assert from "node:assert/strict";

class MemoryStorage implements Storage {
  private store = new Map<string, string>();

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

(globalThis as typeof globalThis & { localStorage?: Storage }).localStorage = new MemoryStorage();

void (async () => {
  const daily = await import("../../daily/dailyBlundrStorage");
  const reviewStorage = await import("../../daily/dailyBlundrReviewStorage");
  const accountSync = await import("../accountSync");
  const accountService = await import("../accountService");

  daily.saveDailyBlundrStore({
    ...daily.loadDailyBlundrStore(),
    progress: {
      ...daily.loadDailyBlundrStore().progress,
      localDailyXp: 42,
      completionCount: 3,
      updatedAt: "2026-07-03T12:00:00.000Z",
    },
  });

  reviewStorage.writeDailyBlundrReviewCards([
    {
      schemaVersion: 1,
      id: "review-1",
      dedupeKey: "review-1",
      status: "new",
      promptKind: "target_move_recall",
      source: "progress_mistake",
      fen: "startpos",
      positionHash: "hash-1",
      domain: "daily_recall",
      masteryTargets: [],
      failureType: "other",
      severity: 1,
      signals: [],
      dueAt: "2026-07-03T12:00:00.000Z",
      intervalDays: 0,
      ease: 2.35,
      correctStreak: 0,
      lapses: 0,
      totalAttempts: 0,
      revealUses: 0,
      createdAt: "2026-07-03T12:00:00.000Z",
      updatedAt: "2026-07-03T12:00:00.000Z",
    } as any,
  ]);
  reviewStorage.writeDailyBlundrReviewAttempts([
    {
      schemaVersion: 1,
      id: "attempt-1",
      reviewCardId: "review-1",
      completedAt: "2026-07-03T12:00:00.000Z",
      grade: "GOOD",
      score: 10,
      correct: true,
      partialCredit: 1,
      usedReveal: false,
    } as any,
  ]);

  const prepared = accountSync.prepareDailyStateForAccountSync("user-1", { now: "2026-07-03T12:00:00.000Z" });
  assert.equal(prepared.localDate, daily.getDailyBlundrDateKey(new Date("2026-07-03T12:00:00.000Z")));
  assert.equal(prepared.dailyRetentionProgress.xpEarned, 42);
  assert.equal(prepared.dailyRetentionProgress.rings.dailyTempo.progress, 1);
  assert.equal(prepared.dailyRetentionProgress.rings.dailyBattery.progress, 1);

  const sync = await accountSync.syncLocalDemoStateToAccount("user-1", { mode: "local_demo", allowLocalFallback: true });
  assert.equal(sync.ok, true);
  assert.equal(sync.ok ? sync.data.userId : "", "user-1");

  const bootstrap = await accountService.initializeAccountDefaults("user-1", { mode: "local_demo", allowLocalFallback: true });
  assert.equal(bootstrap.ok, true);

  console.log("accountSync.test.ts passed");
})();
