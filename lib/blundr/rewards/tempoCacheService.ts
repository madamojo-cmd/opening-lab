import { BLUNDR_ANALYTICS_EVENTS } from "../analytics/blundrAnalyticsEvents";
import { trackBlundrAnalyticsEvent } from "../analytics/blundrAnalyticsService";
import type { RewardRoll, RewardTrigger, RewardTrigger as RewardTriggerType, UserRewardHistory } from "../accounts/accountTypes";
import { getLocalRewardRolls } from "../accounts/localAccountStorage";
import { isRewardGrantModeRandom, evaluateRewardRoll, buildRewardTriggerEventId } from "./rewardRollService";
import { applyRewardHistoryBatch, loadRewardHistorySnapshot, persistRewardHistoryLocally, syncRewardStateToAccount } from "./rewardHistoryService";
import { applyRewardGrant } from "./rewardGrantService";
import { isPityRewardEligible } from "./rewardPityService";
import type { RewardBatchResult, RewardGrantRecord, RewardTriggerContext, RewardTriggerOutcome } from "./rewardTypes";

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function uniqueById<T extends { id: string }>(items: readonly T[]): T[] {
  const byId = new Map<string, T>();
  for (const item of items) {
    byId.set(normalizeText(item.id), item);
  }
  return Array.from(byId.values());
}

function uniqueContexts(items: readonly RewardTriggerContext[]): RewardTriggerContext[] {
  const byId = new Map<string, RewardTriggerContext>();
  for (const item of items) {
    byId.set(normalizeText(item.triggerEventId) || `${normalizeText(item.trigger)}:${normalizeText(item.localDate)}`, item);
  }
  return Array.from(byId.values());
}

function toRingTrigger(source: "opening_run_completed" | "continuation_completed" | "daily_blundr_deck_completed"): RewardTriggerType {
  if (source === "opening_run_completed") return "daily_tempo_ring_closed";
  if (source === "continuation_completed") return "daily_battery_ring_closed";
  return "daily_blundr_ring_closed";
}

export type TempoCacheEvaluationInput = {
  userId: string;
  localDate: string;
  activitySource: "opening_run_completed" | "continuation_completed" | "daily_blundr_deck_completed";
  ringClosedThisAction: boolean;
  allRingsClosedThisAction: boolean;
  currentStreakDays: number;
  totalAllRingsClosedDays: number;
  starterPackId?: string | null;
  rewardHistory?: UserRewardHistory | null;
  rewardRolls?: readonly RewardRoll[] | null;
  now?: string;
  syncRemote?: boolean;
  deps?: {
    evaluateRewardRoll?: typeof evaluateRewardRoll;
    applyRewardGrant?: typeof applyRewardGrant;
  };
};

