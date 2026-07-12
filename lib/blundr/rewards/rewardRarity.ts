import type { RewardRarity, VariableReward, VariableRewardType } from "../accounts/accountTypes";
import { REWARD_RARITY_LABELS, REWARD_RARITY_POINTS, REWARD_RARITY_WEIGHTS } from "./rewardConstants";

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function getHash32(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function deterministicRandom(seed: string): number {
  return getHash32(normalizeText(seed) || "tempo") / 0xffffffff;
}

export function pickRewardRarity(seed: string, forcedRarity?: RewardRarity | null): RewardRarity {
  if (forcedRarity) return forcedRarity;
  const random = deterministicRandom(`${normalizeText(seed)}:rarity`);
  const commonCutoff = REWARD_RARITY_WEIGHTS.common / 100;
  const uncommonCutoff = (REWARD_RARITY_WEIGHTS.common + REWARD_RARITY_WEIGHTS.uncommon) / 100;
  const rareCutoff = (REWARD_RARITY_WEIGHTS.common + REWARD_RARITY_WEIGHTS.uncommon + REWARD_RARITY_WEIGHTS.rare) / 100;
  if (random < commonCutoff) return "common";
  if (random < uncommonCutoff) return "uncommon";
  if (random < rareCutoff) return "rare";
  return "epic";
}

export function pickRewardAmount(rarity: RewardRarity, seed: string): number {
  const options = REWARD_RARITY_POINTS[rarity];
  if (options.length <= 1) return options[0] ?? 0;
  const random = deterministicRandom(`${normalizeText(seed)}:${rarity}:amount`);
  const index = Math.min(options.length - 1, Math.floor(random * options.length));
  return options[index] ?? options[0] ?? 0;
}

export function pickRewardTypeForRarity(rarity: RewardRarity): VariableRewardType {
  switch (rarity) {
    case "common":
      return "unlock_points";
    case "uncommon":
      return "opening_fragment";
    case "rare":
      return "choice_token";
    case "epic":
      return "unlock_points";
    default:
      return "unlock_points";
  }
}

export function resolveRewardAmount(rarity: RewardRarity, rewardType: VariableRewardType, seed: string): number {
  if (rewardType === "opening_fragment" || rewardType === "choice_token") {
    return 1;
  }
  return pickRewardAmount(rarity, seed);
}

export function buildRewardDisplayName(rarity: RewardRarity, rewardType: VariableRewardType, amount: number, grantLabel: string): string {
  const label = REWARD_RARITY_LABELS[rarity];
  if (rewardType === "opening_fragment") {
    return `${label} Opening Fragment`;
  }
  if (rewardType === "choice_token") {
    return `${label} Choice Token`;
  }
  if (rarity === "rare") {
    return `${label} ${grantLabel}`;
  }
  if (rarity === "epic") {
    return `${label} bonus`;
  }
  return `${label} ${grantLabel}`;
}

export function buildRewardDescription(rarity: RewardRarity, rewardType: VariableRewardType, amount: number, grantLabel: string, grantModeLabel: string): string {
  if (rewardType === "opening_fragment") {
    return `Opening fragment added to inventory. Collect 3 to choose a locked opening.`;
  }
  if (rewardType === "choice_token") {
    return `Choice token added to inventory. Choose one locked opening to unlock.`;
  }
  if (rarity === "epic") {
    return `Epic bonus applied as +${amount} repertoire points.`;
  }
  return `Common bonus applied as +${amount} repertoire points.`;
}

export function buildRewardId(input: {
  triggerEventId: string;
  rarity: RewardRarity;
  amount: number;
  grantLabel: string;
}): string {
  return [
    normalizeText(input.triggerEventId) || "reward",
    normalizeText(input.rarity) || "common",
    Math.max(0, Number(input.amount) || 0),
    normalizeText(input.grantLabel) || "bonus",
  ].join(":");
}

export function buildRewardRollSeed(input: { userId: string; triggerEventId: string; trigger: string }): string {
  return [normalizeText(input.userId) || "user", normalizeText(input.triggerEventId) || "trigger", normalizeText(input.trigger) || "reward"].join(":");
}

export function buildRewardReward(input: {
  triggerEventId: string;
  trigger: string;
  userId: string;
  rarity?: RewardRarity | null;
  forcedRarity?: RewardRarity | null;
  grantLabel: string;
  grantModeLabel: string;
  pityBonus?: boolean;
}): VariableReward {
  const rarity = pickRewardRarity(`${normalizeText(input.userId)}:${normalizeText(input.triggerEventId)}:${normalizeText(input.trigger)}`, input.forcedRarity ?? input.rarity ?? null);
  const rewardType = pickRewardTypeForRarity(rarity);
  const amount = resolveRewardAmount(rarity, rewardType, `${normalizeText(input.userId)}:${normalizeText(input.triggerEventId)}:${normalizeText(input.trigger)}`);
  return {
    id: buildRewardId({
      triggerEventId: input.triggerEventId,
      rarity,
      amount,
      grantLabel: input.grantLabel,
    }),
    rarity,
    rewardType,
    amount,
    displayName: buildRewardDisplayName(rarity, rewardType, amount, input.grantLabel),
    description: buildRewardDescription(rarity, rewardType, amount, input.grantLabel, input.grantModeLabel),
  };
}

export function getRewardRarityWeightTotal(): number {
  return Object.values(REWARD_RARITY_WEIGHTS).reduce((total, value) => total + value, 0);
}
