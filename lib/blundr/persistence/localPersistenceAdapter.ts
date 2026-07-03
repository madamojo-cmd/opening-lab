import type { BlundrAccountMode, DailyRetentionProgress, OpeningUnlockEvent, OpeningUnlockProgress, RewardRoll, StreakRecord, UserRepertoire, UserRewardHistory, UserTrainingProfile, ValidationSnapshot } from "../accounts/accountTypes";
import {
  appendLocalDeveloperAuditLog,
  appendLocalOpeningUnlockEvent,
  appendLocalRewardRoll,
  getLocalDailyRetentionProgress,
  getLocalOpeningUnlockProgress,
  getLocalRewardHistory,
  getLocalStreakRecord,
  getLocalTrainingProfile,
  getLocalUserRepertoire,
  readLocalAccountBundle,
  saveLocalValidationSnapshot,
  setLocalAccountCurrentUserId,
  upsertLocalDailyRetentionProgress,
  upsertLocalOpeningUnlockProgress,
  upsertLocalRewardHistory,
  upsertLocalStreakRecord,
  upsertLocalTrainingProfile,
  upsertLocalUserRepertoire,
} from "../accounts/localAccountStorage";
import type { PersistenceError, PersistenceResult, BlundrPersistenceAdapter, DeveloperAuditLogWrite } from "./persistenceTypes";

function ok<T>(data: T): PersistenceResult<T> {
  return { ok: true, data };
}

function err<T = never>(code: string, message: string, cause?: unknown, retryable = false): PersistenceResult<T> {
  return { ok: false, error: { code, message, cause, retryable } };
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function currentUserIdFor(userId: string): string {
  const normalized = normalizeText(userId);
  if (normalized) setLocalAccountCurrentUserId(normalized);
  return normalized;
}

function withLocalError<T>(fallback: string, cause?: unknown): PersistenceResult<T> {
  return err("local_persistence_error", fallback, cause, false);
}

export function createBlundrLocalPersistenceAdapter(mode: BlundrAccountMode = "local_demo"): BlundrPersistenceAdapter {
  return {
    mode,
    async getTrainingProfile(userId: string) {
      try {
        return ok(getLocalTrainingProfile(userId));
      } catch (cause) {
        return withLocalError("Could not read local training profile.", cause);
      }
    },
    async upsertTrainingProfile(profile: UserTrainingProfile) {
      try {
        currentUserIdFor(profile.userId);
        return ok(upsertLocalTrainingProfile(profile));
      } catch (cause) {
        return withLocalError("Could not save local training profile.", cause);
      }
    },
    async getUserRepertoire(userId: string) {
      try {
        return ok(getLocalUserRepertoire(userId));
      } catch (cause) {
        return withLocalError("Could not read local repertoire.", cause);
      }
    },
    async upsertUserRepertoire(repertoire: UserRepertoire) {
      try {
        currentUserIdFor(repertoire.userId);
        return ok(upsertLocalUserRepertoire(repertoire));
      } catch (cause) {
        return withLocalError("Could not save local repertoire.", cause);
      }
    },
    async getDailyRetentionProgress(userId: string, localDate: string) {
      try {
        return ok(getLocalDailyRetentionProgress(userId, localDate));
      } catch (cause) {
        return withLocalError("Could not read local daily progress.", cause);
      }
    },
    async upsertDailyRetentionProgress(progress: DailyRetentionProgress) {
      try {
        currentUserIdFor(progress.userId);
        return ok(upsertLocalDailyRetentionProgress(progress));
      } catch (cause) {
        return withLocalError("Could not save local daily progress.", cause);
      }
    },
    async getOpeningUnlockProgress(userId: string) {
      try {
        return ok(getLocalOpeningUnlockProgress(userId));
      } catch (cause) {
        return withLocalError("Could not read local opening unlock progress.", cause);
      }
    },
    async upsertOpeningUnlockProgress(progress: OpeningUnlockProgress) {
      try {
        currentUserIdFor(progress.userId);
        const next = upsertLocalOpeningUnlockProgress(progress);
        return ok(next.find((entry) => entry.openingId === progress.openingId) ?? progress);
      } catch (cause) {
        return withLocalError("Could not save local opening unlock progress.", cause);
      }
    },
    async appendOpeningUnlockEvent(event: OpeningUnlockEvent) {
      try {
        currentUserIdFor(event.userId);
        return ok(appendLocalOpeningUnlockEvent(event));
      } catch (cause) {
        return withLocalError("Could not save local opening unlock event.", cause);
      }
    },
    async getStreakRecord(userId: string) {
      try {
        return ok(getLocalStreakRecord(userId));
      } catch (cause) {
        return withLocalError("Could not read local streak record.", cause);
      }
    },
    async upsertStreakRecord(record: StreakRecord) {
      try {
        currentUserIdFor(record.userId);
        return ok(upsertLocalStreakRecord(record));
      } catch (cause) {
        return withLocalError("Could not save local streak record.", cause);
      }
    },
    async getRewardHistory(userId: string) {
      try {
        return ok(getLocalRewardHistory(userId));
      } catch (cause) {
        return withLocalError("Could not read local reward history.", cause);
      }
    },
    async upsertRewardHistory(history: UserRewardHistory) {
      try {
        currentUserIdFor(history.userId);
        return ok(upsertLocalRewardHistory(history));
      } catch (cause) {
        return withLocalError("Could not save local reward history.", cause);
      }
    },
    async appendRewardRoll(roll: RewardRoll) {
      try {
        currentUserIdFor(roll.userId);
        return ok(appendLocalRewardRoll(roll));
      } catch (cause) {
        return withLocalError("Could not save local reward roll.", cause);
      }
    },
    async saveValidationSnapshot(snapshot: ValidationSnapshot) {
      try {
        if (snapshot.userId) currentUserIdFor(snapshot.userId);
        return ok(saveLocalValidationSnapshot(snapshot));
      } catch (cause) {
        return withLocalError("Could not save local validation snapshot.", cause);
      }
    },
  };
}

export function isLocalPersistenceAvailable(): boolean {
  return Boolean(readLocalAccountBundle());
}

export function writeLocalDeveloperAuditLogEntry(entry: DeveloperAuditLogWrite) {
  const normalized = appendLocalDeveloperAuditLog({
    id: normalizeText(entry.id) || `${normalizeText(entry.actorUserId)}:${normalizeText(entry.action)}:${Date.now()}`,
    actorUserId: normalizeText(entry.actorUserId) || null,
    targetUserId: normalizeText(entry.targetUserId) || null,
    action: normalizeText(entry.action) || "unknown",
    payload: entry.payload ?? null,
    createdAt: normalizeText(entry.createdAt) || new Date().toISOString(),
  });
  return normalized;
}
