import type { RatingBandId, StarterPackId } from "@/lib/blundr/accounts/accountTypes";

export const ONBOARDING_V11_STEPS = ["welcome", "level", "priorities", "training-loop", "pace", "starter-pack", "training-mode", "plan", "ready"] as const;
export type OnboardingV11Step = (typeof ONBOARDING_V11_STEPS)[number];
export type OnboardingPriority = "remember_openings" | "build_repertoire" | "post_opening_plans" | "review_mistakes" | "prepare_for_games";
export type OnboardingV11Pace = "light" | "standard" | "focused";
export type OnboardingV11State = { step: OnboardingV11Step; completed: boolean; ratingBandId: RatingBandId | null; priorities: OnboardingPriority[]; pace: OnboardingV11Pace | null; starterPackId: StarterPackId | null; trainingMode: "assisted" | "plain" | null; ageConfirmed: boolean; startedAt: string | null; completedAt: string | null; };
export const ONBOARDING_V11_PRIORITIES: readonly OnboardingPriority[] = ["remember_openings", "build_repertoire", "post_opening_plans", "review_mistakes", "prepare_for_games"];
export const ONBOARDING_V11_PACE_GOALS: Record<OnboardingV11Pace, { tempo: number; battery: number; daily: number }> = { light: { tempo: 5, battery: 1, daily: 1 }, standard: { tempo: 10, battery: 3, daily: 1 }, focused: { tempo: 20, battery: 5, daily: 1 } };
export function getOnboardingV11PaceGoals(pace: OnboardingV11Pace) { return ONBOARDING_V11_PACE_GOALS[pace]; }
export function getEarliestIncompleteOnboardingV11Step(state: OnboardingV11State): OnboardingV11Step { return state.completed ? "ready" : state.step; }
export function shouldInitializeOnboardingV11StarterRepertoire(state: OnboardingV11State): boolean { return !state.completed; }
