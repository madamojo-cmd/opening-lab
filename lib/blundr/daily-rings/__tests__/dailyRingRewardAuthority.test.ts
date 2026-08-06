import assert from "node:assert/strict";

import {
  getLocalDailyRetentionProgress,
  resetLocalAccountState,
  setLocalAccountCurrentUserId,
} from "../../accounts/localAccountStorage";
import { getDailyBlundrDateKey } from "../../daily/dailyBlundrStorage";
import { loadRepertoireProgress } from "../../repertoire/repertoireProgressService";
import { completeDailyRingActivity } from "../dailyRingService";

class MemoryStorage implements Storage {
  private readonly entries = new Map<string, string>();
  get length(): number {
    return this.entries.size;
  }
  clear(): void {
    this.entries.clear();
  }
  getItem(key: string): string | null {
    return this.entries.get(key) ?? null;
  }
  key(index: number): string | null {
    return [...this.entries.keys()][index] ?? null;
  }
  removeItem(key: string): void {
    this.entries.delete(key);
  }
  setItem(key: string, value: string): void {
    this.entries.set(key, value);
  }
}

function installStorage(): () => void {
  const previous = globalThis.localStorage;
  globalThis.localStorage = new MemoryStorage();
  return () => {
    if (previous) globalThis.localStorage = previous;
    else delete (globalThis as { localStorage?: Storage }).localStorage;
  };
}

async function complete(userId: string, completionId: string) {
  return completeDailyRingActivity({
    userId,
    activity: {
      userId,
      source: "opening_run_completed",
      completionId,
      createdAt: "2026-08-06T12:00:00.000Z",
    },
    repertoireProgress: loadRepertoireProgress({ userId }),
    now: "2026-08-06T12:00:00.000Z",
  });
}

async function main(): Promise<void> {
  const restoreStorage = installStorage();
  const previousMode = process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE;
  const localDate = getDailyBlundrDateKey();
  try {
    // An authenticated-shaped identity cannot fall through to local writers
    // when its browser session is absent. No ring record is created either.
    process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE = "authenticated";
    const authenticatedUser = "account-user-1";
    resetLocalAccountState(authenticatedUser);
    setLocalAccountCurrentUserId(authenticatedUser);
    const rejected = await complete(authenticatedUser, "rejected-completion");
    assert.equal(rejected.ok, false);
    if (!rejected.ok) assert.equal(rejected.code, "authentication_required");
    assert.equal(
      getLocalDailyRetentionProgress(authenticatedUser, localDate),
      null,
    );

    // Even an accidentally selected local-demo environment cannot authorize a
    // non-demo identity to award local points, rings, or streak progress.
    process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE = "local_demo";
    const stillRejected = await complete(authenticatedUser, "wrong-identity");
    assert.equal(stillRejected.ok, false);
    if (!stillRejected.ok)
      assert.equal(stillRejected.code, "authentication_required");
    assert.equal(
      getLocalDailyRetentionProgress(authenticatedUser, localDate),
      null,
    );

    // The legacy simulation remains usable only for the explicit local demo.
    const demoUser = "local-demo-user";
    resetLocalAccountState(demoUser);
    setLocalAccountCurrentUserId(demoUser);
    const demo = await complete(demoUser, "demo-completion");
    assert.equal(demo.ok, true);
    assert.ok(getLocalDailyRetentionProgress(demoUser, localDate));
  } finally {
    if (previousMode === undefined)
      delete process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE;
    else process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE = previousMode;
    restoreStorage();
  }
}

void main().then(
  () => console.log("dailyRingRewardAuthority.test.ts passed"),
  (error) => {
    console.error(error);
    process.exitCode = 1;
  },
);
