import { createDefaultRewardHistory } from "../accounts/accountDefaults";
import type { RewardRoll, UserRewardHistory } from "../accounts/accountTypes";
import { getLocalRewardHistory, getLocalRewardRolls, upsertLocalRewardHistory, appendLocalRewardRoll } from "../accounts/localAccountStorage";
import { getOnboardingAuthSession } from "../onboarding/onboardingAuth";

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function uniqueStrings(values: readonly string[]): string[] {
  return Array.from(new Set(values.map((entry) => normalizeText(entry)).filter(Boolean)));
}

export type RewardHistoryBatchInput = {
  localDate: string;
  now?: string;
  allRingsClosedThisAction?: boolean;
  randomBonusGranted?: boolean;
  pityTriggered?: boolean;
  rewardIds?: readonly string[];
};

export type RewardHistorySnapshot = {
  history: UserRewardHistory;
  rewardRolls: RewardRoll[];
};

export function loadRewardHistorySnapshot(userId: string): RewardHistorySnapshot {
  const history = getLocalRewardHistory(userId) ?? createDefaultRewardHistory(userId);
  const rewardRolls = getLocalRewardRolls(userId);
  return { history, rewardRolls };
}

export function applyRewardHistoryBatch(history: UserRewardHistory, input: RewardHistoryBatchInput): UserRewardHistory {
  const now = normalizeText(input.now) || nowIso();
  const localDate = normalizeText(input.localDate);
  const current = {
    ...createDefaultRewardHistory(history.userId, history.updatedAt),
    ...history,
    appliedRewardIds: uniqueStrings(history.appliedRewardIds ?? []),
  };
  const rewardIds = uniqueStrings(input.rewardIds ?? []);
  const randomBonusGranted = Boolean(input.randomBonusGranted);
  const pityTriggered = Boolean(input.pityTriggered);
  const allRingsClosedThisAction = Boolean(input.allRingsClosedThisAction);

  const nextAppliedRewardIds = uniqueStrings([...current.appliedRewardIds, ...rewardIds]);
  const nextAllRingsDaysSinceRandomReward = randomBonusGranted
    ? 0
    : allRingsClosedThisAction
      ? Math.max(0, Number(current.allRingsDaysSinceRandomReward) || 0) + 1
      : Math.max(0, Number(current.allRingsDaysSinceRandomReward) || 0);

  return {
    ...current,
    allRingsDaysSinceRandomReward: nextAllRingsDaysSinceRandomReward,
    randomBonusPityCounter: nextAllRingsDaysSinceRandomReward,
    lastRandomRewardLocalDate: randomBonusGranted ? localDate : current.lastRandomRewardLocalDate,
    lastRandomBonusAt: randomBonusGranted ? now : current.lastRandomBonusAt,
    lastPityGuaranteeLocalDate: pityTriggered ? localDate : current.lastPityGuaranteeLocalDate,
    appliedRewardIds: nextAppliedRewardIds,
    updatedAt: now,
  };
}

export function persistRewardHistoryLocally(userId: string, history: UserRewardHistory, rewardRolls: readonly RewardRoll[] = []): RewardHistorySnapshot {
  const normalizedHistory = {
    ...createDefaultRewardHistory(userId, history.updatedAt),
    ...history,
    appliedRewardIds: uniqueStrings(history.appliedRewardIds ?? []),
  };
  upsertLocalRewardHistory(normalizedHistory);
  const normalizedRolls: RewardRoll[] = [];
  for (const roll of rewardRolls) {
    normalizedRolls.push(appendLocalRewardRoll(roll));
  }
  return {
    history: normalizedHistory,
    rewardRolls: normalizedRolls,
  };
}

export async function syncRewardStateToAccount(userId: string, input: RewardHistorySnapshot): Promise<boolean> {
  const session = await getOnboardingAuthSession().catch(() => null);
  if (!session?.accessToken) return false;
  try {
    const response = await fetch("/api/blundr/rewards/sync", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${session.accessToken}`,
      },
      cache: "no-store",
      body: JSON.stringify({
        userId,
        rewardHistory: input.history,
        rewardRolls: input.rewardRolls,
      }),
    });
    if (!response.ok) return false;
    const payload: unknown = await response.json().catch(() => null);
    return Boolean(payload && typeof payload === "object" && "ok" in payload && payload.ok === true);
  } catch {
    return false;
  }
}
