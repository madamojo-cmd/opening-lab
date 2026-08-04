import {
  createDefaultDailyRetentionProgress,
  createDefaultRewardHistory,
  createDefaultStreakRecord,
  createDefaultTrainingProfile,
  createDefaultUserRepertoire,
} from "./accountDefaults";
import type {
  CurrentBlundrUser,
  DailyRetentionProgress,
  StreakRecord,
  UserAccountBootstrap,
  UserRepertoire,
  UserRewardHistory,
  UserTrainingProfile,
  ValidationSnapshot,
  BlundrAccountMode,
} from "./accountTypes";
import type { PersistenceResult } from "../persistence/persistenceTypes";
import { getCurrentBlundrUser } from "./accountSession";
import {
  readDailyRetentionProgress,
  readRewardHistory,
  readStreakRecord,
  readTrainingProfile,
  readUserRepertoire,
  saveDailyRetentionProgress,
  saveRewardHistory,
  saveStreakRecord,
  saveTrainingProfile,
  saveUserRepertoire,
} from "./accountRepository";
import { syncLocalDemoStateToAccount as syncDailyStateToAccount } from "./accountSync";

export type AccountServiceContext = {
  user?: CurrentBlundrUser | null;
  mode?: BlundrAccountMode;
  accessToken?: string | null;
  allowLocalFallback?: boolean;
  now?: string;
  localDate?: string;
  validationSnapshot?: ValidationSnapshot | null;
};

function nowIso(): string {
  return new Date().toISOString();
}

