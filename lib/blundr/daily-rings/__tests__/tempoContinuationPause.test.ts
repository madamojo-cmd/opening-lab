import assert from "node:assert/strict";

import { createDefaultTrainingProfile } from "../../accounts/accountDefaults";
import { resetLocalAccountState, setLocalAccountCurrentUserId, upsertLocalTrainingProfile } from "../../accounts/localAccountStorage";
import { getDailyBlundrDateKey } from "../../daily/dailyBlundrStorage";
import { loadBlundrProgressSummary } from "../../progress/progressSummaryService";
import { loadRepertoireProgress } from "../../repertoire/repertoireProgressService";
import { buildTempoContinuationPauseCompletionId, recordTempoRunCompleted } from "../dailyRingGameplayEvents";
import { loadDailyRingSnapshot } from "../dailyRingService";
import { resolveTempoContinuationPauseCompletion, type TempoContinuationPauseInput } from "../tempoContinuationPause";

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

function installBrowserEnvironment(): () => void {
  const previousWindow = (globalThis as { window?: unknown }).window;
  const previousLocalStorage = (globalThis as { localStorage?: Storage }).localStorage;
  const previousCustomEvent = (globalThis as { CustomEvent?: typeof CustomEvent }).CustomEvent;
  const storage = new MemoryStorage();

  class TestCustomEvent<T = unknown> extends Event {
    detail: T;
    constructor(type: string, init?: CustomEventInit<T>) {
      super(type, init);
      this.detail = init?.detail as T;
    }
  }

  (globalThis as { localStorage?: Storage }).localStorage = storage;
  (globalThis as { window?: unknown }).window = {
    localStorage: storage,
    dispatchEvent: () => true,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  };
  if (!previousCustomEvent) {
    (globalThis as { CustomEvent?: typeof CustomEvent }).CustomEvent = TestCustomEvent as unknown as typeof CustomEvent;
  }

  return () => {
    if (previousWindow) (globalThis as { window?: unknown }).window = previousWindow;
    else delete (globalThis as { window?: unknown }).window;
    if (previousLocalStorage) (globalThis as { localStorage?: Storage }).localStorage = previousLocalStorage;
    else delete (globalThis as { localStorage?: Storage }).localStorage;
    if (previousCustomEvent) (globalThis as { CustomEvent?: typeof CustomEvent }).CustomEvent = previousCustomEvent;
    else delete (globalThis as { CustomEvent?: typeof CustomEvent }).CustomEvent;
  };
}

function basePauseInput(overrides: Partial<TempoContinuationPauseInput> = {}): TempoContinuationPauseInput {
  return {
    activeTab: "train",
    trainingMode: "restricted",
    isUserTurn: true,
    isGameOver: false,
    legalMoveCount: 12,
    userExplicitlyEnteredContinuation: false,
    continueFromHereClicked: false,
    branchTransitionSurfaceRendered: true,
    branchCompleteEligibleNow: true,
    terminalProofProven: true,
    selectedLineCompleteConfirmed: true,
    currentInstructionFrameKind: "branch_complete",
    canonicalOpeningId: "italian-game",
    runSessionId: "run-1",
    lineId: "line-a",
    terminalFen: "fen-after-line-a",
    completionIndex: 12,
    pauseOccurrenceIndex: 1,
    previousAtContinuationPause: false,
    ...overrides,
  };
}

function tempoProgressFromSummary(summary: ReturnType<typeof loadBlundrProgressSummary>): number {
  return summary.today.rings.find((ring) => ring.ringId === "daily_tempo")?.progress ?? -1;
}

