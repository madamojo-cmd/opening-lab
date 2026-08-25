import type { DailyBlundrDifficulty } from "../daily/dailyBlundrTypes";

export type RatingBandId =
  | "new_to_openings"
  | "u800"
  | "800-1200"
  | "1200-1600"
  | "1600-2000"
  | "2000-plus";

export type StarterPackId =
  | "solid_builder"
  | "classical_attacker"
  | "dynamic_fighter"
  | "flexible_strategist";

export type BlundrAccountMode = "local_demo" | "authenticated" | "developer_admin";

export type UserTrainingProfile = {
  userId: string;
  onboardingCompleted: boolean;
  ratingBandId: RatingBandId;
  ratingSource: "manual" | "chesscom" | "lichess" | "default";
  /** Validated IANA timezone used by server-owned daily/reward accounting. */
  timeZone?: string;
  rawRating?: number;
  ratingTimeControl?: "rapid" | "blitz" | "classical" | "bullet" | "unknown";
  preferredTrainingMode: "assisted" | "plain";
  dailyTempoGoal: number;
  dailyBatteryGoal: number;
  dailyBlundrGoal: number;
  /** Target number of Daily Blundr cards per day (1-99). */
  dailyBlundrCardGoal: number;
  selectedStarterPackId?: StarterPackId;
  createdAt: string;
  updatedAt: string;
};

export type UserRepertoire = {
  userId: string;
  selectedStarterPackId?: StarterPackId;
  unlockedOpeningIds: string[];
  lockedOpeningIds: string[];
  openingUnlockPoints: number;
  updatedAt: string;
};

export type DailyRingType = "daily_tempo" | "daily_battery" | "daily_blundr";

export type DailyRingProgress = {
  type: DailyRingType;
  goal: number;
  progress: number;
  completed: boolean;
  completedAt?: string;
};

export type DailyRetentionProgress = {
  userId: string;
  localDate: string;
  rings: {
    dailyTempo: DailyRingProgress;
    dailyBattery: DailyRingProgress;
    dailyBlundr: DailyRingProgress;
  };
  allRingsClosed: boolean;
  allRingsClosedAt?: string;
  xpEarned: number;
  openingPointsEarned: number;
  streakEligible: boolean;
  activityEventIds: string[];
  completedAt?: string;
  updatedAt: string;
};

export type OpeningUnlockEventSource =
  | "daily_tempo"
  | "daily_battery"
  | "daily_blundr"
  | "all_rings_closed"
  | "reward_roll"
  | "weekly_milestone"
  | "monthly_milestone"
  | "manual_admin_unlock";

export type OpeningUnlockProgress = {
  userId: string;
  openingId: string;
  pointsEarned: number;
  requiredPoints: number;
  status: "locked" | "in_progress" | "unlocked";
  updatedAt: string;
};

export type OpeningUnlockEvent = {
  id: string;
  userId: string;
  openingId: string;
  source: OpeningUnlockEventSource;
  openingPointsEarned: number;
  createdAt: string;
};

export type StreakRecord = {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  totalAllRingsClosedDays: number;
  lastCompletedLocalDate?: string;
  updatedAt: string;
};

export type RewardTrigger =
  | "daily_tempo_ring_closed"
  | "daily_battery_ring_closed"
  | "daily_blundr_ring_closed"
  | "all_rings_closed"
  | "three_all_rings_completions"
  | "weekly_cache"
  | "monthly_cache"
  | "three_day_streak"
  | "seven_day_streak"
  | "thirty_day_streak";

export type RewardRarity = "common" | "uncommon" | "rare" | "epic";

export type VariableRewardType =
  | "unlock_points"
  | "opening_fragment"
  | "opening_preview_card"
  | "choice_token"
  | "style_pack_progress";

export type VariableReward = {
  id: string;
  rarity: RewardRarity;
  rewardType: VariableRewardType;
  amount?: number;
  openingId?: string;
  displayName: string;
  description: string;
};

export type RewardRoll = {
  id: string;
  userId: string;
  trigger: RewardTrigger;
  rolledAt: string;
  didReward: boolean;
  reward?: VariableReward;
  seed: string;
};

export type UserRewardHistory = {
  userId: string;
  allRingsDaysSinceRandomReward: number;
  randomBonusPityCounter: number;
  lastRandomRewardLocalDate?: string;
  lastRandomBonusAt?: string;
  lastPityGuaranteeLocalDate?: string;
  appliedRewardIds: string[];
  updatedAt: string;
};

export type ValidationSnapshot = {
  id: string;
  userId?: string;
  generatedAt: string;
  valid: boolean;
  issueCount: number;
  errorCount: number;
  warningCount: number;
  reportJson: unknown;
};

export type DeveloperAuditLogEntry = {
  id: string;
  actorUserId?: string | null;
  targetUserId?: string | null;
  action: string;
  payload?: unknown;
  createdAt: string;
};

export type UserAccount = {
  userId: string;
  email?: string | null;
  mode: BlundrAccountMode;
  profile: UserTrainingProfile;
  repertoire: UserRepertoire;
  streakRecord: StreakRecord;
  rewardHistory: UserRewardHistory;
};

export type CurrentBlundrUser = {
  userId: string;
  email?: string | null;
  mode: BlundrAccountMode;
  isAuthenticated: boolean;
  isAdmin: boolean;
  accessToken?: string | null;
  provider?: string | null;
  /** Server-validated sign-up metadata, never returned as a public profile. */
  age13Confirmed?: boolean;
};

export type UserAccountBootstrap = {
  user: CurrentBlundrUser;
  profile: UserTrainingProfile;
  repertoire: UserRepertoire;
  streakRecord: StreakRecord;
  rewardHistory: UserRewardHistory;
  dailyRetentionProgress: DailyRetentionProgress;
};

export type UserAccountSyncState = {
  userId: string;
  localDate: string;
  profile: UserTrainingProfile;
  repertoire: UserRepertoire;
  streakRecord: StreakRecord;
  rewardHistory: UserRewardHistory;
  dailyRetentionProgress: DailyRetentionProgress;
  validationSnapshot?: ValidationSnapshot | null;
};

export type DailyTrainingSettings = Pick<UserTrainingProfile, "dailyTempoGoal" | "dailyBatteryGoal" | "dailyBlundrGoal" | "dailyBlundrCardGoal" | "preferredTrainingMode" | "ratingBandId" | "ratingSource" | "selectedStarterPackId"> & {
  difficulty?: DailyBlundrDifficulty;
};