function localDateKey(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function chooseExisting<T extends { updatedAt: string }>(
  current: T,
  existing: T | null,
): T {
  // `current` is a newly-created default whose timestamp is necessarily newer
  // than durable account state. Bootstrap must never let that timestamp erase
  // onboarding choices, repertoire access, or accumulated progress.
  return existing ?? current;
}

function getPersistenceError(result: PersistenceResult<unknown>) {
  if ("error" in result) {
    return result.error;
  }
  return { code: "persistence_error", message: "Unknown persistence error." };
}

function failBootstrap(
  result: PersistenceResult<unknown>,
): PersistenceResult<UserAccountBootstrap> {
  return { ok: false, error: getPersistenceError(result) };
}

async function createOrUpdate<T extends { updatedAt: string }>(
  read: Promise<PersistenceResult<T | null>>,
  write: (
    value: T,
    context: AccountServiceContext,
  ) => Promise<PersistenceResult<T>>,
  fallback: T,
  context: AccountServiceContext,
  persistMissing = true,
): Promise<PersistenceResult<T>> {
  const existing = await read;
  if (!existing.ok) return existing;
  if (existing.data)
    return { ok: true, data: chooseExisting(fallback, existing.data) };
  if (!persistMissing) return { ok: true, data: fallback };
  return write(fallback, context);
}

export async function getOrCreateTrainingProfile(
  userId: string,
  context: AccountServiceContext = {},
): Promise<PersistenceResult<UserTrainingProfile>> {
  const now = context.now ?? nowIso();
  const fallback = createDefaultTrainingProfile(userId, now);
  return createOrUpdate(
    readTrainingProfile(userId, context),
    saveTrainingProfile,
    fallback,
    context,
  );
}

export async function getOrCreateUserRepertoire(
  userId: string,
  context: AccountServiceContext = {},
): Promise<PersistenceResult<UserRepertoire>> {
  const now = context.now ?? nowIso();
  // Do not grant a starter pack merely because an account is authenticated.
  // The confirmed onboarding service performs the idempotent initialization.
  const fallback = createDefaultUserRepertoire(userId, now);
  return createOrUpdate(
    readUserRepertoire(userId, context),
    saveUserRepertoire,
    fallback,
    context,
    false,
  );
}

export async function getOrCreateStreakRecord(
  userId: string,
  context: AccountServiceContext = {},
): Promise<PersistenceResult<StreakRecord>> {
  const now = context.now ?? nowIso();
  const fallback = createDefaultStreakRecord(userId, now);
  return createOrUpdate(
    readStreakRecord(userId, context),
    saveStreakRecord,
    fallback,
    context,
    false,
  );
}

export async function getOrCreateRewardHistory(
  userId: string,
  context: AccountServiceContext = {},
): Promise<PersistenceResult<UserRewardHistory>> {
  const now = context.now ?? nowIso();
  const fallback = createDefaultRewardHistory(userId, now);
  return createOrUpdate(
    readRewardHistory(userId, context),
    saveRewardHistory,
    fallback,
    context,
    false,
  );
}

export async function getOrCreateDailyRetentionProgress(
  userId: string,
  context: AccountServiceContext = {},
): Promise<PersistenceResult<DailyRetentionProgress>> {
  const now = context.now ?? nowIso();
  const localDate = context.localDate ?? localDateKey(new Date(now));
  const profileResult = await getOrCreateTrainingProfile(userId, context);
  const profile = profileResult.ok
    ? profileResult.data
    : createDefaultTrainingProfile(userId, now);
  const fallback = createDefaultDailyRetentionProgress(
    userId,
    localDate,
    {
      dailyTempoGoal: profile.dailyTempoGoal,
      dailyBatteryGoal: profile.dailyBatteryGoal,
      dailyBlundrGoal: profile.dailyBlundrGoal,
    },
    now,
  );
  return createOrUpdate(
    readDailyRetentionProgress(userId, localDate, context),
    saveDailyRetentionProgress,
    fallback,
    context,
    false,
  );
}

export async function initializeAccountDefaults(
  userId: string,
  context: AccountServiceContext = {},
): Promise<PersistenceResult<UserAccountBootstrap>> {
  const now = context.now ?? nowIso();
  const localDate = context.localDate ?? localDateKey(new Date(now));
  const [
    profileResult,
    repertoireResult,
    streakRecordResult,
    rewardHistoryResult,
    dailyRetentionProgressResult,
  ] = await Promise.all([
    getOrCreateTrainingProfile(userId, context),
    getOrCreateUserRepertoire(userId, context),
    getOrCreateStreakRecord(userId, context),
    getOrCreateRewardHistory(userId, context),
    getOrCreateDailyRetentionProgress(userId, { ...context, localDate, now }),
  ]);

  if (!profileResult.ok) return failBootstrap(profileResult);
  if (!repertoireResult.ok) return failBootstrap(repertoireResult);
  if (!streakRecordResult.ok) return failBootstrap(streakRecordResult);
  if (!rewardHistoryResult.ok) return failBootstrap(rewardHistoryResult);
  if (!dailyRetentionProgressResult.ok)
    return failBootstrap(dailyRetentionProgressResult);

  const user = context.user ?? {
    userId,
    email: null,
    mode: context.mode ?? "local_demo",
    isAuthenticated: context.mode !== "local_demo",
    isAdmin: context.mode === "developer_admin",
    accessToken: context.accessToken ?? null,
    provider: null,
  };

  return {
    ok: true,
    data: {
      user,
      profile: profileResult.data,
      repertoire: repertoireResult.data,
      streakRecord: streakRecordResult.data,
      rewardHistory: rewardHistoryResult.data,
      dailyRetentionProgress: dailyRetentionProgressResult.data,
    },
  };
}

export async function bootstrapBlundrAccount(
  input: AccountServiceContext & { request?: Request | null } = {},
): Promise<PersistenceResult<UserAccountBootstrap>> {
  const user =
    input.user ??
    (await getCurrentBlundrUser({
      request: input.request ?? null,
      allowLocalFallback: input.allowLocalFallback,
    }));
  if (!user) {
    return {
      ok: false,
      error: {
        code: "authentication_required",
        message: "A valid user session is required to bootstrap this account.",
        retryable: false,
      },
    };
  }
  return initializeAccountDefaults(user.userId, {
    ...input,
    user,
  });
}

export async function syncLocalDemoStateToAccount(
  userId: string,
  context: AccountServiceContext = {},
) {
  return syncDailyStateToAccount(userId, context);
}
