import "server-only";

import { getAccountPersistenceAdapter } from "@/lib/blundr/accounts/accountRepository";
import type {
  CurrentBlundrUser,
  RatingBandId,
  StarterPackId,
} from "@/lib/blundr/accounts/accountTypes";
import { createDefaultTrainingProfile } from "@/lib/blundr/accounts/accountDefaults";
import { createBlundrSupabaseServerClient } from "@/lib/blundr/backend/supabaseServerClient";
import type { RepertoireProgress } from "@/lib/blundr/repertoire/repertoireTypes";
import {
  buildInitialRepertoireFromStarterPack,
  getStarterPackById,
} from "./starterPacks";
import { hasVerifiedStarterOpeningAccess } from "./starterOpeningAccess";
import {
  ONBOARDING_V11_PACE_GOALS,
  ONBOARDING_V11_PRIORITIES,
  ONBOARDING_V11_STEPS,
  getEarliestIncompleteOnboardingV11Step,
  type OnboardingPriority,
  type OnboardingV11Pace,
  type OnboardingV11State,
  type OnboardingV11Step,
} from "./onboardingV11Contract";
export {
  ONBOARDING_V11_STEPS,
  getEarliestIncompleteOnboardingV11Step,
  getOnboardingV11PaceGoals,
  type OnboardingPriority,
  type OnboardingV11Pace,
  type OnboardingV11State,
  type OnboardingV11Step,
} from "./onboardingV11Contract";

type ProfileRow = {
  onboarding_completed?: unknown;
  onboarding_step?: unknown;
  onboarding_priorities?: unknown;
  onboarding_started_at?: unknown;
  onboarding_completed_at?: unknown;
  age_confirmed_at?: unknown;
  rating_band_id?: unknown;
  daily_tempo_goal?: unknown;
  daily_battery_goal?: unknown;
  daily_blundr_goal?: unknown;
  selected_starter_pack_id?: unknown;
  preferred_training_mode?: unknown;
};

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function nowIso(): string {
  return new Date().toISOString();
}

function isStep(value: unknown): value is OnboardingV11Step {
  return ONBOARDING_V11_STEPS.includes(value as OnboardingV11Step);
}

function isRatingBand(value: unknown): value is RatingBandId {
  return [
    "new_to_openings",
    "u800",
    "800-1200",
    "1200-1600",
    "1600-2000",
    "2000-plus",
  ].includes(text(value));
}

function isPace(value: unknown): value is OnboardingV11Pace {
  return value === "light" || value === "standard" || value === "focused";
}

function isMode(value: unknown): value is "assisted" | "plain" {
  return value === "assisted" || value === "plain";
}

function priorities(value: unknown): OnboardingPriority[] {
  return Array.from(
    new Set(
      Array.isArray(value)
        ? value.filter((item): item is OnboardingPriority =>
            ONBOARDING_V11_PRIORITIES.includes(item as OnboardingPriority),
          )
        : [],
    ),
  );
}

function paceFromGoals(row: ProfileRow): OnboardingV11Pace | null {
  for (const [pace, goals] of Object.entries(
    ONBOARDING_V11_PACE_GOALS,
  ) as Array<
    [OnboardingV11Pace, (typeof ONBOARDING_V11_PACE_GOALS)[OnboardingV11Pace]]
  >) {
    if (
      Number(row.daily_tempo_goal) === goals.tempo &&
      Number(row.daily_battery_goal) === goals.battery &&
      Number(row.daily_blundr_goal) === goals.daily
    )
      return pace;
  }
  return null;
}

export function normalizeOnboardingV11ProfileRow(
  row: ProfileRow | null | undefined,
): OnboardingV11State {
  const completed = Boolean(row?.onboarding_completed);
  return {
    step: isStep(row?.onboarding_step)
      ? row.onboarding_step
      : completed
        ? "ready"
        : "welcome",
    completed,
    ratingBandId: isRatingBand(row?.rating_band_id) ? row.rating_band_id : null,
    priorities: priorities(row?.onboarding_priorities),
    pace: paceFromGoals(row ?? {}),
    starterPackId:
      getStarterPackById(text(row?.selected_starter_pack_id) as StarterPackId)
        ?.id ?? null,
    trainingMode: isMode(row?.preferred_training_mode)
      ? row.preferred_training_mode
      : null,
    ageConfirmed: Boolean(row?.age_confirmed_at),
    startedAt: text(row?.onboarding_started_at) || null,
    completedAt: text(row?.onboarding_completed_at) || null,
  };
}

