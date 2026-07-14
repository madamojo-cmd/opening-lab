import { FEATURE_FLAGS, type FeatureFlagName } from "@/lib/blundr/contracts";
import { getDailyActivityRegistry } from "./dailyActivityRegistry";
import type { DailyDeckCandidate } from "./dailyDeckPolicy";

const step3Flags: readonly FeatureFlagName[] = [
  "daily_candidate_choice",
  "daily_plan_recall",
  "daily_same_position_different_route",
  "daily_continuation_challenge",
  "daily_punish_the_mistake",
];

export function step3ActivityIdsForDeck(
  flags: Readonly<Record<string, boolean>> = FEATURE_FLAGS,
): string[] {
  return step3Flags
    .filter((flag) => flags[flag] && getDailyActivityRegistry().has(flag))
    .map((flag) => flag);
}

export function reserveTargetedStep3Slot(input: {
  candidates: readonly DailyDeckCandidate[];
  flags?: Readonly<Record<string, boolean>>;
}): DailyDeckCandidate[] {
  const enabled = new Set(step3ActivityIdsForDeck(input.flags));
  return input.candidates
    .filter(
      (candidate) =>
        !candidate.activityId.startsWith("daily_") ||
        enabled.has(candidate.activityId),
    )
    .sort(
      (a, b) =>
        b.priority - a.priority || a.stableKey.localeCompare(b.stableKey),
    )
    .slice(0, 1);
}
