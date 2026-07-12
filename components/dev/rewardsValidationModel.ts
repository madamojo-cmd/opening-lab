import type { RewardsPreviewKind } from "./rewardsDebugTypes";

export const REWARDS_VALIDATION_VIEWPORTS = [375, 390, 414] as const;
export type RewardsValidationViewport = (typeof REWARDS_VALIDATION_VIEWPORTS)[number];
export const VARIABLE_TEMPO_REWARD_TYPES = ["unlock_points", "opening_fragment", "choice_token", "future_reward"] as const;
export type VariableTempoRewardType = (typeof VARIABLE_TEMPO_REWARD_TYPES)[number];

export function isRewardsValidationViewport(value: number): value is RewardsValidationViewport {
  return value === 375 || value === 390 || value === 414;
}

export function isVariableTempoRewardType(value: string): value is VariableTempoRewardType {
  return value === "unlock_points" || value === "opening_fragment" || value === "choice_token" || value === "future_reward";
}

export type RewardsValidationState = {
  repertoire: { availablePoints: number; unlockedOpeningIds: readonly string[] };
  rewardInventory: { openingFragments: number; choiceTokens: number };
  rewardHistory: { appliedRewardIds: readonly string[]; allRingsDaysSinceRandomReward: number };
  daily: { tempo: { current: number }; battery: { current: number }; blundr: { current: number } };
};

export function rewardsStateFingerprint(snapshot: RewardsValidationState): string {
  return [
    snapshot.repertoire.availablePoints,
    snapshot.rewardInventory.openingFragments,
    snapshot.rewardInventory.choiceTokens,
    snapshot.rewardHistory.appliedRewardIds.length,
    snapshot.rewardHistory.allRingsDaysSinceRandomReward,
    snapshot.daily.tempo.current,
    snapshot.daily.battery.current,
    snapshot.daily.blundr.current,
    snapshot.repertoire.unlockedOpeningIds.join(","),
  ].join("|");
}

export type PreviewMutationResult = {
  before: string;
  after: string;
  mutated: boolean;
  message: "No mutation detected" | "Unexpected mutation detected";
};

export function comparePreviewState(before: RewardsValidationState, after: RewardsValidationState): PreviewMutationResult {
  const beforeFingerprint = rewardsStateFingerprint(before);
  const afterFingerprint = rewardsStateFingerprint(after);
  const mutated = beforeFingerprint !== afterFingerprint;
  return { before: beforeFingerprint, after: afterFingerprint, mutated, message: mutated ? "Unexpected mutation detected" : "No mutation detected" };
}

export function isPresentationOnlyPreview(preview: RewardsPreviewKind): boolean {
  return preview.kind !== "none";
}
