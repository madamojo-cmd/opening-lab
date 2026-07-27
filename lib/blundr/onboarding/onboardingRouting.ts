import type { UserRepertoire, UserTrainingProfile } from "../accounts/accountTypes";
import { getStage2OpeningAvailability } from "../openings/openingAvailability";

export function shouldShowOnboarding(profile: Pick<UserTrainingProfile, "onboardingCompleted"> | null | undefined): boolean {
  return !profile || !profile.onboardingCompleted;
}

export function getFirstStarterPackTrainingTarget(repertoire: Pick<UserRepertoire, "unlockedOpeningIds"> | null | undefined): string | null {
  const unlocked = Array.isArray(repertoire?.unlockedOpeningIds) ? repertoire?.unlockedOpeningIds : [];
  if (unlocked.length === 0) return null;
  const whiteTarget = unlocked.find((openingId) => {
    const availability = getStage2OpeningAvailability(openingId);
    return Boolean(availability && availability.learnerPerspective === "white");
  });
  return whiteTarget ?? unlocked[0] ?? null;
}

export function getPostOnboardingDestination(profile: Pick<UserTrainingProfile, "onboardingCompleted"> | null | undefined, repertoire: Pick<UserRepertoire, "unlockedOpeningIds"> | null | undefined): string {
  if (shouldShowOnboarding(profile)) return "/onboarding";
  const target = getFirstStarterPackTrainingTarget(repertoire);
  return target ? `/#${target}` : "/";
}

export function getCompletedOnboardingRedirectDestination(): string {
  return "/";
}
