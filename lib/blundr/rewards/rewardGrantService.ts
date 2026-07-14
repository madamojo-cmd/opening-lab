import { BLUNDR_ANALYTICS_EVENTS } from "../analytics/blundrAnalyticsEvents";
import { trackBlundrAnalyticsEvent } from "../analytics/blundrAnalyticsService";
import type { RewardRoll, StarterPackId } from "../accounts/accountTypes";
import { earnAndPersistRepertoirePoints } from "../repertoire/repertoireProgressService";
import type { RewardGrantMode } from "./rewardTypes";

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

export type RewardGrantApplicationInput = {
  userId: string;
  roll: RewardRoll;
  grantMode: RewardGrantMode;
  now?: string;
  starterPackId?: StarterPackId | null;
};

export type RewardGrantApplicationResult = {
  ok: true;
  grant: {
    id: string;
    rewardId: string;
    rewardRollId: string;
    trigger: RewardRoll["trigger"];
    triggerEventId: string;
    rarity: NonNullable<RewardRoll["reward"]>["rarity"];
    rewardType: NonNullable<RewardRoll["reward"]>["rewardType"];
    amount: number;
    displayName: string;
    description: string;
    pointsApplied: number;
    applied: boolean;
    pendingChoice: boolean;
    grantMode: RewardGrantMode;
    createdAt: string;
  };
  pointResult: Awaited<ReturnType<typeof earnAndPersistRepertoirePoints>>;
};

export type RewardGrantApplicationFailure = {
  ok: false;
  code: string;
  message: string;
};

export function buildRewardGrantRecord(input: RewardGrantApplicationInput): RewardGrantApplicationResult["grant"] | RewardGrantApplicationFailure {
  const reward = input.roll.reward;
  if (!input.roll.didReward || !reward) {
    return {
      ok: false,
      code: "reward_missing",
      message: "Reward roll did not produce a reward.",
    };
  }
  const amount = Math.max(0, Number(reward.amount) || 0);
  return {
    id: `${input.roll.id}:${reward.id}:grant`,
    rewardId: reward.id,
    rewardRollId: input.roll.id,
    trigger: input.roll.trigger,
    triggerEventId: input.roll.id,
    rarity: reward.rarity,
    rewardType: reward.rewardType,
    amount,
    displayName: reward.displayName,
    description: reward.description,
    pointsApplied: amount,
    applied: true,
    pendingChoice: false,
    grantMode: input.grantMode,
    createdAt: normalizeText(input.now) || input.roll.rolledAt || nowIso(),
  };
}

export async function applyRewardGrant(input: RewardGrantApplicationInput): Promise<RewardGrantApplicationResult | RewardGrantApplicationFailure> {
  const record = buildRewardGrantRecord(input);
  if ("ok" in record) {
    return record;
  }
  const grant: RewardGrantApplicationResult["grant"] = record;
  const reward = input.roll.reward;
  if (!reward) {
    return {
      ok: false,
      code: "reward_missing",
      message: "Reward roll did not include a reward.",
    };
  }

  const pointResult = await earnAndPersistRepertoirePoints({
    userId: input.userId,
    source: "reward_bonus",
    points: Math.max(0, Number(reward.amount) || 0),
    completionId: reward.id,
    starterPackId: input.starterPackId ?? undefined,
    now: normalizeText(input.now) || undefined,
  });
  if (pointResult.ok === false) {
    return {
      ok: false,
      code: pointResult.code,
      message: pointResult.message,
    };
  }

  trackBlundrAnalyticsEvent(BLUNDR_ANALYTICS_EVENTS.REWARD_GRANTED, {
    userId: input.userId,
    rewardRollId: input.roll.id,
    rewardId: reward.id,
    trigger: input.roll.trigger,
    grantMode: input.grantMode,
    rarity: reward.rarity,
    rewardType: reward.rewardType,
    amount: grant.pointsApplied,
  });
  trackBlundrAnalyticsEvent(BLUNDR_ANALYTICS_EVENTS.REWARD_APPLIED, {
    userId: input.userId,
    rewardRollId: input.roll.id,
    rewardId: reward.id,
    trigger: input.roll.trigger,
    grantMode: input.grantMode,
    rarity: reward.rarity,
    rewardType: reward.rewardType,
    pointsApplied: grant.pointsApplied,
  });

  return {
    ok: true,
    grant,
    pointResult,
  };
}
