import assert from "node:assert/strict";

import {
  createDefaultDailyRetentionProgress,
  createDefaultTrainingProfile,
} from "../../accounts/accountDefaults";
import {
  getLocalAccountCurrentUserId,
  getLocalDailyRetentionProgress,
  getLocalTrainingProfile,
  resetLocalAccountState,
  setLocalAccountCurrentUserId,
  upsertLocalDailyRetentionProgress,
  upsertLocalTrainingProfile,
} from "../../accounts/localAccountStorage";
import {
  completeDailyRingActivity,
  loadDailyRingSnapshot,
} from "../dailyRingService";
import { getDailyBlundrDateKey } from "../../daily/dailyBlundrStorage";
import { loadRepertoireProgress } from "../../repertoire/repertoireProgressService";

class MemoryStorage implements Storage {
  private readonly store = new Map<string, string>();
  get length(): number {
    return this.store.size;
  }
  clear(): void {
    this.store.clear();
  }
  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) ?? null) : null;
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

async function main(): Promise<void> {
  const restore = installLocalStorageMock();
  const previousStorageMode = process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE;
  process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE = "local_demo";
  try {
    const userId = "local-demo-user";
    const now = "2026-07-06T09:00:00.000Z";
    const localDate = getDailyBlundrDateKey();
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
      createDefaultDailyRetentionProgress(
        userId,
        localDate,
        {
          dailyTempoGoal: 2,
          dailyBatteryGoal: 1,
          dailyBlundrGoal: 1,
        },
        now,
      ),
    );

    const before = loadDailyRingSnapshot({ userId, localDate });
    assert.equal(before.dayRecord.dailyTempo.progress, 0);
    assert.equal(before.dayRecord.dailyTempo.closed, false);

    const first = await completeDailyRingActivity({
      userId,
      activity: {
        userId,
        source: "opening_run_completed",
        completionId: "opening-run-1",
        createdAt: now,
      },
      repertoireProgress: loadRepertoireProgress({ userId, now }),
      profile: getLocalTrainingProfile(userId) ?? undefined,
      now,
    });

    assert.equal(first.ok, true);
    if (!first.ok) throw new Error(first.message);
    assert.equal(first.activityAlreadyApplied, false);
    assert.equal(first.dayRecord.dailyTempo.progress > 0, true);
    assert.equal(
      first.dayRecord.activityEventIds.includes(first.activityEvent.id),
      true,
    );
    assert.equal(getLocalAccountCurrentUserId(), userId);
    assert.equal(
      getLocalDailyRetentionProgress(userId, localDate)?.rings.dailyTempo
        .progress,
      first.dayRecord.dailyTempo.progress,
    );

    const after = loadDailyRingSnapshot({ userId, localDate });
    assert.equal(
      after.dayRecord.dailyTempo.progress,
      first.dayRecord.dailyTempo.progress,
    );

    const duplicate = await completeDailyRingActivity({
      userId,
      activity: {
        userId,
        source: "opening_run_completed",
        completionId: "opening-run-1",
        createdAt: now,
      },
      repertoireProgress: loadRepertoireProgress({ userId, now }),
      profile: getLocalTrainingProfile(userId) ?? undefined,
      now,
    });

    assert.equal(duplicate.ok, true);
    if (!duplicate.ok) throw new Error(duplicate.message);
    assert.equal(duplicate.activityAlreadyApplied, true);
    assert.equal(
      loadDailyRingSnapshot({ userId, localDate }).dayRecord.dailyTempo
        .progress,
      after.dayRecord.dailyTempo.progress,
    );
  } finally {
    if (previousStorageMode === undefined) {
      delete process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE;
    } else {
      process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE = previousStorageMode;
    }
    restore();
    resetLocalAccountState(userIdFromTest());
  }
}

function userIdFromTest(): string {
  return "local-demo-user";
}

(async () => {
  await main();
  console.log("dailyRingHomeProgress.test.ts passed");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
