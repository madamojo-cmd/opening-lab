import type { UserRewardHistory } from "../accounts/accountTypes";

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeNumber(value: unknown): number {
  return Math.max(0, Number(value) || 0);
}

export const REWARD_PITY_THRESHOLD = 14;

export function isPityRewardEligible(history: UserRewardHistory, localDate: string): boolean {
  return normalizeNumber(history.allRingsDaysSinceRandomReward) >= REWARD_PITY_THRESHOLD && normalizeText(history.lastPityGuaranteeLocalDate) !== normalizeText(localDate);
}

export function buildPityRewardTriggerEventId(userId: string, localDate: string, allRingsCompletionCount: number): string {
  return `reward-roll:pity:${normalizeText(userId) || "user"}:${normalizeText(localDate) || "date"}:${Math.max(0, Math.floor(Number(allRingsCompletionCount) || 0))}`;
}

export function shouldResetPityAfterReward(grantMode: "random_bonus" | "guaranteed_cache" | "pity_bonus" | null | undefined): boolean {
  return grantMode === "random_bonus" || grantMode === "pity_bonus";
}

export function shouldIncrementPityForAllRingsDay(randomBonusGranted: boolean): boolean {
  return !randomBonusGranted;
}

