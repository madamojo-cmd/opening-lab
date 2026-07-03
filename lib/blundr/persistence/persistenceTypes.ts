import type {
  CurrentBlundrUser,
  DailyRetentionProgress,
  DeveloperAuditLogEntry,
  OpeningUnlockEvent,
  OpeningUnlockProgress,
  RewardRoll,
  StreakRecord,
  UserRepertoire,
  UserRewardHistory,
  UserTrainingProfile,
  ValidationSnapshot,
  BlundrAccountMode,
} from "../accounts/accountTypes";

export type PersistenceError = {
  code: string;
  message: string;
  cause?: unknown;
  retryable?: boolean;
};

export type PersistenceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: PersistenceError };

export type BlundrPersistenceAdapter = {
  mode: BlundrAccountMode;
  getTrainingProfile(userId: string): Promise<PersistenceResult<UserTrainingProfile | null>>;
  upsertTrainingProfile(profile: UserTrainingProfile): Promise<PersistenceResult<UserTrainingProfile>>;
  getUserRepertoire(userId: string): Promise<PersistenceResult<UserRepertoire | null>>;
  upsertUserRepertoire(repertoire: UserRepertoire): Promise<PersistenceResult<UserRepertoire>>;
  getDailyRetentionProgress(userId: string, localDate: string): Promise<PersistenceResult<DailyRetentionProgress | null>>;
  upsertDailyRetentionProgress(progress: DailyRetentionProgress): Promise<PersistenceResult<DailyRetentionProgress>>;
  getOpeningUnlockProgress(userId: string): Promise<PersistenceResult<OpeningUnlockProgress[]>>;
  upsertOpeningUnlockProgress(progress: OpeningUnlockProgress): Promise<PersistenceResult<OpeningUnlockProgress>>;
  appendOpeningUnlockEvent(event: OpeningUnlockEvent): Promise<PersistenceResult<OpeningUnlockEvent>>;
  getStreakRecord(userId: string): Promise<PersistenceResult<StreakRecord | null>>;
  upsertStreakRecord(record: StreakRecord): Promise<PersistenceResult<StreakRecord>>;
  getRewardHistory(userId: string): Promise<PersistenceResult<UserRewardHistory | null>>;
  upsertRewardHistory(history: UserRewardHistory): Promise<PersistenceResult<UserRewardHistory>>;
  appendRewardRoll(roll: RewardRoll): Promise<PersistenceResult<RewardRoll>>;
  saveValidationSnapshot(snapshot: ValidationSnapshot): Promise<PersistenceResult<ValidationSnapshot>>;
};

export type DeveloperAuditLogWrite = Omit<DeveloperAuditLogEntry, "id" | "createdAt"> & {
  id?: string;
  createdAt?: string;
};

export type SupabaseTableNames = {
  userProfiles: string;
  userRepertoires: string;
  dailyRetentionProgress: string;
  openingUnlockProgress: string;
  openingUnlockEvents: string;
  streakRecords: string;
  rewardHistory: string;
  rewardRolls: string;
  validationSnapshots: string;
  developerAuditLog: string;
};

