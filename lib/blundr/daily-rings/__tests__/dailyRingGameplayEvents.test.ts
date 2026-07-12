import assert from "node:assert/strict";

import { createDefaultTrainingProfile } from "../../accounts/accountDefaults";
import { resetLocalAccountState, setLocalAccountCurrentUserId, upsertLocalTrainingProfile } from "../../accounts/localAccountStorage";
import { getDailyBlundrDateKey } from "../../daily/dailyBlundrStorage";
import { loadBlundrProgressSummary } from "../../progress/progressSummaryService";
import { loadRepertoireProgress } from "../../repertoire/repertoireProgressService";
import { BLUNDR_DAILY_RING_REFRESH_EVENT } from "../dailyRingRefreshSignal";
import { loadDailyRingSnapshot } from "../dailyRingService";
import { buildBatteryLineCompletionId, buildBlundrTaskCompletionId, buildTempoRunCompletionId, recordBatteryLineCompleted, recordBlundrTaskCompleted, recordTempoRunCompleted } from "../dailyRingGameplayEvents";

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

type BrowserWindowStub = {
  localStorage: Storage;
  dispatchEvent: (event: Event) => boolean;
  addEventListener: () => void;
  removeEventListener: () => void;
};

function installBrowserEnvironment() {
  const storage = new MemoryStorage();
  const refreshEvents: Event[] = [];
  const previousWindow = (globalThis as { window?: unknown }).window;
  const previousLocalStorage = (globalThis as { localStorage?: Storage }).localStorage;
  const previousCustomEvent = (globalThis as { CustomEvent?: typeof CustomEvent }).CustomEvent;

  class TestCustomEvent<T = unknown> extends Event {
    detail: T;

    constructor(type: string, init?: CustomEventInit<T>) {
      super(type, init);
      this.detail = init?.detail as T;
    }
  }

  const windowStub: BrowserWindowStub = {
    localStorage: storage,
    dispatchEvent(event: Event): boolean {
      refreshEvents.push(event);
      return true;
    },
    addEventListener(): void {},
    removeEventListener(): void {},
  };

  (globalThis as { window?: BrowserWindowStub }).window = windowStub;
  (globalThis as { localStorage?: Storage }).localStorage = storage;
  if (!previousCustomEvent) {
    (globalThis as { CustomEvent?: typeof CustomEvent }).CustomEvent = TestCustomEvent as unknown as typeof CustomEvent;
  }

  return {
    storage,
    refreshEvents,
    restore() {
      if (previousWindow) {
        (globalThis as { window?: unknown }).window = previousWindow;
      } else {
        delete (globalThis as { window?: unknown }).window;
      }
      if (previousLocalStorage) {
        (globalThis as { localStorage?: Storage }).localStorage = previousLocalStorage;
      } else {
        delete (globalThis as { localStorage?: Storage }).localStorage;
      }
      if (previousCustomEvent) {
        (globalThis as { CustomEvent?: typeof CustomEvent }).CustomEvent = previousCustomEvent;
      } else {
        delete (globalThis as { CustomEvent?: typeof CustomEvent }).CustomEvent;
      }
    },
  };
}

function ringSummary(summary: ReturnType<typeof loadBlundrProgressSummary>, ringId: "daily_tempo" | "daily_battery" | "daily_blundr") {
  const ring = summary.today.rings.find((entry) => entry.ringId === ringId);
  assert.ok(ring, `Missing ring summary for ${ringId}`);
  return ring;
}

