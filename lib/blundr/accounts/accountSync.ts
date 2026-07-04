import {
  createDefaultDailyRetentionProgress,
  createDefaultRewardHistory,
  createDefaultStreakRecord,
  createDefaultTrainingProfile,
} from "./accountDefaults";
import type {
  CurrentBlundrUser,
  DailyRetentionProgress,
  StreakRecord,
  UserAccountSyncState,
  UserRepertoire,
  UserRewardHistory,
  UserTrainingProfile,
  ValidationSnapshot,
  BlundrAccountMode,
} from "./accountTypes";
import type { PersistenceResult } from "../persistence/persistenceTypes";
import { getAccountPersistenceAdapter } from "./accountRepository";
import { getLocalDailyRetentionProgress, getLocalStreakRecord } from "./localAccountStorage";
import { readLocalDailyBlundrState } from "../daily/dailyBlundrStorage";
import { buildInitialRepertoireFromStarterPack } from "../onboarding/starterPacks";

export type DailyStateSyncInput = {
  user?: CurrentBlundrUser | null;
  accessToken?: string | null;
  mode?: BlundrAccountMode;
  allowLocalFallback?: boolean;
  profile?: UserTrainingProfile | null;
  repertoire?: UserRepertoire | null;
  streakRecord?: StreakRecord | null;
  rewardHistory?: UserRewardHistory | null;
  dailyRetentionProgress?: DailyRetentionProgress | null;
  validationSnapshot?: ValidationSnapshot | null;
  now?: string;
};

