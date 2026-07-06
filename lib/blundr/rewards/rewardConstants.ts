import { BLUNDR_REWARD_ASSETS, BLUNDR_REWARD_ANIMATIONS } from "../assets/blundrAssetManifest";
import type { RewardRarity, RewardTrigger, VariableRewardType } from "../accounts/accountTypes";
import type { RewardGrantMode } from "./rewardTypes";

export const REWARD_TRIGGER_CHANCES = {
  daily_tempo_ring_closed: 0.01,
  daily_battery_ring_closed: 0.01,
  daily_blundr_ring_closed: 0.02,
  all_rings_closed: 0.08,
  three_all_rings_completions: 0.12,
  weekly_cache: 1,
  monthly_cache: 1,
  three_day_streak: 0,
  seven_day_streak: 0,
  thirty_day_streak: 0,
} as const satisfies Record<RewardTrigger, number>;

export const REWARD_RARITY_WEIGHTS = {
  common: 72,
  uncommon: 20,
  rare: 7,
  epic: 1,
} as const satisfies Record<RewardRarity, number>;

export const REWARD_RARITY_POINTS = {
  common: [5, 10],
  uncommon: [15, 25],
  rare: [50],
  epic: [100],
} as const satisfies Record<RewardRarity, readonly number[]>;

export const REWARD_RARITY_LABELS = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
} as const satisfies Record<RewardRarity, string>;

export const REWARD_RARITY_ASSETS = {
  common: BLUNDR_REWARD_ASSETS.rarityCommon,
  uncommon: BLUNDR_REWARD_ASSETS.rarityUncommon,
  rare: BLUNDR_REWARD_ASSETS.rarityRare,
  epic: BLUNDR_REWARD_ASSETS.rarityEpic,
} as const satisfies Record<RewardRarity, string>;

export const REWARD_KIND_ASSETS = {
  unlock_points: BLUNDR_REWARD_ASSETS.pointsToken,
  opening_fragment: BLUNDR_REWARD_ASSETS.openingFragment,
  opening_preview_card: BLUNDR_REWARD_ASSETS.cardBackground,
  choice_token: BLUNDR_REWARD_ASSETS.choiceToken,
  style_pack_progress: BLUNDR_REWARD_ASSETS.pointsToken,
} as const satisfies Record<VariableRewardType, string>;

export const REWARD_TRIGGER_LABELS = {
  daily_tempo_ring_closed: "Daily Tempo ring",
  daily_battery_ring_closed: "Daily Battery ring",
  daily_blundr_ring_closed: "Daily Blundr ring",
  all_rings_closed: "All three rings",
  three_all_rings_completions: "Every 3 all-ring days",
  weekly_cache: "7-day streak cache",
  monthly_cache: "30-day streak cache",
  three_day_streak: "Legacy 3-day streak",
  seven_day_streak: "Legacy 7-day streak",
  thirty_day_streak: "Legacy 30-day streak",
} as const satisfies Record<RewardTrigger, string>;

export const REWARD_GRANT_MODE_LABELS = {
  random_bonus: "random bonus",
  guaranteed_cache: "guaranteed cache",
  pity_bonus: "pity bonus",
} as const satisfies Record<RewardGrantMode, string>;

export const REWARD_CACHE_COPY = {
  intro: "Tempo found a bonus for your training.",
  applied: "Reward applied.",
  choiceTokenLimit: "Choice targeting is not enabled in MVP, so this bonus is applied as repertoire points.",
} as const;

export const REWARD_ANIMATION_ASSETS = {
  tempoCacheOpen: BLUNDR_REWARD_ANIMATIONS.tempoCacheOpen,
  tempoCacheOpenFallback: BLUNDR_REWARD_ANIMATIONS.tempoCacheOpenFallback,
  rewardPop: BLUNDR_REWARD_ANIMATIONS.rewardPop,
  rewardPopFallback: BLUNDR_REWARD_ANIMATIONS.rewardPopFallback,
  pointsFloat: BLUNDR_REWARD_ANIMATIONS.pointsFloat,
  pointsFloatFallback: BLUNDR_REWARD_ANIMATIONS.pointsFloatFallback,
  streakFlare: BLUNDR_REWARD_ANIMATIONS.streakFlare,
  streakFlareFallback: BLUNDR_REWARD_ANIMATIONS.streakFlareFallback,
} as const;

export const REWARD_DEFAULT_RARITY_LABEL = "Common";
