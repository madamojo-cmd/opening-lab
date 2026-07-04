import type {
  DailyRingProgress,
  DailyRetentionProgress,
  DeveloperAuditLogEntry,
  RewardRoll,
  StreakRecord,
  UserAccount,
  UserRepertoire,
  UserRewardHistory,
  UserTrainingProfile,
  ValidationSnapshot,
  RewardTrigger,
  RewardRarity,
  VariableReward,
  VariableRewardType,
  OpeningUnlockProgress,
  OpeningUnlockEvent,
  StarterPackId,
  RatingBandId,
  CurrentBlundrUser,
} from "./accountTypes";

function nowIso(): string {
  return new Date().toISOString();
}

function localDateKey(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function createDefaultTrainingProfile(userId: string, now = nowIso()): UserTrainingProfile {
  return {
    userId,
    onboardingCompleted: false,
    ratingBandId: "1200-1600",
    ratingSource: "default",
    preferredTrainingMode: "assisted",
    dailyTempoGoal: 10,
    dailyBatteryGoal: 3,
    dailyBlundrGoal: 1,
    selectedStarterPackId: "classical_attacker",
    createdAt: now,
    updatedAt: now,
  };
}

export function createDefaultUserRepertoire(userId: string, now = nowIso()): UserRepertoire {
  return {
    userId,
    unlockedOpeningIds: [],
    lockedOpeningIds: [],
    openingUnlockPoints: 0,
    updatedAt: now,
  };
}

function buildRingProgress(type: DailyRingProgress["type"], goal: number): DailyRingProgress {
  return {
    type,
    goal: Math.max(1, Number(goal) || 1),
    progress: 0,
    completed: false,
  };
}

export function createDefaultDailyRetentionProgress(userId: string, localDate = localDateKey(), profile?: Pick<UserTrainingProfile, "dailyTempoGoal" | "dailyBatteryGoal" | "dailyBlundrGoal">, now = nowIso()): DailyRetentionProgress {
  const goals = profile ?? {
    dailyTempoGoal: 10,
    dailyBatteryGoal: 3,
    dailyBlundrGoal: 1,
  };
  return {
    userId,
    localDate,
    rings: {
      dailyTempo: buildRingProgress("daily_tempo", goals.dailyTempoGoal),
      dailyBattery: buildRingProgress("daily_battery", goals.dailyBatteryGoal),
      dailyBlundr: buildRingProgress("daily_blundr", goals.dailyBlundrGoal),
    },
    allRingsClosed: false,
    xpEarned: 0,
    openingPointsEarned: 0,
    streakEligible: false,
    updatedAt: now,
  };
}

export function createDefaultStreakRecord(userId: string, now = nowIso()): StreakRecord {
  return {
    userId,
    currentStreak: 0,
    longestStreak: 0,
    updatedAt: now,
  };
}

export function createDefaultRewardHistory(userId: string, now = nowIso()): UserRewardHistory {
  return {
    userId,
    randomBonusPityCounter: 0,
    updatedAt: now,
  };
}

export function createDefaultValidationSnapshot(userId: string, reportJson: unknown, now = nowIso()): ValidationSnapshot {
  const report = reportJson && typeof reportJson === "object" ? (reportJson as { valid?: boolean; issues?: readonly unknown[] }) : {};
  const issueCount = Array.isArray(report.issues) ? report.issues.length : 0;
  return {
    id: `${userId}:validation:${now}`,
    userId,
    generatedAt: now,
    valid: Boolean(report.valid),
    issueCount,
    errorCount: 0,
    warningCount: 0,
    reportJson,
  };
}

export function createDefaultOpeningUnlockProgress(userId: string, openingId: string, now = nowIso(), requiredPoints = 1): OpeningUnlockProgress {
  return {
    userId,
    openingId,
    pointsEarned: 0,
    requiredPoints: Math.max(1, Number(requiredPoints) || 1),
    status: "locked",
    updatedAt: now,
  };
}

export function createDefaultOpeningUnlockEvent(userId: string, openingId: string, source: OpeningUnlockEvent["source"], openingPointsEarned = 0, id = `${userId}:${openingId}:${source}:${nowIso()}`, now = nowIso()): OpeningUnlockEvent {
  return {
    id,
    userId,
    openingId,
    source,
    openingPointsEarned,
    createdAt: now,
  };
}

export function createDefaultRewardRoll(userId: string, trigger: RewardTrigger, seed: string, now = nowIso(), didReward = false, reward?: VariableReward): RewardRoll {
  return {
    id: `${userId}:${trigger}:${seed}:${now}`,
    userId,
    trigger,
    rolledAt: now,
    didReward,
    reward,
    seed,
  };
}

export function createDefaultUserAccount(userId: string, now = nowIso()): UserAccount {
  const profile = createDefaultTrainingProfile(userId, now);
  return {
    userId,
    mode: "local_demo",
    profile,
    repertoire: createDefaultUserRepertoire(userId, now),
    streakRecord: createDefaultStreakRecord(userId, now),
    rewardHistory: createDefaultRewardHistory(userId, now),
  };
}

export function createLocalDemoUser(now = nowIso()): CurrentBlundrUser {
  return {
    userId: "local-demo-user",
    email: null,
    mode: "local_demo",
    isAuthenticated: false,
    isAdmin: false,
    provider: "local",
    accessToken: null,
  };
}

export function normalizeRatingBandId(value: unknown): RatingBandId {
  return value === "new_to_openings" || value === "u800" || value === "800-1200" || value === "1200-1600" || value === "1600-2000" || value === "2000-plus"
    ? value
    : "1200-1600";
}

export function normalizeStarterPackId(value: unknown): StarterPackId | undefined {
  return value === "solid_builder" || value === "classical_attacker" || value === "dynamic_fighter" || value === "flexible_strategist" ? value : undefined;
}
