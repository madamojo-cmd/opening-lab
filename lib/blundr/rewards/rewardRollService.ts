import { createDefaultRewardRoll } from "../accounts/accountDefaults";
import type { RewardRoll, RewardTrigger } from "../accounts/accountTypes";
import { REWARD_GRANT_MODE_LABELS, REWARD_TRIGGER_CHANCES, REWARD_TRIGGER_LABELS } from "./rewardConstants";
import { buildRewardReward, buildRewardRollSeed, deterministicRandom } from "./rewardRarity";
import type { RewardGrantMode, RewardTriggerContext, RewardTriggerOutcome } from "./rewardTypes";

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeNumber(value: unknown): number {
  return Math.max(0, Number(value) || 0);
}

function nowIso(): string {
  return new Date().toISOString();
}

export function buildRewardTriggerEventId(context: RewardTriggerContext): string {
  const userId = normalizeText(context.userId) || "user";
  const localDate = normalizeText(context.localDate) || "date";
  switch (context.trigger) {
    case "daily_tempo_ring_closed":
    case "daily_battery_ring_closed":
    case "daily_blundr_ring_closed":
      return `reward-roll:ring:${userId}:${localDate}:${context.ringId || context.trigger}`;
    case "all_rings_closed":
      return `reward-roll:all-rings:${userId}:${localDate}`;
    case "three_all_rings_completions":
      return `reward-roll:three-full:${userId}:${normalizeNumber(context.allRingsCompletionCount)}`;
    case "weekly_cache":
      return `reward-cache:weekly:${userId}:${localDate}:${normalizeNumber(context.streakDays)}`;
    case "monthly_cache":
      return `reward-cache:monthly:${userId}:${localDate}:${normalizeNumber(context.streakDays)}`;
    default:
      return `reward-roll:${normalizeText(context.trigger)}:${userId}:${localDate}`;
  }
}

export function getRewardTriggerChance(trigger: RewardTrigger): number {
  return REWARD_TRIGGER_CHANCES[trigger] ?? 0;
}

function resolveGrantMode(context: RewardTriggerContext, randomHit: boolean): RewardGrantMode | null {
  if (context.trigger === "weekly_cache" || context.trigger === "monthly_cache") {
    return "guaranteed_cache";
  }
  if (context.trigger === "all_rings_closed" && context.pityEligible) {
    return "pity_bonus";
  }
  if (randomHit) {
    return "random_bonus";
  }
  return null;
}

function buildMissedOutcome(roll: RewardRoll, context: RewardTriggerContext, grantMode: RewardGrantMode | null, missedReason: string): RewardTriggerOutcome {
  return {
    roll,
    reward: null,
    grant: null,
    grantMode,
    didReward: false,
    missedReason,
  };
}

function buildOutcomeFromReward(roll: RewardRoll, context: RewardTriggerContext, grantMode: RewardGrantMode): RewardTriggerOutcome {
  if (!roll.reward) {
    return buildMissedOutcome(roll, context, grantMode, "missing_reward");
  }
  const amount = Math.max(0, Number(roll.reward.amount) || 0);
  const pointsApplied = roll.reward.rewardType === "opening_fragment" || roll.reward.rewardType === "choice_token" ? 0 : amount;
  const pendingChoice = roll.reward.rewardType === "choice_token";
  return {
    roll,
    reward: roll.reward,
    grant: {
      id: `${roll.id}:${roll.reward.id}:grant`,
      rewardId: roll.reward.id,
      rewardRollId: roll.id,
      trigger: roll.trigger,
      triggerEventId: roll.id,
      rarity: roll.reward.rarity,
      rewardType: roll.reward.rewardType,
      amount,
      displayName: roll.reward.displayName,
      description: roll.reward.description,
      pointsApplied,
      applied: true,
      pendingChoice,
      grantMode,
      createdAt: roll.rolledAt,
    },
    grantMode,
    didReward: true,
  };
}

export function evaluateRewardRoll(context: RewardTriggerContext, existingRolls: readonly RewardRoll[] = []): RewardTriggerOutcome {
  const triggerEventId = buildRewardTriggerEventId(context);
  const seed = buildRewardRollSeed({
    userId: context.userId,
    triggerEventId,
    trigger: context.trigger,
  });
  const existing = existingRolls.find((roll) => normalizeText(roll.id) === triggerEventId || normalizeText(roll.id) === seed || normalizeText(roll.seed) === seed);
  const random = deterministicRandom(`${seed}:chance`);
  const randomHit = random < getRewardTriggerChance(context.trigger);
  const grantMode = resolveGrantMode(context, randomHit);
  const grantLabel = REWARD_TRIGGER_LABELS[context.trigger];
  const grantModeLabel = grantMode ? REWARD_GRANT_MODE_LABELS[grantMode] : "missed";

  if (existing) {
    if (!existing.didReward || !existing.reward) {
      return buildMissedOutcome(existing, context, grantMode, "existing_missed_roll");
    }
    return buildOutcomeFromReward(existing, context, grantMode ?? "guaranteed_cache");
  }

  const didReward = Boolean(grantMode);
  const reward = didReward
    ? buildRewardReward({
        triggerEventId,
        trigger: context.trigger,
        userId: context.userId,
        forcedRarity: grantMode === "pity_bonus" ? "common" : null,
        grantLabel,
        grantModeLabel,
        pityBonus: grantMode === "pity_bonus",
      })
    : null;

  const roll = createDefaultRewardRoll(
    context.userId,
    context.trigger,
    seed,
    normalizeText(context.now) || nowIso(),
    didReward,
    reward ?? undefined,
    triggerEventId,
  );

  if (!didReward) {
    return buildMissedOutcome(roll, context, grantMode, randomHit ? "chance_hit_without_grant" : "chance_missed");
  }

  return {
    roll,
    reward,
    grant: reward
      ? {
          id: `${roll.id}:${reward.id}:grant`,
          rewardId: reward.id,
          rewardRollId: roll.id,
          trigger: roll.trigger,
          triggerEventId: roll.id,
          rarity: reward.rarity,
          rewardType: reward.rewardType,
          amount: Math.max(0, Number(reward.amount) || 0),
          displayName: reward.displayName,
          description: reward.description,
          pointsApplied: reward.rewardType === "opening_fragment" || reward.rewardType === "choice_token" ? 0 : Math.max(0, Number(reward.amount) || 0),
          applied: true,
          pendingChoice: reward.rewardType === "choice_token",
          grantMode: grantMode ?? "guaranteed_cache",
          createdAt: normalizeText(context.now) || roll.rolledAt,
        }
      : null,
    grantMode,
    didReward: true,
  };
}

export function isRewardGrantModeRandom(grantMode: RewardGrantMode | null | undefined): boolean {
  return grantMode === "random_bonus";
}

export function getRewardTriggerLabel(trigger: RewardTrigger): string {
  return REWARD_TRIGGER_LABELS[trigger];
}