async function main(): Promise<void> {
  const restore = installBrowserEnvironment();
  const userId = "tempo-continuation-pause-user";
  const today = getDailyBlundrDateKey();
  const now = `${today}T10:00:00.000Z`;
  const recordedKeys = new Set<string>();

  try {
    resetLocalAccountState(userId);
    setLocalAccountCurrentUserId(userId);
    upsertLocalTrainingProfile({
      ...createDefaultTrainingProfile(userId, now),
      dailyTempoGoal: 5,
      dailyBatteryGoal: 3,
      dailyBlundrGoal: 1,
      onboardingCompleted: true,
      updatedAt: now,
    });

    const firstDecision = resolveTempoContinuationPauseCompletion(basePauseInput({ recordedCompletionIds: recordedKeys }));
    assert.equal(firstDecision.atContinuationPause, true);
    assert.equal(firstDecision.shouldRecord, true);
    assert.ok(firstDecision.completionKey);
    assert.equal(
      firstDecision.completionKey,
      buildTempoContinuationPauseCompletionId({
        openingId: "italian-game",
        runSessionId: "run-1",
        lineId: "line-a",
        terminalFen: "fen-after-line-a",
        completionIndex: 12,
        pauseOccurrenceIndex: 1,
      }),
    );

    recordedKeys.add(firstDecision.completionKey);
    const firstRecord = await recordTempoRunCompleted({
      userId,
      openingId: "italian-game",
      runSessionId: "run-1",
      terminalFen: "fen-after-line-a",
      completionIndex: 12,
      completionId: firstDecision.completionKey,
      repertoireProgress: loadRepertoireProgress({ userId, now }),
      profile: { dailyTempoGoal: 5, dailyBatteryGoal: 3, dailyBlundrGoal: 1 },
      now,
    });
    assert.equal(firstRecord.ok, true);
    if (!firstRecord.ok) throw new Error(firstRecord.message);
    assert.equal(firstRecord.activityAlreadyApplied, false);
    assert.equal(firstRecord.dayRecord.dailyTempo.progress, 1);
    assert.equal(loadDailyRingSnapshot({ userId, localDate: today }).tempo.current, 1);
    assert.equal(tempoProgressFromSummary(loadBlundrProgressSummary({ userId, now })), 1);

    const rerenderDecision = resolveTempoContinuationPauseCompletion(basePauseInput({
      previousAtContinuationPause: true,
      recordedCompletionIds: recordedKeys,
    }));
    assert.equal(rerenderDecision.atContinuationPause, true);
    assert.equal(rerenderDecision.shouldRecord, false);
    assert.equal(rerenderDecision.blockedReason, "same_pause_still_rendering");

    const duplicate = await recordTempoRunCompleted({
      userId,
      openingId: "italian-game",
      runSessionId: "run-1",
      terminalFen: "fen-after-line-a",
      completionIndex: 12,
      completionId: firstDecision.completionKey,
      repertoireProgress: loadRepertoireProgress({ userId, now }),
      profile: { dailyTempoGoal: 5, dailyBatteryGoal: 3, dailyBlundrGoal: 1 },
      now,
    });
    assert.equal(duplicate.ok, true);
    if (!duplicate.ok) throw new Error(duplicate.message);
    assert.equal(duplicate.activityAlreadyApplied, true);
    assert.equal(loadDailyRingSnapshot({ userId, localDate: today }).tempo.current, 1);

    const secondDecision = resolveTempoContinuationPauseCompletion(basePauseInput({
      runSessionId: "run-2",
      terminalFen: "fen-after-line-b",
      lineId: "line-b",
      pauseOccurrenceIndex: 2,
      previousAtContinuationPause: false,
      recordedCompletionIds: recordedKeys,
    }));
    assert.equal(secondDecision.shouldRecord, true);
    assert.ok(secondDecision.completionKey);
    const secondRecord = await recordTempoRunCompleted({
      userId,
      openingId: "italian-game",
      runSessionId: "run-2",
      terminalFen: "fen-after-line-b",
      completionIndex: 12,
      completionId: secondDecision.completionKey,
      repertoireProgress: loadRepertoireProgress({ userId, now }),
      profile: { dailyTempoGoal: 5, dailyBatteryGoal: 3, dailyBlundrGoal: 1 },
      now,
    });
    assert.equal(secondRecord.ok, true);
    if (!secondRecord.ok) throw new Error(secondRecord.message);
    assert.equal(secondRecord.dayRecord.dailyTempo.progress, 2);
    assert.equal(tempoProgressFromSummary(loadBlundrProgressSummary({ userId, now })), 2);

    const exhaustedWithoutCursor = resolveTempoContinuationPauseCompletion(basePauseInput({
      runSessionId: "run-3",
      terminalFen: "fen-after-line-c",
      lineId: "line-c",
      selectedLineCompleteConfirmed: false,
      terminalProofProven: true,
      branchCompleteEligibleNow: true,
      pauseOccurrenceIndex: 3,
      previousAtContinuationPause: false,
      recordedCompletionIds: recordedKeys,
    }));
    assert.equal(exhaustedWithoutCursor.atContinuationPause, true);
    assert.equal(exhaustedWithoutCursor.shouldRecord, true);

    const missingOpening = resolveTempoContinuationPauseCompletion(basePauseInput({ canonicalOpeningId: "" }));
    assert.equal(missingOpening.atContinuationPause, true);
    assert.equal(missingOpening.shouldRecord, false);
    assert.equal(missingOpening.blockedReason, "missing_canonical_opening_id");

    const ordinaryMove = resolveTempoContinuationPauseCompletion(basePauseInput({
      branchTransitionSurfaceRendered: false,
      currentInstructionFrameKind: "guided_move",
      selectedLineCompleteConfirmed: false,
      terminalProofProven: false,
    }));
    assert.equal(ordinaryMove.atContinuationPause, false);
    assert.equal(ordinaryMove.shouldRecord, false);
  } finally {
    restore();
    resetLocalAccountState(userId);
  }
}

(async () => {
  await main();
  console.log("tempoContinuationPause.test.ts passed");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