async function main(): Promise<void> {
  const browser = installBrowserEnvironment();
  const userId = "daily-gameplay-user";
  const today = getDailyBlundrDateKey();
  const now = `${today}T09:00:00.000Z`;
  const tomorrow = "2099-01-01";

  try {
    resetLocalAccountState(userId);
    setLocalAccountCurrentUserId(userId);
    upsertLocalTrainingProfile({
      ...createDefaultTrainingProfile(userId, now),
      dailyTempoGoal: 10,
      dailyBatteryGoal: 3,
      dailyBlundrGoal: 1,
      onboardingCompleted: true,
      updatedAt: now,
    });

    const initialSnapshot = loadDailyRingSnapshot({ userId, localDate: today });
    assert.equal(initialSnapshot.dayRecord.dailyTempo.progress, 0);
    assert.equal(initialSnapshot.dayRecord.dailyBattery.progress, 0);
    assert.equal(initialSnapshot.dayRecord.dailyBlundr.progress, 0);

    const initialSummary = loadBlundrProgressSummary({ userId, now });
    assert.equal(ringSummary(initialSummary, "daily_tempo").progress, 0);
    assert.equal(ringSummary(initialSummary, "daily_battery").progress, 0);
    assert.equal(ringSummary(initialSummary, "daily_blundr").progress, 0);

    const tempoRunId = "tempo-run-1";
    const tempoCompletionId = buildTempoRunCompletionId({
      dateKey: today,
      openingId: "italian-white",
      runSessionId: tempoRunId,
      terminalFen: "fen:tempo-1",
      completionIndex: 0,
    });
    assert.equal(
      tempoCompletionId,
      buildTempoRunCompletionId({
        dateKey: today,
        openingId: "italian-white",
        runSessionId: tempoRunId,
        terminalFen: "fen:tempo-1",
        completionIndex: 0,
      }),
    );

    const tempoFirst = await recordTempoRunCompleted({
      userId,
      openingId: "italian-white",
      runSessionId: tempoRunId,
      terminalFen: "fen:tempo-1",
      completionIndex: 0,
      completionId: tempoCompletionId,
      repertoireProgress: loadRepertoireProgress({ userId, now }),
      profile: { dailyTempoGoal: 10, dailyBatteryGoal: 3, dailyBlundrGoal: 1 },
      now,
    });
    assert.equal(tempoFirst.ok, true);
    if (tempoFirst.ok) {
      assert.equal(tempoFirst.activityAlreadyApplied, false);
      assert.equal(tempoFirst.dayRecord.dailyTempo.progress, 1);
      assert.equal(tempoFirst.dayRecord.dailyTempo.goal, 10);
    }
    assert.equal(browser.refreshEvents.length, 1);
    assert.equal(browser.refreshEvents[0].type, BLUNDR_DAILY_RING_REFRESH_EVENT);
    assert.equal((browser.refreshEvents[0] as CustomEvent).detail.ringId, "daily_tempo");

    const tempoDuplicate = await recordTempoRunCompleted({
      userId,
      openingId: "italian-white",
      runSessionId: tempoRunId,
      terminalFen: "fen:tempo-1",
      completionIndex: 0,
      completionId: tempoCompletionId,
      repertoireProgress: loadRepertoireProgress({ userId, now }),
      profile: { dailyTempoGoal: 10, dailyBatteryGoal: 3, dailyBlundrGoal: 1 },
      now,
    });
    assert.equal(tempoDuplicate.ok, true);
    if (tempoDuplicate.ok) {
      assert.equal(tempoDuplicate.activityAlreadyApplied, true);
      assert.equal(tempoDuplicate.dayRecord.dailyTempo.progress, 1);
    }
    assert.equal(browser.refreshEvents.length, 2);
    assert.equal(loadDailyRingSnapshot({ userId, localDate: today }).dayRecord.dailyTempo.progress, 1);
    assert.equal(ringSummary(loadBlundrProgressSummary({ userId, now }), "daily_tempo").progress, 1);
    assert.equal(loadDailyRingSnapshot({ userId, localDate: tomorrow }).dayRecord.dailyTempo.progress, 0);

    const tempoSecond = await recordTempoRunCompleted({
      userId,
      openingId: "italian-white",
      runSessionId: "tempo-run-2",
      terminalFen: "fen:tempo-2",
      completionIndex: 0,
      completionId: buildTempoRunCompletionId({
        dateKey: today,
        openingId: "italian-white",
        runSessionId: "tempo-run-2",
        terminalFen: "fen:tempo-2",
        completionIndex: 0,
      }),
      repertoireProgress: loadRepertoireProgress({ userId, now }),
      profile: { dailyTempoGoal: 10, dailyBatteryGoal: 3, dailyBlundrGoal: 1 },
      now,
    });
    assert.equal(tempoSecond.ok, true);
    if (tempoSecond.ok) {
      assert.equal(tempoSecond.dayRecord.dailyTempo.progress, 2);
    }
    assert.equal(loadDailyRingSnapshot({ userId, localDate: today }).dayRecord.dailyTempo.progress, 2);
    assert.equal(ringSummary(loadBlundrProgressSummary({ userId, now }), "daily_tempo").progress, 2);

    const batteryCompletionId = buildBatteryLineCompletionId({
      dateKey: today,
      openingId: "italian-white",
      continuationRunId: "continuation-run-1",
      lineId: "line-a",
      checkmateFen: "fen:battery-1",
      completionIndex: 0,
    });
    const batteryFirst = await recordBatteryLineCompleted({
      userId,
      openingId: "italian-white",
      continuationRunId: "continuation-run-1",
      lineId: "line-a",
      checkmateFen: "fen:battery-1",
      completionIndex: 0,
      completionId: batteryCompletionId,
      repertoireProgress: loadRepertoireProgress({ userId, now }),
      profile: { dailyTempoGoal: 10, dailyBatteryGoal: 3, dailyBlundrGoal: 1 },
      now,
    });
    assert.equal(batteryFirst.ok, true);
    if (batteryFirst.ok) {
      assert.equal(batteryFirst.activityAlreadyApplied, false);
      assert.equal(batteryFirst.dayRecord.dailyBattery.progress, 1);
    }
    const batteryDuplicate = await recordBatteryLineCompleted({
      userId,
      openingId: "italian-white",
      continuationRunId: "continuation-run-1",
      lineId: "line-a",
      checkmateFen: "fen:battery-1",
      completionIndex: 0,
      completionId: batteryCompletionId,
      repertoireProgress: loadRepertoireProgress({ userId, now }),
      profile: { dailyTempoGoal: 10, dailyBatteryGoal: 3, dailyBlundrGoal: 1 },
      now,
    });
    assert.equal(batteryDuplicate.ok, true);
    if (batteryDuplicate.ok) {
      assert.equal(batteryDuplicate.activityAlreadyApplied, true);
      assert.equal(batteryDuplicate.dayRecord.dailyBattery.progress, 1);
    }
    assert.equal(loadDailyRingSnapshot({ userId, localDate: today }).dayRecord.dailyBattery.progress, 1);

    const blundrCompletionId = buildBlundrTaskCompletionId({
      dateKey: today,
      deckId: "daily-blundr-deck",
      reviewSessionId: "review-session-1",
      taskId: "daily_blundr_deck_completed",
      completionIndex: 0,
    });
    const blundrFirst = await recordBlundrTaskCompleted({
      userId,
      deckId: "daily-blundr-deck",
      reviewSessionId: "review-session-1",
      taskId: "daily_blundr_deck_completed",
      completionIndex: 0,
      completionId: blundrCompletionId,
      repertoireProgress: loadRepertoireProgress({ userId, now }),
      profile: { dailyTempoGoal: 10, dailyBatteryGoal: 3, dailyBlundrGoal: 1 },
      now,
    });
    assert.equal(blundrFirst.ok, true);
    if (blundrFirst.ok) {
      assert.equal(blundrFirst.activityAlreadyApplied, false);
      assert.equal(blundrFirst.dayRecord.dailyBlundr.progress, 1);
      assert.equal(blundrFirst.allRingsClosedThisAction, false);
    }
    const blundrDuplicate = await recordBlundrTaskCompleted({
      userId,
      deckId: "daily-blundr-deck",
      reviewSessionId: "review-session-1",
      taskId: "daily_blundr_deck_completed",
      completionIndex: 0,
      completionId: blundrCompletionId,
      repertoireProgress: loadRepertoireProgress({ userId, now }),
      profile: { dailyTempoGoal: 10, dailyBatteryGoal: 3, dailyBlundrGoal: 1 },
      now,
    });
    assert.equal(blundrDuplicate.ok, true);
    if (blundrDuplicate.ok) {
      assert.equal(blundrDuplicate.activityAlreadyApplied, true);
      assert.equal(blundrDuplicate.dayRecord.dailyBlundr.progress, 1);
    }
    assert.equal(loadDailyRingSnapshot({ userId, localDate: today }).dayRecord.dailyBlundr.progress, 1);

    const finalSummary = loadBlundrProgressSummary({ userId, now });
    assert.equal(ringSummary(finalSummary, "daily_tempo").progress, 2);
    assert.equal(ringSummary(finalSummary, "daily_battery").progress, 1);
    assert.equal(ringSummary(finalSummary, "daily_blundr").progress, 1);
    assert.equal(ringSummary(finalSummary, "daily_tempo").percent, 20);
    assert.equal(ringSummary(finalSummary, "daily_battery").percent, 33);
    assert.equal(ringSummary(finalSummary, "daily_blundr").percent, 100);
    assert.equal(browser.refreshEvents.length, 7);
    assert.equal((browser.refreshEvents[6] as CustomEvent).detail.ringId, "daily_blundr");
    assert.equal((browser.refreshEvents[6] as CustomEvent).detail.allRingsClosedThisAction, false);
  } finally {
    browser.restore();
    resetLocalAccountState(userId);
  }
}

void main()
  .then(() => {
    console.log("dailyRingGameplayEvents.test.ts passed");
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