function buildTriggerContexts(input: TempoCacheEvaluationInput, history: UserRewardHistory): RewardTriggerContext[] {
  const contexts: RewardTriggerContext[] = [];
  const now = normalizeText(input.now) || nowIso();
  if (input.ringClosedThisAction) {
    contexts.push({
      userId: input.userId,
      localDate: input.localDate,
      trigger: toRingTrigger(input.activitySource),
      triggerEventId: buildRewardTriggerEventId({
        userId: input.userId,
        localDate: input.localDate,
        trigger: toRingTrigger(input.activitySource),
        ringId: input.activitySource === "opening_run_completed" ? "daily_tempo" : input.activitySource === "continuation_completed" ? "daily_battery" : "daily_blundr",
        now,
      }),
      ringId: input.activitySource === "opening_run_completed" ? "daily_tempo" : input.activitySource === "continuation_completed" ? "daily_battery" : "daily_blundr",
      now,
    });
  }

  if (input.allRingsClosedThisAction) {
    const allRingsCompletionCount = Math.max(0, Number(input.totalAllRingsClosedDays) || 0);
    const pityEligible = isPityRewardEligible(history, input.localDate);
    contexts.push({
      userId: input.userId,
      localDate: input.localDate,
      trigger: "all_rings_closed",
      triggerEventId: buildRewardTriggerEventId({
        userId: input.userId,
        localDate: input.localDate,
        trigger: "all_rings_closed",
        allRingsCompletionCount,
        pityEligible,
        now,
      }),
      allRingsCompletionCount,
      pityEligible,
      now,
    });
    if (allRingsCompletionCount > 0 && allRingsCompletionCount % 3 === 0) {
      contexts.push({
        userId: input.userId,
        localDate: input.localDate,
        trigger: "three_all_rings_completions",
        triggerEventId: buildRewardTriggerEventId({
          userId: input.userId,
          localDate: input.localDate,
          trigger: "three_all_rings_completions",
          allRingsCompletionCount,
          now,
        }),
        allRingsCompletionCount,
        now,
      });
    }
    if (input.currentStreakDays > 0 && input.currentStreakDays % 7 === 0) {
      contexts.push({
        userId: input.userId,
        localDate: input.localDate,
        trigger: "weekly_cache",
        triggerEventId: buildRewardTriggerEventId({
          userId: input.userId,
          localDate: input.localDate,
          trigger: "weekly_cache",
          streakDays: input.currentStreakDays,
          now,
        }),
        streakDays: input.currentStreakDays,
        now,
      });
    }
    if (input.currentStreakDays > 0 && input.currentStreakDays % 30 === 0) {
      contexts.push({
        userId: input.userId,
        localDate: input.localDate,
        trigger: "monthly_cache",
        triggerEventId: buildRewardTriggerEventId({
          userId: input.userId,
          localDate: input.localDate,
          trigger: "monthly_cache",
          streakDays: input.currentStreakDays,
          now,
        }),
        streakDays: input.currentStreakDays,
        now,
      });
    }
  }

  return uniqueContexts(contexts);
}

