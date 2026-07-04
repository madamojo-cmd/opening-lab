import assert from "node:assert/strict";

import { BLUNDR_ONBOARDING_STORAGE_KEY, advanceOnboardingStep, buildRepertoireFromOnboarding, buildTrainingProfileFromOnboarding, clearLocalOnboardingState, createDefaultOnboardingState, goBackOnboardingStep, normalizeOnboardingState, readLocalOnboardingState, selectDailyGoalPreset, selectOnboardingAccountChoice, selectOnboardingRatingBand, selectPreferredTrainingMode, selectStarterPack, writeLocalOnboardingState } from "../onboardingState";
import { getStarterPackOpeningIds } from "../starterPacks";

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

const restoreLocalStorage = installLocalStorageMock();
try {
  const defaultState = createDefaultOnboardingState("2026-07-04T12:00:00.000Z");
  assert.equal(defaultState.stepId, "welcome");
  assert.equal(defaultState.selectedStarterPackId, "classical_attacker");
  assert.equal(defaultState.ratingBandId, "1200-1600");
  assert.equal(defaultState.dailyTempoGoal, 10);

  assert.equal(advanceOnboardingStep(defaultState).stepId, "account");
  assert.equal(goBackOnboardingStep(advanceOnboardingStep(defaultState)).stepId, "welcome");
  assert.equal(selectOnboardingAccountChoice(defaultState, "account").accountChoice, "account");
  assert.equal(selectOnboardingRatingBand(defaultState, "not sure", "default").ratingBandId, "1200-1600");
  assert.equal(selectOnboardingRatingBand(defaultState, "u800").ratingBandId, "u800");
  assert.equal(selectOnboardingRatingBand(defaultState, "u800").ratingSource, "manual");
  assert.equal(selectStarterPack(defaultState, "dynamic_fighter").selectedStarterPackId, "dynamic_fighter");
  assert.equal(selectDailyGoalPreset(defaultState, "serious").dailyTempoGoal, 20);
  assert.equal(selectPreferredTrainingMode(defaultState, "plain").preferredTrainingMode, "plain");

  const completedState = normalizeOnboardingState({
    ...defaultState,
    stepId: "starter_pack",
    onboardingCompleted: true,
    selectedStarterPackId: "flexible_strategist",
  });
  assert.equal(completedState.stepId, "start_training");
  assert.ok(completedState.completedStepIds.includes("start_training"));

  const profile = buildTrainingProfileFromOnboarding(
    {
      ...completedState,
      onboardingCompleted: true,
      ratingBandId: "1600-2000",
      dailyGoalPresetId: "serious",
      dailyTempoGoal: 20,
      dailyBatteryGoal: 5,
      dailyBlundrGoal: 1,
      preferredTrainingMode: "plain",
    },
    "user-1",
  );
  assert.equal(profile.userId, "user-1");
  assert.equal(profile.onboardingCompleted, true);
  assert.equal(profile.ratingBandId, "1600-2000");
  assert.equal(profile.preferredTrainingMode, "plain");
  assert.equal(profile.selectedStarterPackId, "flexible_strategist");

  const repertoire = buildRepertoireFromOnboarding(completedState, "user-1");
  assert.equal(repertoire.userId, "user-1");
  assert.equal(repertoire.selectedStarterPackId, "flexible_strategist");
  const flexiblePackOpenings = getStarterPackOpeningIds("flexible_strategist");
  assert.equal(flexiblePackOpenings.whiteOpeningId, "english-white");
  assert.equal(flexiblePackOpenings.blackOpeningId, "slav-black");
  assert.deepEqual(repertoire.unlockedOpeningIds.sort(), [flexiblePackOpenings.whiteOpeningId, flexiblePackOpenings.blackOpeningId].sort());

  const stored = writeLocalOnboardingState({
    ...defaultState,
    stepId: "rating",
    ratingBandId: "800-1200",
    selectedStarterPackId: "solid_builder",
    dailyGoalPresetId: "light",
    dailyTempoGoal: 5,
    dailyBatteryGoal: 1,
    dailyBlundrGoal: 1,
    preferredTrainingMode: "plain",
    onboardingCompleted: false,
    updatedAt: "2026-07-04T12:30:00.000Z",
  });
  assert.equal(stored.ratingBandId, "800-1200");
  assert.equal(readLocalOnboardingState()?.selectedStarterPackId, "solid_builder");
  assert.ok((globalThis as { localStorage?: Storage }).localStorage?.getItem(BLUNDR_ONBOARDING_STORAGE_KEY)?.includes("solid_builder"));

  (globalThis as { localStorage?: Storage }).localStorage?.setItem(BLUNDR_ONBOARDING_STORAGE_KEY, "{not-json");
  assert.equal(readLocalOnboardingState()?.stepId, "welcome");

  clearLocalOnboardingState();
  assert.equal((globalThis as { localStorage?: Storage }).localStorage?.getItem(BLUNDR_ONBOARDING_STORAGE_KEY), null);
} finally {
  restoreLocalStorage();
}

console.log("onboardingState.test.ts passed");
