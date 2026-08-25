// server-only: do not import into client components.

import type { BlundrPersistenceAdapter, PersistenceResult } from "../persistence/persistenceTypes";
import { getAccountPersistenceAdapter } from "../accounts/accountRepository";
import type { CurrentBlundrUser, StarterPackId, UserRepertoire, UserTrainingProfile } from "../accounts/accountTypes";
import { STAGE2_RUNTIME_OPENING_IDS } from "../openings/openingAvailability";
import { getDefaultDailyGoalPreset, getDailyGoalPresetById } from "./dailyGoalPresets";
import { getDefaultRatingBand, getRatingBandById, normalizeRatingBandInput } from "./ratingBand";
import { getDefaultStarterPack, getStarterPackById, buildInitialRepertoireFromStarterPack, assertStarterPacksAreValid } from "./starterPacks";
import { getNextOnboardingStepId, getPreviousOnboardingStepId, ONBOARDING_STEP_SEQUENCE } from "./onboardingSteps";
import { normalizeOnboardingState } from "./onboardingState";
import type { BlundrOnboardingState, DailyGoalPresetId, OnboardingAccountChoice, OnboardingAuthMode, OnboardingCompletionResult, OnboardingTrainingModeChoice } from "./onboardingTypes";

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function ensureAdapter(state: BlundrOnboardingState, userId: string, adapter?: BlundrPersistenceAdapter | null): BlundrPersistenceAdapter {
  if (adapter) return adapter;
  const mode = state.accountChoice === "local_demo" ? "local_demo" : "authenticated";
  return getAccountPersistenceAdapter({
    user: {
      userId,
      email: state.authenticatedEmail ?? null,
      mode,
      isAuthenticated: state.accountChoice !== "local_demo",
      isAdmin: false,
      accessToken: null,
      provider: state.accountChoice === "local_demo" ? "local" : "supabase",
    } satisfies CurrentBlundrUser,
    mode,
    allowLocalFallback: true,
  });
}

function fail<T = never>(code: string, message: string, cause?: unknown): PersistenceResult<T> {
  return { ok: false, error: { code, message, cause, retryable: false } };
}

function getPersistenceError(result: PersistenceResult<unknown>) {
  if ("error" in result) {
    return result.error;
  }
  return { code: "persistence_error", message: "Unknown persistence error." };
}

function uniqueSteps(stepIds: readonly typeof ONBOARDING_STEP_SEQUENCE[number][]): typeof ONBOARDING_STEP_SEQUENCE[number][] {
  const seen = new Set<typeof ONBOARDING_STEP_SEQUENCE[number]>();
  const next: typeof ONBOARDING_STEP_SEQUENCE[number][] = [];
  for (const stepId of stepIds) {
    if (seen.has(stepId)) continue;
    seen.add(stepId);
    next.push(stepId);
  }
  return next;
}

function normalizeCompletedStepIds(stepId: BlundrOnboardingState["stepId"]): BlundrOnboardingState["completedStepIds"] {
  const currentIndex = Math.max(0, ONBOARDING_STEP_SEQUENCE.indexOf(stepId));
  return uniqueSteps(ONBOARDING_STEP_SEQUENCE.slice(0, currentIndex + 1) as BlundrOnboardingState["completedStepIds"]);
}

export { createDefaultOnboardingState } from "./onboardingState";

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
  const next: BlundrOnboardingState = {
    ...current,
    accountChoice: choice,
    authMode: choice === "local_demo" ? undefined : current.authMode,
    authenticatedUserId: choice === "local_demo" ? undefined : current.authenticatedUserId,
    authenticatedEmail: choice === "local_demo" ? undefined : current.authenticatedEmail,
    updatedAt: nowIso(),
  };
  return normalizeOnboardingState(next);
}

export function selectOnboardingRatingBand(state: BlundrOnboardingState, ratingBandId: unknown, ratingSource: BlundrOnboardingState["ratingSource"] = "manual"): BlundrOnboardingState {
  const current = normalizeOnboardingState(state);
  const next: BlundrOnboardingState = {
    ...current,
    ratingBandId: normalizeRatingBandInput(ratingBandId),
    ratingSource,
    updatedAt: nowIso(),
  };
  return normalizeOnboardingState(next);
}

export function selectStarterPack(state: BlundrOnboardingState, starterPackId: unknown): BlundrOnboardingState {
  const current = normalizeOnboardingState(state);
  const starterPack = getStarterPackById(normalizeText(starterPackId) as StarterPackId) ?? getDefaultStarterPack();
  return normalizeOnboardingState({
    ...current,
    selectedStarterPackId: starterPack.id,
    updatedAt: nowIso(),
  });
}

export function selectDailyGoalPreset(state: BlundrOnboardingState, presetId: unknown): BlundrOnboardingState {
  const current = normalizeOnboardingState(state);
  const preset = getDailyGoalPresetById(normalizeText(presetId) as DailyGoalPresetId) ?? getDefaultDailyGoalPreset();
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
  const preset = getDailyGoalPresetById(normalized.dailyGoalPresetId) ?? getDefaultDailyGoalPreset();
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

export async function completeOnboarding(state: BlundrOnboardingState, userId: string, adapter?: BlundrPersistenceAdapter | null): Promise<PersistenceResult<OnboardingCompletionResult>> {
  assertStarterPacksAreValid();
  const normalized = normalizeOnboardingState(state, nowIso());
  const ratingBand = getRatingBandById(normalized.ratingBandId);
  const starterPack = getStarterPackById(normalized.selectedStarterPackId);
  if (!ratingBand) {
    return fail("invalid_onboarding_state", "Choose a valid rating band before completing onboarding.");
  }
  if (!starterPack) {
    return fail("invalid_onboarding_state", "Choose a valid starter pack before completing onboarding.");
  }

  const finalState = normalizeOnboardingState({
    ...normalized,
    stepId: "start_training",
    completedStepIds: normalizeCompletedStepIds("start_training"),
    onboardingCompleted: true,
    updatedAt: nowIso(),
  });
  const persistence = ensureAdapter(finalState, userId, adapter);
  const existingProfileResult = await persistence.getTrainingProfile(userId);
  const existingProfile = existingProfileResult.ok ? existingProfileResult.data : null;
  const profile = buildTrainingProfileFromOnboarding(finalState, userId);
  const savedProfile: UserTrainingProfile = {
    ...profile,
    createdAt: existingProfile?.createdAt ?? profile.createdAt,
    updatedAt: profile.updatedAt,
  };
  const repertoire = buildRepertoireFromOnboarding(finalState, userId);

  const savedProfileResult = await persistence.upsertTrainingProfile(savedProfile);
  if (!savedProfileResult.ok) {
    const error = getPersistenceError(savedProfileResult);
    return fail(error.code, error.message, error.cause);
  }
  const savedRepertoireResult = await persistence.upsertUserRepertoire(repertoire);
  if (!savedRepertoireResult.ok) {
    const error = getPersistenceError(savedRepertoireResult);
    return fail(error.code, error.message, error.cause);
  }

  return {
    ok: true,
    data: {
      profile: savedProfileResult.data,
      repertoire: savedRepertoireResult.data,
    },
  };
}