function nextStep(step: OnboardingV11Step): OnboardingV11Step {
  const index = ONBOARDING_V11_STEPS.indexOf(step);
  return (
    ONBOARDING_V11_STEPS[
      Math.min(index + 1, ONBOARDING_V11_STEPS.length - 1)
    ] ?? "ready"
  );
}

function profileClient(user: CurrentBlundrUser) {
  return createBlundrSupabaseServerClient({
    accessToken: user.accessToken,
    forUserQueries: true,
  });
}

async function ensureProfile(
  user: CurrentBlundrUser,
): Promise<ProfileRow | null> {
  const client = profileClient(user);
  if (!client) return null;
  const { data: existing, error } = await client
    .from("blundr_user_profiles")
    .select("*")
    .eq("user_id", user.userId)
    .maybeSingle();
  if (error) throw new Error("onboarding_persistence_unavailable");
  if (existing) {
    if (user.age13Confirmed && !(existing as ProfileRow).age_confirmed_at) {
      const { data, error: confirmationError } = await client
        .from("blundr_user_profiles")
        .update({ age_confirmed_at: nowIso() })
        .eq("user_id", user.userId)
        .select("*")
        .single();
      if (confirmationError || !data)
        throw new Error("onboarding_persistence_unavailable");
      return data as ProfileRow;
    }
    return existing as ProfileRow;
  }
  const fallback = createDefaultTrainingProfile(user.userId, nowIso());
  const { data, error: insertError } = await client
    .from("blundr_user_profiles")
    .insert({
      user_id: user.userId,
      onboarding_completed: false,
      onboarding_step: "welcome",
      onboarding_priorities: [],
      rating_band_id: fallback.ratingBandId,
      rating_source: fallback.ratingSource,
      preferred_training_mode: fallback.preferredTrainingMode,
      daily_tempo_goal: fallback.dailyTempoGoal,
      daily_battery_goal: fallback.dailyBatteryGoal,
      daily_blundr_goal: fallback.dailyBlundrGoal,
      age_confirmed_at: user.age13Confirmed ? nowIso() : null,
    })
    .select("*")
    .single();
  if (insertError || !data)
    throw new Error("onboarding_persistence_unavailable");
  return data as ProfileRow;
}

export async function readOnboardingV11State(
  user: CurrentBlundrUser,
): Promise<OnboardingV11State> {
  return normalizeOnboardingV11ProfileRow(await ensureProfile(user));
}

