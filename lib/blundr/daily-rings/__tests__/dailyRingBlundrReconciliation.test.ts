import assert from "node:assert/strict";
import { Chess } from "chess.js";

import { createDefaultTrainingProfile } from "../../accounts/accountDefaults";
import { resetLocalAccountState, setLocalAccountCurrentUserId, upsertLocalTrainingProfile } from "../../accounts/localAccountStorage";
import { createEmptyDailyBlundrSession, loadDailyBlundrStore, markDailyBlundrSessionCardComplete, markDailyBlundrSessionStarted, reconcileDailyBlundrSession, saveDailyBlundrStore, upsertDailyBlundrSessionStore } from "../../daily/dailyBlundrStorage";
import { getDailyBlundrDateKey } from "../../daily/dailyBlundrStorage";
import { isDailyBlundrSessionComplete } from "../../daily/dailyBlundrSessionController";
import { loadDailyBlundrOverview } from "../../daily/dailyBlundrReadModel";
import { loadDailyRingSnapshot } from "../dailyRingService";
import { reconcileDailyBlundrRingCompletionForToday } from "../dailyRingBlundrReconciliation";
import { getLocalAccountCurrentUserId } from "../../accounts/localAccountStorage";

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
    const userId = "daily-blundr-reconcile-user";
    const now = "2026-07-08T09:00:00.000Z";
    const dateKey = getDailyBlundrDateKey();
    const cardKey = "reconcile-card-1";
    resetLocalAccountState(userId);
    setLocalAccountCurrentUserId(userId);
    upsertLocalTrainingProfile({
      ...createDefaultTrainingProfile(userId, now),
      dailyTempoGoal: 10,
      dailyBatteryGoal: 3,
      dailyBlundrGoal: 1,
      updatedAt: now,
    });

    const card = {
      id: cardKey,
      cardKey,
      kind: "recall" as const,
      source: "daily_attempt" as const,
      positionKey: "start",
      fen: new Chess().fen(),
      expectedMoveUci: "e2e4",
      expectedMoveSan: "e4",
      playedMoveUci: null,
      playedMoveSan: null,
      openingId: "italian-white",
      openingName: "Italian Game",
      patternId: null,
      concept: null,
      count: 1,
      weight: 1,
      lastSeenAt: null,
      note: null,
      signals: [],
      masteryTargets: [],
      confidence: "high" as const,
      difficulty: "beginner" as const,
      title: "Recall e4",
      prompt: "Play e4.",
      deckRank: 1,
      priority: 1,
      masteryKey: cardKey,
      sourceCount: 1,
      summary: "Recall the opening move.",
      repertoireId: "italian-white",
      reviewCardId: null,
      reviewDedupeKey: null,
      reviewPromptKind: null,
      reviewStatus: null,
      reviewDueAt: null,
      miniGame: null,
      trainingTarget: null,
    };

    const seededSession = reconcileDailyBlundrSession({
      dateKey,
      deck: [card],
      existing: createEmptyDailyBlundrSession(dateKey, cardKey),
    });
    const completedSession = markDailyBlundrSessionCardComplete(markDailyBlundrSessionStarted(seededSession, now), cardKey, now);
    const store = loadDailyBlundrStore();
    saveDailyBlundrStore({
      ...store,
      sessions: upsertDailyBlundrSessionStore(store.sessions, completedSession),
    });

    const before = loadDailyRingSnapshot({ userId, localDate: dateKey });
    assert.equal(before.blundr.complete, false);

    const overview = loadDailyBlundrOverview(5);
    assert.equal(isDailyBlundrSessionComplete(overview.currentSession), true);

    const result = await reconcileDailyBlundrRingCompletionForToday({ overview, userId, now });
    assert.equal(result?.ok, true);
    if (!result?.ok) throw new Error(result?.message ?? "expected success");
    assert.equal(result.activityAlreadyApplied, false);
    const reconciled = loadDailyRingSnapshot({ userId, localDate: dateKey });
    assert.equal(reconciled.blundr.complete, true);
    assert.equal(reconciled.blundr.current, 1);
    assert.equal(reconciled.allComplete, false);

    const duplicate = await reconcileDailyBlundrRingCompletionForToday({ overview, userId, now });
    assert.equal(duplicate, null);
    assert.equal(getLocalAccountCurrentUserId(), userId);

    console.log("dailyRingBlundrReconciliation.test.ts passed");
  } finally {
    restore();
    resetLocalAccountState("daily-blundr-reconcile-user");
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
