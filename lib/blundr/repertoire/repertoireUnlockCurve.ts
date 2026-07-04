import { getStarterPackOpeningIds } from "../onboarding/starterPacks";
import type { RepertoireProgress } from "./repertoireTypes";

type UnlockCurveProgress = Pick<RepertoireProgress, "selectedStarterPackId" | "unlockedOpeningIds" | "lockedOpeningIds" | "availablePoints">;

const CURVE = {
  first: 150,
  second: 300,
  later: 500,
} as const;

function normalizeUnlockIndex(value: number): number {
  return Math.max(1, Math.floor(Number(value) || 1));
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function getUnlockCostByIndex(unlockIndexAfterStarterPack: number): number {
  const normalized = normalizeUnlockIndex(unlockIndexAfterStarterPack);
  if (normalized === 1) return CURVE.first;
  if (normalized === 2) return CURVE.second;
  return CURVE.later;
}

function getStarterPackOpeningCount(progress: Pick<UnlockCurveProgress, "selectedStarterPackId">): number {
  const openings = getStarterPackOpeningIds(progress.selectedStarterPackId);
  return new Set([openings.whiteOpeningId, openings.blackOpeningId].filter(Boolean)).size || 2;
}

function getAdditionalUnlockCount(progress: Pick<UnlockCurveProgress, "selectedStarterPackId" | "unlockedOpeningIds">): number {
  const starterCount = getStarterPackOpeningCount(progress);
  return Math.max(0, (progress.unlockedOpeningIds?.length ?? 0) - starterCount);
}

export function getNextUnlockCost(progress: UnlockCurveProgress): number {
  if ((progress.lockedOpeningIds?.length ?? 0) === 0) return 0;
  return getUnlockCostByIndex(getAdditionalUnlockCount(progress) + 1);
}

export function getUnlockProgressPct(progress: UnlockCurveProgress): number {
  const cost = getNextUnlockCost(progress);
  if (cost <= 0) return 100;
  return clampPercent((Math.max(0, Number(progress.availablePoints) || 0) / cost) * 100);
}

export function canAffordUnlock(progress: UnlockCurveProgress, openingId: string): boolean {
  return (progress.lockedOpeningIds ?? []).includes(String(openingId).trim()) && Math.max(0, Number(progress.availablePoints) || 0) >= getNextUnlockCost(progress);
}
