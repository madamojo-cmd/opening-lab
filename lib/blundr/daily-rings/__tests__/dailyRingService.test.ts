import assert from "node:assert/strict";

import { createDefaultTrainingProfile } from "@/lib/blundr/accounts/accountDefaults";
import {
  resetLocalAccountState,
  setLocalAccountCurrentUserId,
  upsertLocalTrainingProfile,
} from "@/lib/blundr/accounts/localAccountStorage";
import { loadRepertoireProgress } from "@/lib/blundr/repertoire/repertoireProgressService";
import {
  completeDailyRingActivity,
  buildDailyRingCompletionResult,
  loadDailyRingSnapshot,
} from "../dailyRingService";

function installLocalStorageMock(): () => void {
  const entries = new Map<string, string>();
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

  const previous = (globalThis as { localStorage?: Storage }).localStorage;
  (globalThis as { localStorage?: Storage }).localStorage = localStorageMock;
  return () => {
    if (previous) {
      (globalThis as { localStorage?: Storage }).localStorage = previous;
    } else {
      delete (globalThis as { localStorage?: Storage }).localStorage;
    }
  };
}

async function main(): Promise<void> {
  const restoreLocalStorage = installLocalStorageMock();
  const previousStorageMode = process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE;
  process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE = "local_demo";
  try {
    const userId = "local-demo-user";
    resetLocalAccountState(userId);
    setLocalAccountCurrentUserId(userId);
    upsertLocalTrainingProfile({
      ...createDefaultTrainingProfile(userId, "2026-07-04T08:00:00.000Z"),
      dailyTempoGoal: 1,
      dailyBatteryGoal: 1,
      dailyBlundrGoal: 1,
      onboardingCompleted: true,
    });

    const snapshot = loadDailyRingSnapshot({ userId, localDate: "2026-07-04" });
    const preview = buildDailyRingCompletionResult({
      userId,
      activity: {
        userId,
        source: "opening_run_completed",
        completionId: "opening-preview",
        openingId: "italian-white",
        createdAt: "2026-07-04T08:00:00.000Z",
      },
      dayRecord: snapshot.dayRecord,
      streakRecord: snapshot.streakRecord,
      repertoireProgress: loadRepertoireProgress({ userId }),
      profile: {
        dailyTempoGoal: 1,
        dailyBatteryGoal: 1,
        dailyBlundrGoal: 1,
      },
      now: "2026-07-04T08:00:00.000Z",
    });
    assert.ok(preview.ok);
    if (preview.ok) {
      assert.equal(preview.source, "opening_run_completed");
      assert.equal(preview.ringClosedThisAction, true);
      assert.equal(preview.repertoirePointsAwarded, 1);
      assert.equal(preview.xpAwarded, 10);
    }

    const opening = await completeDailyRingActivity({
      userId,
      activity: {
        userId,
        source: "opening_run_completed",
        completionId: "opening-1",
        openingId: "italian-white",
        createdAt: "2026-07-04T08:00:00.000Z",
      },
      repertoireProgress: loadRepertoireProgress({ userId }),
      profile: {
        dailyTempoGoal: 1,
        dailyBatteryGoal: 1,
        dailyBlundrGoal: 1,
      },
      now: "2026-07-04T08:00:00.000Z",
    });
    assert.ok(opening.ok);

    const continuation = await completeDailyRingActivity({
      userId,
      activity: {
        userId,
        source: "continuation_completed",
        completionId: "continuation-1",
        openingId: "italian-white",
        createdAt: "2026-07-04T09:00:00.000Z",
      },
      repertoireProgress: loadRepertoireProgress({ userId }),
      profile: {
        dailyTempoGoal: 1,
        dailyBatteryGoal: 1,
        dailyBlundrGoal: 1,
      },
      now: "2026-07-04T09:00:00.000Z",
    });
    assert.ok(continuation.ok);

    const dailyBlundr = await completeDailyRingActivity({
      userId,
      activity: {
        userId,
        source: "daily_blundr_deck_completed",
        completionId: "daily-1",
        dailySessionId: "session-1",
        createdAt: "2026-07-04T10:00:00.000Z",
      },
      repertoireProgress: loadRepertoireProgress({ userId }),
      profile: {
        dailyTempoGoal: 1,
        dailyBatteryGoal: 1,
        dailyBlundrGoal: 1,
      },
      now: "2026-07-04T10:00:00.000Z",
    });
    assert.ok(dailyBlundr.ok);
    if (dailyBlundr.ok) {
      assert.equal(dailyBlundr.allRingsClosedThisAction, true);
      assert.equal(dailyBlundr.repertoirePointsAwarded, 15);
      assert.equal(dailyBlundr.xpAwarded, 150);
      assert.equal(dailyBlundr.dayRecord.repertoirePointsEarnedToday, 18);
      assert.equal(dailyBlundr.dayRecord.xpEarnedToday, 180);
      assert.equal(dailyBlundr.streakRecord.currentStreakDays, 1);
      assert.equal(dailyBlundr.streakRecord.totalAllRingsClosedDays, 1);
      assert.equal(dailyBlundr.dayRecord.allRingsClosed, true);
    }

    const duplicate = await completeDailyRingActivity({
      userId,
      activity: {
        userId,
        source: "daily_blundr_deck_completed",
        completionId: "daily-1",
        dailySessionId: "session-1",
        createdAt: "2026-07-04T11:00:00.000Z",
      },
      repertoireProgress: loadRepertoireProgress({ userId }),
      profile: {
        dailyTempoGoal: 1,
        dailyBatteryGoal: 1,
        dailyBlundrGoal: 1,
      },
      now: "2026-07-04T11:00:00.000Z",
    });
    assert.ok(duplicate.ok);
    if (duplicate.ok) {
      assert.equal(duplicate.activityAlreadyApplied, true);
      assert.equal(duplicate.repertoirePointsAwarded, 0);
      assert.equal(duplicate.xpAwarded, 0);
    }
  } finally {
    if (previousStorageMode === undefined) {
      delete process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE;
    } else {
      process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE = previousStorageMode;
    }
    restoreLocalStorage();
  }
}

void main()
  .then(() => {
    console.log("dailyRingService.test.ts passed");
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