export async function saveOnboardingV11Step(
  user: CurrentBlundrUser,
  input: { step: OnboardingV11Step; value?: unknown; ageConfirmed?: boolean },
): Promise<OnboardingV11State> {
  const existing = await readOnboardingV11State(user);
  const client = profileClient(user);
  if (!client) throw new Error("onboarding_persistence_unavailable");
  const now = nowIso();
  // A save represents successful completion of the submitted screen. Store
  // the next screen as the durable resume point so defaults never skip a
  // required decision on a different device.
  const update: Record<string, unknown> = {
    onboarding_step: nextStep(input.step),
    updated_at: now,
  };
  if (input.step === "welcome")
    update.onboarding_started_at = existing.startedAt ?? now;
  if (input.step === "level") {
    if (!isRatingBand(input.value)) throw new Error("invalid_rating_band");
    update.rating_band_id = input.value;
    update.rating_source = "manual";
  }
  if (input.step === "priorities") {
    const nextPriorities = priorities(input.value);
    if (nextPriorities.length === 0) throw new Error("priorities_required");
    update.onboarding_priorities = nextPriorities;
  }
  if (input.step === "pace") {
    if (!isPace(input.value)) throw new Error("invalid_daily_pace");
    const goals = ONBOARDING_V11_PACE_GOALS[input.value];
    update.daily_tempo_goal = goals.tempo;
    update.daily_battery_goal = goals.battery;
    update.daily_blundr_goal = goals.daily;
  }
  if (input.step === "starter-pack") {
    if (!getStarterPackById(text(input.value) as StarterPackId))
      throw new Error("invalid_starter_pack");
    update.selected_starter_pack_id = input.value;
  }
  if (input.step === "training-mode") {
    if (!isMode(input.value)) throw new Error("invalid_training_mode");
    update.preferred_training_mode = input.value;
  }
  if (input.ageConfirmed === true)
    update.age_confirmed_at = existing.ageConfirmed
      ? (existing.startedAt ?? now)
      : now;
  const { data, error } = await client
    .from("blundr_user_profiles")
    .update(update)
    .eq("user_id", user.userId)
    .select("*")
    .single();
  if (error || !data) throw new Error("onboarding_persistence_unavailable");
  return normalizeOnboardingV11ProfileRow(data as ProfileRow);
}

export async function completeOnboardingV11(
  user: CurrentBlundrUser,
): Promise<OnboardingV11State> {
  const state = await readOnboardingV11State(user);
  const earliest = getEarliestIncompleteOnboardingV11Step(state);
  if (earliest !== "plan" && earliest !== "ready")
    throw new Error(`onboarding_incomplete:${earliest}`);
  if (
    !state.starterPackId ||
    !state.ratingBandId ||
    !state.pace ||
    !state.trainingMode ||
    state.priorities.length === 0
  )
    throw new Error("onboarding_incomplete:plan");
  const adapter = getAccountPersistenceAdapter({
    user,
    accessToken: user.accessToken,
    mode: user.mode,
    allowLocalFallback: false,
  });
  const now = nowIso();
  const repertoire = buildInitialRepertoireFromStarterPack({
    userId: user.userId,
    starterPackId: state.starterPackId,
    now,
  });
  const repertoireResult = await adapter.upsertUserRepertoire(repertoire);
  if (!repertoireResult.ok)
    throw new Error("starter_repertoire_persistence_unavailable");
  const verifiedRepertoire = await adapter.getUserRepertoire(user.userId);
  if (!verifiedRepertoire.ok || !verifiedRepertoire.data) {
    throw new Error("starter_repertoire_verification_failed");
  }
  const verifiedProgress: RepertoireProgress = {
    userId: verifiedRepertoire.data.userId,
    selectedStarterPackId:
      verifiedRepertoire.data.selectedStarterPackId ?? state.starterPackId,
    unlockedOpeningIds: verifiedRepertoire.data.unlockedOpeningIds,
    lockedOpeningIds: verifiedRepertoire.data.lockedOpeningIds,
    availablePoints: verifiedRepertoire.data.openingUnlockPoints,
    lifetimePoints: verifiedRepertoire.data.openingUnlockPoints,
    spentPoints: 0,
    nextUnlockCost: 0,
    nextUnlockProgressPct: 0,
    pointEvents: [],
    unlockEvents: [],
    updatedAt: verifiedRepertoire.data.updatedAt,
  };
  if (
    !hasVerifiedStarterOpeningAccess(
      user,
      verifiedProgress,
      repertoire.unlockedOpeningIds,
    )
  ) {
    throw new Error("starter_repertoire_verification_failed");
  }
  const client = profileClient(user);
  if (!client) throw new Error("onboarding_persistence_unavailable");
  const { data, error } = await client
    .from("blundr_user_profiles")
    .update({
      onboarding_completed: true,
      onboarding_step: "ready",
      onboarding_completed_at: now,
      updated_at: now,
    })
    .eq("user_id", user.userId)
    .select("*")
    .single();
  if (error || !data) throw new Error("onboarding_persistence_unavailable");
  return normalizeOnboardingV11ProfileRow(data as ProfileRow);
}