export async function evaluateTempoCacheRewards(input: TempoCacheEvaluationInput): Promise<RewardBatchResult> {
  const snapshot = input.rewardHistory ? { history: input.rewardHistory, rewardRolls: input.rewardRolls ? Array.from(input.rewardRolls) : getLocalRewardRolls(input.userId) } : loadRewardHistorySnapshot(input.userId);
  const currentHistory = snapshot.history;
  const existingRolls = snapshot.rewardRolls;
  const contexts = buildTriggerContexts(input, currentHistory);
  const evaluateRewardRollFn = input.deps?.evaluateRewardRoll ?? evaluateRewardRoll;
  const applyRewardGrantFn = input.deps?.applyRewardGrant ?? applyRewardGrant;
  const rewardRolls: RewardRoll[] = [];
  const rewardGrants: RewardGrantRecord[] = [];
  let rewardPointsAwarded = 0;
  let randomBonusGranted = false;
  let guaranteedCacheGranted = false;
  let pityTriggered = false;
  let sharedSyncFailed = false;
  let sharedSyncFailureMessage: string | undefined;
  let hadRewardGrantAttempt = false;

  for (const context of contexts) {
    const outcome = evaluateRewardRollFn(context, [...existingRolls, ...rewardRolls]);
    const hasNewRoll = Boolean(outcome.roll.id && !existingRolls.some((roll) => roll.id === outcome.roll.id) && !rewardRolls.some((roll) => roll.id === outcome.roll.id));
    if (hasNewRoll) {
      rewardRolls.push(outcome.roll);
    }

    if (!outcome.didReward) {
      trackBlundrAnalyticsEvent(BLUNDR_ANALYTICS_EVENTS.REWARD_ROLL_MISSED, {
        userId: input.userId,
        localDate: input.localDate,
        trigger: context.trigger,
        triggerEventId: context.triggerEventId,
      });
      continue;
    }

    trackBlundrAnalyticsEvent(BLUNDR_ANALYTICS_EVENTS.REWARD_ROLL_TRIGGERED, {
      userId: input.userId,
      localDate: input.localDate,
      trigger: context.trigger,
      triggerEventId: context.triggerEventId,
      grantMode: outcome.grantMode,
      rarity: outcome.reward?.rarity ?? null,
      rewardType: outcome.reward?.rewardType ?? null,
      amount: outcome.reward?.amount ?? 0,
    });

    if (outcome.grantMode === "pity_bonus") {
      trackBlundrAnalyticsEvent(BLUNDR_ANALYTICS_EVENTS.PITY_REWARD_TRIGGERED, {
        userId: input.userId,
        localDate: input.localDate,
        trigger: context.trigger,
        triggerEventId: context.triggerEventId,
        allRingsDaysSinceRandomReward: currentHistory.allRingsDaysSinceRandomReward,
      });
    }

    const rewardId = outcome.reward?.id ?? null;
    const alreadyApplied = Boolean(rewardId && currentHistory.appliedRewardIds.includes(rewardId));
    if (outcome.grant && outcome.reward) {
      hadRewardGrantAttempt = true;
      if (!alreadyApplied) {
        const appliedGrant = await applyRewardGrantFn({
          userId: input.userId,
          roll: outcome.roll,
          grantMode: outcome.grantMode ?? "guaranteed_cache",
          now: normalizeText(input.now) || undefined,
          starterPackId: input.starterPackId ?? null,
          syncRemote: input.syncRemote,
        });
        if (!appliedGrant.ok) {
          if (hasNewRoll) {
            rewardRolls.pop();
          }
          if (appliedGrant.code === "shared_sync_failed") {
            sharedSyncFailed = true;
            sharedSyncFailureMessage = appliedGrant.message;
            break;
          }
          continue;
        }
        if (!appliedGrant.applied) {
          if (hasNewRoll) {
            rewardRolls.pop();
          }
          continue;
        }
        rewardGrants.push(appliedGrant.grant);
        rewardPointsAwarded += appliedGrant.grant.pointsApplied;
      } else {
        rewardGrants.push(outcome.grant);
      }
      trackBlundrAnalyticsEvent(BLUNDR_ANALYTICS_EVENTS.TEMPO_CACHE_OPENED, {
        userId: input.userId,
        localDate: input.localDate,
        trigger: context.trigger,
        triggerEventId: context.triggerEventId,
        grantMode: outcome.grantMode,
        rarity: outcome.reward?.rarity ?? null,
      });
    }

    if (isRewardGrantModeRandom(outcome.grantMode)) {
      randomBonusGranted = true;
    } else if (outcome.grantMode === "guaranteed_cache") {
      guaranteedCacheGranted = true;
    } else if (outcome.grantMode === "pity_bonus") {
      pityTriggered = true;
      randomBonusGranted = true;
    }

  }

  const bonusResetAlreadyRecorded =
    normalizeText(currentHistory.lastRandomRewardLocalDate) === input.localDate ||
    normalizeText(currentHistory.lastPityGuaranteeLocalDate) === input.localDate;
  if (bonusResetAlreadyRecorded) {
    randomBonusGranted = true;
  }

  if (hadRewardGrantAttempt && rewardGrants.length === 0) {
    return {
      userId: input.userId,
      localDate: input.localDate,
      rewardHistory: currentHistory,
      rewardRolls: existingRolls,
      rewardGrants: [],
      rewardPointsAwarded: 0,
      randomBonusGranted: false,
      pityTriggered: false,
      guaranteedCacheGranted: false,
      state: "closed",
      sharedSyncFailed,
      sharedSyncFailureCode: sharedSyncFailed ? "shared_sync_failed" : undefined,
      sharedSyncFailureMessage,
    };
  }

  const finalHistory = applyRewardHistoryBatch(currentHistory, {
    localDate: input.localDate,
    now: normalizeText(input.now) || undefined,
    allRingsClosedThisAction: input.allRingsClosedThisAction,
    randomBonusGranted,
    pityTriggered,
    rewardIds: rewardGrants.map((grant) => grant.rewardId),
  });
  const mergedRolls = uniqueById([...existingRolls, ...rewardRolls]);
  persistRewardHistoryLocally(input.userId, finalHistory, rewardRolls);
  if (input.syncRemote !== false) {
    await syncRewardStateToAccount(input.userId, {
      history: finalHistory,
      rewardRolls: mergedRolls,
    });
  }

  return {
    userId: input.userId,
    localDate: input.localDate,
    rewardHistory: finalHistory,
    rewardRolls: mergedRolls,
    rewardGrants,
    rewardPointsAwarded,
    randomBonusGranted,
    pityTriggered,
    guaranteedCacheGranted,
    state: rewardGrants.length > 0 ? "applied" : "closed",
    sharedSyncFailed,
    sharedSyncFailureCode: sharedSyncFailed ? "shared_sync_failed" : undefined,
    sharedSyncFailureMessage,
  };
}
