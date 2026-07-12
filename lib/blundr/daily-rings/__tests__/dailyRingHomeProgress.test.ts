import assert from "node:assert/strict";

import { createDefaultDailyRetentionProgress, createDefaultTrainingProfile } from "../../accounts/accountDefaults";
import { getLocalAccountCurrentUserId, getLocalDailyRetentionProgress, getLocalTrainingProfile, resetLocalAccountState, setLocalAccountCurrentUserId, upsertLocalDailyRetentionProgress, upsertLocalTrainingProfile } from "../../accounts/localAccountStorage";
import { completeDailyRingActivity, loadDailyRingSnapshot } from "../dailyRingService";
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

async function main(): Promise<void> {
  const restore = installLocalStorageMock();
  try {
    const userId = "daily-ring-user";
    const now = "2026-07-06T09:00:00.000Z";
    const localDate = getDailyBlundrDateKey();
    resetLocalAccountState(userId);
    setLocalAccountCurrentUserId(userId);
    const defaultSnapshot = loadDailyRingSnapshot({ userId, localDate });
    assert.equal(defaultSnapshot.tempo.target, 10);
    assert.equal(defaultSnapshot.battery.target, 3);
    assert.equal(defaultSnapshot.blundr.target, 1);
    assert.equal(defaultSnapshot.allComplete, false);

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

    const before = loadDailyRingSnapshot({ userId, localDate });
    assert.equal(before.tempo.current, 0);
    assert.equal(before.tempo.target, 2);
    assert.equal(before.tempo.complete, false);
    assert.equal(before.allComplete, false);

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
    assert.equal(first.dayRecord.activityEventIds.includes(first.activityEvent.id), true);
    assert.equal(getLocalAccountCurrentUserId(), userId);
    assert.equal(getLocalDailyRetentionProgress(userId, localDate)?.rings.dailyTempo.progress, first.dayRecord.dailyTempo.progress);

    const after = loadDailyRingSnapshot({ userId, localDate });
    assert.equal(after.tempo.current, first.dayRecord.dailyTempo.progress);
    assert.equal(after.tempo.target, 2);
    assert.equal(after.tempo.percent, 50);
    assert.equal(after.tempo.complete, false);
    assert.equal(after.allComplete, false);

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
    assert.equal(loadDailyRingSnapshot({ userId, localDate }).tempo.current, after.tempo.current);

    upsertLocalTrainingProfile({
      ...(getLocalTrainingProfile(userId) ?? createDefaultTrainingProfile(userId, now)),
      dailyTempoGoal: 5,
      updatedAt: now,
    });
    const retargeted = loadDailyRingSnapshot({ userId, localDate });
    assert.equal(retargeted.tempo.target, 5);
    assert.equal(retargeted.tempo.current, after.tempo.current);
    assert.equal(retargeted.tempo.percent, 20);
    assert.equal(retargeted.tempo.complete, false);

    upsertLocalDailyRetentionProgress({
      ...createDefaultDailyRetentionProgress(userId, localDate, {
        dailyTempoGoal: 2,
        dailyBatteryGoal: 1,
        dailyBlundrGoal: 1,
      }, now),
      rings: {
        dailyTempo: {
          type: "daily_tempo",
          goal: 2,
          progress: 4,
          completed: false,
          completedAt: null,
        },
        dailyBattery: {
          type: "daily_battery",
          goal: 1,
          progress: 1,
          completed: true,
          completedAt: now,
        },
        dailyBlundr: {
          type: "daily_blundr",
          goal: 1,
          progress: 1,
          completed: true,
          completedAt: now,
        },
      },
      updatedAt: now,
    });
    const reloaded = loadDailyRingSnapshot({ userId, localDate });
    assert.equal(reloaded.tempo.current, 4);
    assert.equal(reloaded.tempo.target, 5);
    assert.equal(reloaded.tempo.percent, 80);
    assert.equal(reloaded.tempo.complete, false);
    assert.equal(getLocalTrainingProfile(userId)?.dailyTempoGoal, 5);
    assert.equal(getLocalDailyRetentionProgress(userId, localDate)?.rings.dailyTempo.goal, 2);
  } finally {
    restore();
    resetLocalAccountState(userIdFromTest());
  }
}

function userIdFromTest(): string {
  return "daily-ring-user";
}

(async () => {
  await main();
  console.log("dailyRingHomeProgress.test.ts passed");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
