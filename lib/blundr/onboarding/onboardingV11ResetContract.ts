import { createDefaultTrainingProfile } from "../accounts/accountDefaults";
import type { RatingBandId } from "../accounts/accountTypes";
import type { OnboardingV11Step } from "./onboardingV11Contract";

export type OnboardingV11ResetProfilePatch = {
  onboarding_completed: false;
  onboarding_step: Extract<OnboardingV11Step, "welcome">;
  onboarding_priorities: [];
  onboarding_started_at: null;
  onboarding_completed_at: null;
  rating_band_id: RatingBandId;
  rating_source: "default";
  preferred_training_mode: "assisted" | "plain";
  daily_tempo_goal: number;
  daily_battery_goal: number;
  daily_blundr_goal: number;
  daily_blundr_card_goal: number;
  selected_starter_pack_id: null;
  updated_at: string;
};

export function buildOnboardingV11ResetProfilePatch(
  userId: string,
  now: string,
): OnboardingV11ResetProfilePatch {
  const defaults = createDefaultTrainingProfile(userId, now);
  return {
    onboarding_completed: false,
    onboarding_step: "welcome",
    onboarding_priorities: [],
    onboarding_started_at: null,
    onboarding_completed_at: null,
    rating_band_id: defaults.ratingBandId,
    rating_source: "default",
    preferred_training_mode: "assisted",
    daily_tempo_goal: defaults.dailyTempoGoal,
    daily_battery_goal: defaults.dailyBatteryGoal,
    daily_blundr_goal: defaults.dailyBlundrGoal,
    daily_blundr_card_goal: defaults.dailyBlundrCardGoal,
    selected_starter_pack_id: null,
    updated_at: now,
  };
}

export function mergeClearedOnboardingPlanIntentUserMetadata(
  metadata: unknown,
): Record<string, unknown> {
  const existing =
    metadata && typeof metadata === "object" && !Array.isArray(metadata)
      ? (metadata as Record<string, unknown>)
      : {};
  return {
    ...existing,
    blundr_launch_plan_intent: null,
  };
}
