import { normalizeStarterPackId } from "../accounts/accountDefaults";
import type { RatingBandId, StarterPackId, UserRepertoire, UserTrainingProfile } from "../accounts/accountTypes";
import { STAGE2_RUNTIME_OPENING_IDS } from "../openings/openingAvailability";
import type { DailyGoalPresetId, BlundrOnboardingState, OnboardingAccountChoice, OnboardingAuthMode, OnboardingStepId, OnboardingTrainingModeChoice } from "./onboardingTypes";
import { getDefaultDailyGoalPreset, getDailyGoalPresetById, normalizeDailyGoalPreset } from "./dailyGoalPresets";
import { getDefaultRatingBand, getRatingBandById, normalizeRatingBandInput } from "./ratingBand";
import { buildInitialRepertoireFromStarterPack, getDefaultStarterPack, getStarterPackById } from "./starterPacks";
import { getNextOnboardingStepId, getOnboardingStepById, getOnboardingStepCount, getPreviousOnboardingStepId, normalizeOnboardingStepId, ONBOARDING_STEP_SEQUENCE } from "./onboardingSteps";

export const BLUNDR_ONBOARDING_STORAGE_KEY = "blundr.onboarding.v1";

type LocalStorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

function nowIso(): string {
  return new Date().toISOString();
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function getStorage(): LocalStorageLike | undefined {
  if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  if (typeof globalThis !== "undefined" && "localStorage" in globalThis) {
    return (globalThis as typeof globalThis & { localStorage?: LocalStorageLike }).localStorage;
  }
  return undefined;
}

function uniqueSteps(stepIds: readonly OnboardingStepId[]): OnboardingStepId[] {
  const seen = new Set<OnboardingStepId>();
  const next: OnboardingStepId[] = [];
  for (const stepId of stepIds) {
    const normalized = normalizeOnboardingStepId(stepId);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    next.push(normalized);
  }
  return next;
}

function normalizeAccountChoice(value: unknown): OnboardingAccountChoice {
  return value === "account" ? "account" : "local_demo";
}

function normalizeAuthMode(value: unknown): OnboardingAuthMode | undefined {
  return value === "sign_in" || value === "sign_up" ? value : undefined;
}

function normalizeTrainingMode(value: unknown): OnboardingTrainingModeChoice {
  return value === "plain" ? "plain" : "assisted";
}

function normalizeRatingSource(value: unknown): BlundrOnboardingState["ratingSource"] {
  return value === "manual" || value === "chesscom" || value === "lichess" || value === "default" ? value : "default";
}

function normalizeStringOrUndefined(value: unknown): string | undefined {
  const text = normalizeText(value);
  return text ? text : undefined;
}

export function createDefaultOnboardingState(now = nowIso()): BlundrOnboardingState {
  const ratingBand = getDefaultRatingBand();
  const starterPack = getDefaultStarterPack();
  const dailyGoalPreset = getDefaultDailyGoalPreset();
  return {
    stepId: "welcome",
    completedStepIds: [],
    accountChoice: "local_demo",
    ratingBandId: ratingBand.id as RatingBandId,
    ratingSource: "default",
    selectedStarterPackId: starterPack.id as StarterPackId,
    dailyGoalPresetId: dailyGoalPreset.id as DailyGoalPresetId,
    dailyTempoGoal: dailyGoalPreset.dailyTempoGoal,
    dailyBatteryGoal: dailyGoalPreset.dailyBatteryGoal,
    dailyBlundrGoal: dailyGoalPreset.dailyBlundrGoal,
    dailyBlundrCardGoal: dailyGoalPreset.dailyBlundrCardGoal,
    preferredTrainingMode: "assisted",
    onboardingCompleted: false,
    updatedAt: now,
  };
}

export function normalizeOnboardingState(input: unknown, now = nowIso()): BlundrOnboardingState {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return createDefaultOnboardingState(now);
  }

  const raw = input as Partial<BlundrOnboardingState> & Record<string, unknown>;
  const defaultState = createDefaultOnboardingState(now);
  const ratingBandId = normalizeRatingBandInput(raw.ratingBandId);
  const dailyGoalPresetId = normalizeDailyGoalPreset(raw.dailyGoalPresetId);
  const dailyGoalPreset = getDailyGoalPresetById(dailyGoalPresetId) ?? getDefaultDailyGoalPreset();
  const starterPackId = normalizeStarterPackId(raw.selectedStarterPackId) ?? getDefaultStarterPack().id;
  const starterPack = getStarterPackById(starterPackId) ?? getDefaultStarterPack();
  const completedStepIds = uniqueSteps(
    Array.isArray(raw.completedStepIds)
      ? raw.completedStepIds.filter((stepId): stepId is OnboardingStepId => ONBOARDING_STEP_SEQUENCE.includes(normalizeOnboardingStepId(stepId)))
      : [],
  );
  const normalizedStepId = normalizeOnboardingStepId(raw.stepId);
  const selectedPresetFromInput = getDailyGoalPresetById(dailyGoalPresetId) ?? dailyGoalPreset;

  const next: BlundrOnboardingState = {
    ...defaultState,
    stepId: getOnboardingStepById(normalizedStepId)?.id ?? defaultState.stepId,
    completedStepIds,
    accountChoice: normalizeAccountChoice(raw.accountChoice),
    authMode: normalizeAuthMode(raw.authMode),
    authenticatedUserId: normalizeStringOrUndefined(raw.authenticatedUserId),
    authenticatedEmail: normalizeStringOrUndefined(raw.authenticatedEmail),
    ratingBandId,
    ratingSource: normalizeRatingSource(raw.ratingSource),
    selectedStarterPackId: starterPack.id,
    dailyGoalPresetId,
    dailyTempoGoal: Math.max(1, Number(raw.dailyTempoGoal) || selectedPresetFromInput.dailyTempoGoal),
    dailyBatteryGoal: Math.max(1, Number(raw.dailyBatteryGoal) || selectedPresetFromInput.dailyBatteryGoal),
    dailyBlundrGoal: Math.max(1, Number(raw.dailyBlundrGoal) || selectedPresetFromInput.dailyBlundrGoal),
    dailyBlundrCardGoal: Math.max(1, Math.min(99, Number(raw.dailyBlundrCardGoal) || selectedPresetFromInput.dailyBlundrCardGoal)),
    preferredTrainingMode: normalizeTrainingMode(raw.preferredTrainingMode),
    onboardingCompleted: Boolean(raw.onboardingCompleted),
    updatedAt: normalizeText(raw.updatedAt) || now,
  };

  if (next.onboardingCompleted && next.stepId !== "start_training") {
    next.stepId = "start_training";
  }
  if (next.onboardingCompleted && !next.completedStepIds.includes("start_training")) {
    next.completedStepIds = uniqueSteps([...next.completedStepIds, "start_training"]);
  }

  return next;
}

