import type { RewardRarity, RewardRoll, RewardTrigger, UserRewardHistory, VariableReward, VariableRewardType } from "../accounts/accountTypes";

export type RewardGrantMode = "random_bonus" | "guaranteed_cache" | "pity_bonus";

export type TempoCacheState = "closed" | "opening" | "revealed" | "applied";

export type RewardTriggerContext = {
  userId: string;
  localDate: string;
  trigger: RewardTrigger;
  triggerEventId: string;
  ringId?: "daily_tempo" | "daily_battery" | "daily_blundr";
  allRingsCompletionCount?: number;
  streakDays?: number;
  allRingsDaysSinceRandomReward?: number;
  pityEligible?: boolean;
  now?: string;
};

export type RewardGrantRecord = {
  id: string;
  rewardId: string;
  rewardRollId: string;
  trigger: RewardTrigger;
  triggerEventId: string;
  rarity: RewardRarity;
  rewardType: VariableRewardType;
  amount: number;
  displayName: string;
  description: string;
  pointsApplied: number;
  applied: boolean;
  pendingChoice: boolean;
  grantMode: RewardGrantMode;
  createdAt: string;
};

export type RewardTriggerOutcome = {
  roll: RewardRoll;
  reward: VariableReward | null;
  grant: RewardGrantRecord | null;
  grantMode: RewardGrantMode | null;
  didReward: boolean;
  missedReason?: string;
};

export type RewardBatchResult = {
  userId: string;
  localDate: string;
  rewardHistory: UserRewardHistory;
  rewardRolls: RewardRoll[];
  rewardGrants: RewardGrantRecord[];
  rewardPointsAwarded: number;
  randomBonusGranted: boolean;
  pityTriggered: boolean;
  guaranteedCacheGranted: boolean;
  state: TempoCacheState;
};

export type TempoCacheResult = {
  state: TempoCacheState;
  rewardHistory: UserRewardHistory;
  rewardRolls: RewardRoll[];
  rewardGrants: RewardGrantRecord[];
  rewardPointsAwarded: number;
  randomBonusGranted: boolean;
  pityTriggered: boolean;
  guaranteedCacheGranted: boolean;
};
