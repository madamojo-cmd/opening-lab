import { BLUNDR_ANALYTICS_EVENTS } from "../analytics/blundrAnalyticsEvents";
import { trackBlundrAnalyticsEvent } from "../analytics/blundrAnalyticsService";
import type { RewardRoll } from "../accounts/accountTypes";
import { normalizeStarterPackId } from "../accounts/accountDefaults";
import { getStarterPackById } from "../onboarding/starterPacks";
import { earnAndPersistRepertoirePoints, isRepertoirePersistenceFailure } from "../repertoire/repertoireProgressService";
import { grantChoiceTokens, grantOpeningFragments, type RewardInventoryActionResult } from "./rewardInventoryService";
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
  starterPackId?: string | null;
  syncRemote?: boolean;
};

export type RewardGrantApplicationResult = {
  ok: true;
  applied: boolean;
  code: "applied" | "duplicate";
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
  pointResult?: Awaited<ReturnType<typeof earnAndPersistRepertoirePoints>>;
  inventoryResult?: RewardInventoryActionResult;
};

export type RewardGrantApplicationFailure = {
  ok: false;
  code: string;
  message: string;
  inventoryResult?: RewardInventoryActionResult;
  pointResult?: Awaited<ReturnType<typeof earnAndPersistRepertoirePoints>>;
};

export function buildRewardGrantRecord(input: RewardGrantApplicationInput, applied = true): RewardGrantApplicationResult["grant"] | RewardGrantApplicationFailure {
  const reward = input.roll.reward;
  if (!input.roll.didReward || !reward) {
    return {
      ok: false,
      code: "reward_missing",
      message: "Reward roll did not produce a reward.",
    };
  }
  const amount = Math.max(0, Number(reward.amount) || 0);
  const pointsApplied = reward.rewardType === "opening_fragment" || reward.rewardType === "choice_token" ? 0 : amount;
  const pendingChoice = reward.rewardType === "choice_token";
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
    pointsApplied,
    applied,
    pendingChoice,
    grantMode: input.grantMode,
    createdAt: normalizeText(input.now) || input.roll.rolledAt || nowIso(),
  };
}

export async function applyRewardGrant(input: RewardGrantApplicationInput): Promise<RewardGrantApplicationResult | RewardGrantApplicationFailure> {
  const record = buildRewardGrantRecord(input);
  if ("ok" in record && !record.ok) {
    return record;
  }
  const grant = record as RewardGrantApplicationResult["grant"];
  const reward = input.roll.reward;
  if (!reward) {
    return {
      ok: false,
      code: "reward_missing",
      message: "Reward roll did not include a reward.",
    };
  }

  let pointResult: Awaited<ReturnType<typeof earnAndPersistRepertoirePoints>> | undefined;
  let inventoryResult: RewardInventoryActionResult | undefined;
  if (reward.rewardType === "opening_fragment") {
    inventoryResult = await grantOpeningFragments({
      userId: input.userId,
      amount: Math.max(1, Number(reward.amount) || 1),
      sourceEventId: reward.id,
      now: normalizeText(input.now) || undefined,
      syncRemote: input.syncRemote,
    });
    if (!inventoryResult.ok) {
      return {
        ok: false,
        code: inventoryResult.code,
        message: inventoryResult.message,
        inventoryResult,
      };
    }
    if (!inventoryResult.applied) {
      if (inventoryResult.code === "duplicate") {
        return {
          ok: true,
          applied: false,
          code: "duplicate",
          grant: buildRewardGrantRecord(input, false) as RewardGrantApplicationResult["grant"],
          inventoryResult,
        };
      }
      return {
        ok: false,
        code: inventoryResult.code,
        message: inventoryResult.message,
        inventoryResult,
      };
    }
  } else if (reward.rewardType === "choice_token") {
    inventoryResult = await grantChoiceTokens({
      userId: input.userId,
      amount: Math.max(1, Number(reward.amount) || 1),
      sourceEventId: reward.id,
      now: normalizeText(input.now) || undefined,
      syncRemote: input.syncRemote,
    });
    if (!inventoryResult.ok) {
      return {
        ok: false,
        code: inventoryResult.code,
        message: inventoryResult.message,
        inventoryResult,
      };
    }
    if (!inventoryResult.applied) {
      if (inventoryResult.code === "duplicate") {
        return {
          ok: true,
          applied: false,
          code: "duplicate",
          grant: buildRewardGrantRecord(input, false) as RewardGrantApplicationResult["grant"],
          inventoryResult,
        };
      }
      return {
        ok: false,
        code: inventoryResult.code,
        message: inventoryResult.message,
        inventoryResult,
      };
    }
  } else {
    const starterPackId = getStarterPackById(normalizeStarterPackId(input.starterPackId) ?? null)?.id ?? null;
    pointResult = await earnAndPersistRepertoirePoints({
      userId: input.userId,
      source: "reward_bonus",
      points: Math.max(0, Number(reward.amount) || 0),
      completionId: reward.id,
      starterPackId,
      now: normalizeText(input.now) || undefined,
      syncRemote: input.syncRemote,
    });
    if (isRepertoirePersistenceFailure(pointResult)) {
      return {
        ok: false,
        code: pointResult.code,
        message: pointResult.message,
        pointResult,
      };
    }
  }

  const appliedGrant = buildRewardGrantRecord(input, true) as RewardGrantApplicationResult["grant"];
  trackBlundrAnalyticsEvent(BLUNDR_ANALYTICS_EVENTS.REWARD_GRANTED, {
    userId: input.userId,
    rewardRollId: input.roll.id,
    rewardId: reward.id,
    trigger: input.roll.trigger,
    grantMode: input.grantMode,
    rarity: reward.rarity,
    rewardType: reward.rewardType,
    amount: grant.amount,
    pointsApplied: grant.pointsApplied,
  });
  trackBlundrAnalyticsEvent(BLUNDR_ANALYTICS_EVENTS.REWARD_APPLIED, {
    userId: input.userId,
    rewardRollId: input.roll.id,
    rewardId: reward.id,
    trigger: input.roll.trigger,
    grantMode: input.grantMode,
    rarity: reward.rarity,
    rewardType: reward.rewardType,
    amount: grant.amount,
    pointsApplied: grant.pointsApplied,
  });

  return {
    ok: true,
    applied: true,
    code: "applied",
    grant: appliedGrant,
    pointResult,
    inventoryResult,
  };
}