export function readLocalOnboardingState(): BlundrOnboardingState | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(BLUNDR_ONBOARDING_STORAGE_KEY);
    if (!raw) return null;
    return normalizeOnboardingState(JSON.parse(raw));
  } catch {
    return createDefaultOnboardingState();
  }
}

export function writeLocalOnboardingState(state: BlundrOnboardingState): BlundrOnboardingState {
  const normalized = normalizeOnboardingState(state);
  const storage = getStorage();
  if (storage) {
    try {
      storage.setItem(BLUNDR_ONBOARDING_STORAGE_KEY, JSON.stringify(normalized));
    } catch {
      // local onboarding state is best-effort
    }
  }
  return cloneJson(normalized);
}

export function updateLocalOnboardingState(updater: (state: BlundrOnboardingState) => BlundrOnboardingState): BlundrOnboardingState {
  return writeLocalOnboardingState(updater(readLocalOnboardingState() ?? createDefaultOnboardingState()));
}

export function clearLocalOnboardingState(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(BLUNDR_ONBOARDING_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function getOnboardingStateStepCount(): number {
  return getOnboardingStepCount();
}

export function advanceOnboardingStep(state: BlundrOnboardingState): BlundrOnboardingState {
  const current = normalizeOnboardingState(state);
  const nextStep = getNextOnboardingStepId(current.stepId);
  const completedStepIds = current.stepId === nextStep ? current.completedStepIds : uniqueSteps([...current.completedStepIds, current.stepId]);
  return normalizeOnboardingState({
    ...current,
    stepId: nextStep,
    completedStepIds,
    updatedAt: nowIso(),
  });
}

export function goBackOnboardingStep(state: BlundrOnboardingState): BlundrOnboardingState {
  const current = normalizeOnboardingState(state);
  const previousStep = getPreviousOnboardingStepId(current.stepId);
  return normalizeOnboardingState({
    ...current,
    stepId: previousStep,
    updatedAt: nowIso(),
  });
}

export function selectOnboardingAccountChoice(state: BlundrOnboardingState, choice: OnboardingAccountChoice): BlundrOnboardingState {
  const current = normalizeOnboardingState(state);
  return normalizeOnboardingState({
    ...current,
    accountChoice: choice,
    authMode: choice === "local_demo" ? undefined : current.authMode,
    authenticatedUserId: choice === "local_demo" ? undefined : current.authenticatedUserId,
    authenticatedEmail: choice === "local_demo" ? undefined : current.authenticatedEmail,
    updatedAt: nowIso(),
  });
}

export function selectOnboardingRatingBand(state: BlundrOnboardingState, ratingBandId: unknown, ratingSource: BlundrOnboardingState["ratingSource"] = "manual"): BlundrOnboardingState {
  const current = normalizeOnboardingState(state);
  return normalizeOnboardingState({
    ...current,
    ratingBandId: normalizeRatingBandInput(ratingBandId),
    ratingSource,
    updatedAt: nowIso(),
  });
}

export function selectStarterPack(state: BlundrOnboardingState, starterPackId: unknown): BlundrOnboardingState {
  const current = normalizeOnboardingState(state);
  const starterPack = getStarterPackById(normalizeStarterPackId(starterPackId) ?? getDefaultStarterPack().id) ?? getDefaultStarterPack();
  return normalizeOnboardingState({
    ...current,
    selectedStarterPackId: starterPack.id,
    updatedAt: nowIso(),
  });
}

export function selectDailyGoalPreset(state: BlundrOnboardingState, presetId: unknown): BlundrOnboardingState {
  const current = normalizeOnboardingState(state);
  const preset = getDailyGoalPresetById(normalizeDailyGoalPreset(presetId)) ?? getDefaultDailyGoalPreset();
  return normalizeOnboardingState({
    ...current,
    dailyGoalPresetId: preset.id,
    dailyTempoGoal: preset.dailyTempoGoal,
    dailyBatteryGoal: preset.dailyBatteryGoal,
    dailyBlundrGoal: preset.dailyBlundrGoal,
    dailyBlundrCardGoal: preset.dailyBlundrCardGoal,
    updatedAt: nowIso(),
  });
}

export function selectPreferredTrainingMode(state: BlundrOnboardingState, mode: OnboardingTrainingModeChoice): BlundrOnboardingState {
  const current = normalizeOnboardingState(state);
  return normalizeOnboardingState({
    ...current,
    preferredTrainingMode: mode === "plain" ? "plain" : "assisted",
    updatedAt: nowIso(),
  });
}

export function buildTrainingProfileFromOnboarding(state: BlundrOnboardingState, userId: string): UserTrainingProfile {
  const normalized = normalizeOnboardingState(state);
  const ratingBand = getRatingBandById(normalized.ratingBandId) ?? getDefaultRatingBand();
  const starterPack = getStarterPackById(normalized.selectedStarterPackId) ?? getDefaultStarterPack();
  const preset = getDailyGoalPresetById(normalizeDailyGoalPreset(normalized.dailyGoalPresetId)) ?? getDefaultDailyGoalPreset();
  const timestamp = normalized.updatedAt || nowIso();
  return {
    userId: normalizeText(userId),
    onboardingCompleted: Boolean(normalized.onboardingCompleted),
    ratingBandId: ratingBand.id,
    ratingSource: normalized.ratingSource,
    preferredTrainingMode: normalized.preferredTrainingMode,
    dailyTempoGoal: Math.max(1, Number(normalized.dailyTempoGoal) || preset.dailyTempoGoal),
    dailyBatteryGoal: Math.max(1, Number(normalized.dailyBatteryGoal) || preset.dailyBatteryGoal),
    dailyBlundrGoal: Math.max(1, Number(normalized.dailyBlundrGoal) || preset.dailyBlundrGoal),
    dailyBlundrCardGoal: Math.max(1, Math.min(99, Number(normalized.dailyBlundrCardGoal) || preset.dailyBlundrCardGoal)),
    selectedStarterPackId: starterPack.id,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function buildRepertoireFromOnboarding(state: BlundrOnboardingState, userId: string, allOpeningIds: readonly string[] = STAGE2_RUNTIME_OPENING_IDS): UserRepertoire {
  const normalized = normalizeOnboardingState(state);
  const starterPack = getStarterPackById(normalized.selectedStarterPackId) ?? getDefaultStarterPack();
  return buildInitialRepertoireFromStarterPack({
    userId: normalizeText(userId),
    starterPackId: starterPack.id,
    allOpeningIds,
    now: normalized.updatedAt || nowIso(),
  });
}
