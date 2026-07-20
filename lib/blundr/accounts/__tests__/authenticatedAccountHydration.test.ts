import assert from "node:assert/strict";
import test from "node:test";

import {
  createDefaultDailyRetentionProgress,
  createDefaultRewardHistory,
  createDefaultStreakRecord,
  createDefaultTrainingProfile,
  createDefaultUserRepertoire,
} from "../accountDefaults";
import { persistAuthenticatedAccountSnapshot } from "../authenticatedAccountHydration";
import {
  getLocalAccountCurrentUserId,
  getLocalTrainingProfile,
  getLocalUserRepertoire,
  resetLocalAccountState,
} from "../localAccountStorage";

function installLocalStorageMock(): () => void {
  const entries = new Map<string, string>();
  const storage = {
    get length() {
      return entries.size;
    },
    key(index: number) {
      return Array.from(entries.keys())[index] ?? null;
    },
    getItem(key: string) {
      return entries.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      entries.set(key, String(value));
    },
    removeItem(key: string) {
      entries.delete(key);
    },
    clear() {
      entries.clear();
    },
  } as Storage;
  const previous = globalThis.localStorage;
  globalThis.localStorage = storage;
  return () => {
    if (previous) globalThis.localStorage = previous;
    else delete (globalThis as { localStorage?: Storage }).localStorage;
  };
}

function snapshot(userId: string) {
  const now = "2026-07-20T12:00:00.000Z";
  return {
    user: {
      userId,
      email: null,
      mode: "authenticated" as const,
      isAuthenticated: true,
      isAdmin: false,
      accessToken: null,
      provider: "supabase",
    },
    profile: {
      ...createDefaultTrainingProfile(userId, now),
      onboardingCompleted: true,
      selectedStarterPackId: "classical_attacker" as const,
      dailyTempoGoal: 10,
      dailyBatteryGoal: 3,
      dailyBlundrGoal: 1,
    },
    repertoire: {
      ...createDefaultUserRepertoire(userId, now),
      selectedStarterPackId: "classical_attacker" as const,
      unlockedOpeningIds: ["italian-white", "french-black"],
      lockedOpeningIds: ["sicilian-white"],
      openingUnlockPoints: 8,
    },
    streakRecord: createDefaultStreakRecord(userId, now),
    rewardHistory: createDefaultRewardHistory(userId, now),
    dailyRetentionProgress: createDefaultDailyRetentionProgress(
      userId,
      "2026-07-20",
      {
        dailyTempoGoal: 10,
        dailyBatteryGoal: 3,
        dailyBlundrGoal: 1,
      },
      now,
    ),
  };
}

test("authenticated hydration preserves durable onboarding and starter repertoire", () => {
  const restore = installLocalStorageMock();
  try {
    resetLocalAccountState("local-demo-user");
    const result = persistAuthenticatedAccountSnapshot(
      "user-a",
      snapshot("user-a"),
    );
    assert.deepEqual(result, { ok: true, userId: "user-a" });
    assert.equal(getLocalAccountCurrentUserId(), "user-a");
    assert.equal(getLocalTrainingProfile("user-a")?.onboardingCompleted, true);
    assert.deepEqual(getLocalUserRepertoire("user-a")?.unlockedOpeningIds, [
      "italian-white",
      "french-black",
    ]);

    // A clean-session rehydration restores the same durable state.
    resetLocalAccountState("local-demo-user");
    assert.equal(
      persistAuthenticatedAccountSnapshot("user-a", snapshot("user-a")).ok,
      true,
    );
    assert.equal(getLocalUserRepertoire("user-a")?.openingUnlockPoints, 8);
  } finally {
    restore();
  }
});

test("mismatched snapshots make no local identity or account writes", () => {
  const restore = installLocalStorageMock();
  try {
    resetLocalAccountState("local-demo-user");
    assert.deepEqual(
      persistAuthenticatedAccountSnapshot("user-a", snapshot("user-b")),
      {
        ok: false,
        code: "user_mismatch",
      },
    );
    assert.equal(getLocalAccountCurrentUserId(), "local-demo-user");
    assert.equal(getLocalTrainingProfile("user-b"), null);
    assert.equal(getLocalUserRepertoire("user-b"), null);
  } finally {
    restore();
  }
});