type TimedRecord = { updatedAt?: string | null };

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function localDateKey(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function chooseNewer<T extends TimedRecord>(local: T, remote: T | null | undefined): T {
  if (!remote) return local;
  const localUpdatedAt = Date.parse(normalizeText(local.updatedAt));
  const remoteUpdatedAt = Date.parse(normalizeText(remote.updatedAt));
  if (!Number.isFinite(remoteUpdatedAt)) return local;
  if (!Number.isFinite(localUpdatedAt)) return remote;
  return remoteUpdatedAt > localUpdatedAt ? remote : local;
}

function mergeUnique(valuesA: readonly string[], valuesB: readonly string[]): string[] {
  return Array.from(new Set([...valuesA, ...valuesB].map((value) => normalizeText(value)).filter(Boolean)));
}

function mergeRepertoire(local: UserRepertoire, remote: UserRepertoire | null | undefined): UserRepertoire {
  if (!remote) return local;
  const winner = chooseNewer(local, remote);
  return {
    ...winner,
    unlockedOpeningIds: mergeUnique(local.unlockedOpeningIds, remote.unlockedOpeningIds),
    lockedOpeningIds: mergeUnique(local.lockedOpeningIds, remote.lockedOpeningIds),
    openingUnlockPoints: Math.max(local.openingUnlockPoints, remote.openingUnlockPoints),
    selectedStarterPackId: winner.selectedStarterPackId ?? local.selectedStarterPackId ?? remote.selectedStarterPackId,
  };
}

function getPersistenceError(result: PersistenceResult<unknown>) {
  if ("error" in result) {
    return result.error;
  }
  return { code: "persistence_error", message: "Unknown persistence error." };
}

function failSync<T>(result: PersistenceResult<T>): PersistenceResult<UserAccountSyncState> {
  return { ok: false, error: getPersistenceError(result) };
}

function buildDailyRetentionProgress(userId: string, localState: ReturnType<typeof readLocalDailyBlundrState>, profile: UserTrainingProfile, now: string): DailyRetentionProgress {
  const progress = createDefaultDailyRetentionProgress(userId, localState.dateKey, {
    dailyTempoGoal: profile.dailyTempoGoal,
    dailyBatteryGoal: profile.dailyBatteryGoal,
    dailyBlundrGoal: profile.dailyBlundrGoal,
  }, now);
  const reviewCount = localState.reviewCards.length;
  const attemptCount = localState.reviewAttempts.length;
  progress.rings.dailyTempo.progress = Math.min(progress.rings.dailyTempo.goal, reviewCount);
  progress.rings.dailyBattery.progress = Math.min(progress.rings.dailyBattery.goal, attemptCount);
  progress.rings.dailyBlundr.progress = Math.min(progress.rings.dailyBlundr.goal, localState.store.progress.completionCount > 0 ? 1 : 0);
  progress.rings.dailyTempo.completed = progress.rings.dailyTempo.progress >= progress.rings.dailyTempo.goal;
  progress.rings.dailyBattery.completed = progress.rings.dailyBattery.progress >= progress.rings.dailyBattery.goal;
  progress.rings.dailyBlundr.completed = progress.rings.dailyBlundr.progress >= progress.rings.dailyBlundr.goal;
  progress.allRingsClosed = progress.rings.dailyTempo.completed && progress.rings.dailyBattery.completed && progress.rings.dailyBlundr.completed;
  progress.allRingsClosedAt = progress.allRingsClosed ? now : undefined;
  progress.xpEarned = Math.max(0, localState.store.progress.localDailyXp ?? 0);
  progress.streakEligible = Boolean(localState.store.progress.lastCompletedDateKey === localState.dateKey);
  progress.completedAt = progress.allRingsClosed ? now : undefined;
  progress.updatedAt = now;
  return progress;
}

export function readLocalDailyBlundrStateSnapshot() {
  return readLocalDailyBlundrState();
}

export function prepareDailyStateForAccountSync(userId: string, input: DailyStateSyncInput = {}): UserAccountSyncState {
  const localState = readLocalDailyBlundrState();
  const now = input.now ?? nowIso();
  const profile = input.profile ?? createDefaultTrainingProfile(userId, now);
  const localRetentionProgress = getLocalDailyRetentionProgress(userId, localState.dateKey);
  const localStreakRecord = getLocalStreakRecord(userId);
  const repertoire =
    input.repertoire ??
    buildInitialRepertoireFromStarterPack({
      userId,
      starterPackId: profile.selectedStarterPackId ?? "classical_attacker",
      now,
    });
  const streakRecord = input.streakRecord ?? localStreakRecord ?? createDefaultStreakRecord(userId, now);
  const rewardHistory = input.rewardHistory ?? createDefaultRewardHistory(userId, now);
  const dailyRetentionProgress = input.dailyRetentionProgress ?? localRetentionProgress ?? buildDailyRetentionProgress(userId, localState, profile, now);

  return {
    userId,
    localDate: localState.dateKey,
    profile,
    repertoire,
    streakRecord,
    rewardHistory,
    dailyRetentionProgress,
    validationSnapshot: input.validationSnapshot ?? null,
  };
}

export async function syncDailyStateToAccount(userId: string, input: DailyStateSyncInput = {}): Promise<PersistenceResult<UserAccountSyncState>> {
  const adapter = getAccountPersistenceAdapter({
    user: input.user ?? null,
    mode: input.mode,
    accessToken: input.accessToken ?? input.user?.accessToken ?? null,
    allowLocalFallback: input.allowLocalFallback,
  });
  const prepared = prepareDailyStateForAccountSync(userId, input);

  const profileResult = await adapter.getTrainingProfile(userId);
  const repertoireResult = await adapter.getUserRepertoire(userId);
  const streakResult = await adapter.getStreakRecord(userId);
  const rewardHistoryResult = await adapter.getRewardHistory(userId);
  const progressResult = await adapter.getDailyRetentionProgress(userId, prepared.localDate);

  const profile = chooseNewer(prepared.profile, profileResult.ok ? profileResult.data : null);
  const repertoire = mergeRepertoire(prepared.repertoire, repertoireResult.ok ? repertoireResult.data : null);
  const streakRecord = chooseNewer(prepared.streakRecord, streakResult.ok ? streakResult.data : null);
  const rewardHistory = chooseNewer(prepared.rewardHistory, rewardHistoryResult.ok ? rewardHistoryResult.data : null);
  const dailyRetentionProgress = chooseNewer(prepared.dailyRetentionProgress, progressResult.ok ? progressResult.data : null);

  const writeProfile = await adapter.upsertTrainingProfile(profile);
  if (!writeProfile.ok) return failSync(writeProfile);
  const writeRepertoire = await adapter.upsertUserRepertoire(repertoire);
  if (!writeRepertoire.ok) return failSync(writeRepertoire);
  const writeStreak = await adapter.upsertStreakRecord(streakRecord);
  if (!writeStreak.ok) return failSync(writeStreak);
  const writeRewardHistory = await adapter.upsertRewardHistory(rewardHistory);
  if (!writeRewardHistory.ok) return failSync(writeRewardHistory);
  const writeProgress = await adapter.upsertDailyRetentionProgress(dailyRetentionProgress);
  if (!writeProgress.ok) return failSync(writeProgress);
  if (prepared.validationSnapshot) {
    await adapter.saveValidationSnapshot(prepared.validationSnapshot);
  }

  return {
    ok: true,
    data: {
      ...prepared,
      profile,
      repertoire,
      streakRecord,
      rewardHistory,
      dailyRetentionProgress,
    },
  };
}

export async function syncLocalDemoStateToAccount(userId: string, input: DailyStateSyncInput = {}): Promise<PersistenceResult<UserAccountSyncState>> {
  return syncDailyStateToAccount(userId, input);
}
