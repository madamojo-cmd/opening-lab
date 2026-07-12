// server-only: do not import into client components.

import { createBlundrSupabaseAdminClient } from "../backend/supabaseAdminClient";
import { BLUNDR_PERSISTENCE_TABLES } from "../persistence/persistenceKeys";
import type { CurrentBlundrUser, DeveloperAuditLogEntry, OpeningUnlockEvent, OpeningUnlockProgress, RewardRoll, StreakRecord, UserRepertoire, UserRewardHistory, UserTrainingProfile, ValidationSnapshot, BlundrAccountMode } from "./accountTypes";
import type { BlundrPersistenceAdapter, PersistenceResult, DeveloperAuditLogWrite } from "../persistence/persistenceTypes";
import { resolveBlundrPersistenceAdapter } from "../persistence/persistenceService";
import { writeLocalDeveloperAuditLogEntry } from "../persistence/localPersistenceAdapter";

export type AccountRepositoryContext = {
  user?: CurrentBlundrUser | null;
  mode?: BlundrAccountMode;
  accessToken?: string | null;
  allowLocalFallback?: boolean;
  useAdminClient?: boolean;
};

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

export function getAccountPersistenceAdapter(context: AccountRepositoryContext = {}): BlundrPersistenceAdapter {
  return resolveBlundrPersistenceAdapter({
    user: context.user ?? null,
    mode: context.mode,
    accessToken: context.accessToken ?? context.user?.accessToken ?? null,
    allowLocalFallback: context.allowLocalFallback,
    useAdminClient: context.useAdminClient,
  });
}

export async function readTrainingProfile(userId: string, context: AccountRepositoryContext = {}): Promise<PersistenceResult<UserTrainingProfile | null>> {
  return getAccountPersistenceAdapter(context).getTrainingProfile(userId);
}

export async function saveTrainingProfile(profile: UserTrainingProfile, context: AccountRepositoryContext = {}): Promise<PersistenceResult<UserTrainingProfile>> {
  return getAccountPersistenceAdapter(context).upsertTrainingProfile(profile);
}

export async function readUserRepertoire(userId: string, context: AccountRepositoryContext = {}): Promise<PersistenceResult<UserRepertoire | null>> {
  return getAccountPersistenceAdapter(context).getUserRepertoire(userId);
}

export async function saveUserRepertoire(repertoire: UserRepertoire, context: AccountRepositoryContext = {}): Promise<PersistenceResult<UserRepertoire>> {
  return getAccountPersistenceAdapter(context).upsertUserRepertoire(repertoire);
}

export async function readDailyRetentionProgress(userId: string, localDate: string, context: AccountRepositoryContext = {}): Promise<PersistenceResult<import("./accountTypes").DailyRetentionProgress | null>> {
  return getAccountPersistenceAdapter(context).getDailyRetentionProgress(userId, localDate);
}

export async function saveDailyRetentionProgress(progress: import("./accountTypes").DailyRetentionProgress, context: AccountRepositoryContext = {}): Promise<PersistenceResult<import("./accountTypes").DailyRetentionProgress>> {
  return getAccountPersistenceAdapter(context).upsertDailyRetentionProgress(progress);
}

export async function readOpeningUnlockProgress(userId: string, context: AccountRepositoryContext = {}): Promise<PersistenceResult<OpeningUnlockProgress[]>> {
  return getAccountPersistenceAdapter(context).getOpeningUnlockProgress(userId);
}

export async function saveOpeningUnlockProgress(progress: OpeningUnlockProgress, context: AccountRepositoryContext = {}): Promise<PersistenceResult<OpeningUnlockProgress>> {
  return getAccountPersistenceAdapter(context).upsertOpeningUnlockProgress(progress);
}

export async function appendOpeningUnlockEvent(event: OpeningUnlockEvent, context: AccountRepositoryContext = {}): Promise<PersistenceResult<OpeningUnlockEvent>> {
  return getAccountPersistenceAdapter(context).appendOpeningUnlockEvent(event);
}

export async function readStreakRecord(userId: string, context: AccountRepositoryContext = {}): Promise<PersistenceResult<StreakRecord | null>> {
  return getAccountPersistenceAdapter(context).getStreakRecord(userId);
}

export async function saveStreakRecord(record: StreakRecord, context: AccountRepositoryContext = {}): Promise<PersistenceResult<StreakRecord>> {
  return getAccountPersistenceAdapter(context).upsertStreakRecord(record);
}

export async function readRewardHistory(userId: string, context: AccountRepositoryContext = {}): Promise<PersistenceResult<UserRewardHistory | null>> {
  return getAccountPersistenceAdapter(context).getRewardHistory(userId);
}

export async function saveRewardHistory(history: UserRewardHistory, context: AccountRepositoryContext = {}): Promise<PersistenceResult<UserRewardHistory>> {
  return getAccountPersistenceAdapter(context).upsertRewardHistory(history);
}

export async function readRewardRolls(userId: string, context: AccountRepositoryContext = {}): Promise<PersistenceResult<RewardRoll[]>> {
  return getAccountPersistenceAdapter(context).getRewardRolls(userId);
}

export async function appendRewardRoll(roll: RewardRoll, context: AccountRepositoryContext = {}): Promise<PersistenceResult<RewardRoll>> {
  return getAccountPersistenceAdapter(context).appendRewardRoll(roll);
}

export async function saveValidationSnapshot(snapshot: ValidationSnapshot, context: AccountRepositoryContext = {}): Promise<PersistenceResult<ValidationSnapshot>> {
  return getAccountPersistenceAdapter(context).saveValidationSnapshot(snapshot);
}

export async function appendDeveloperAuditLogEntry(entry: DeveloperAuditLogWrite, context: AccountRepositoryContext = {}): Promise<PersistenceResult<DeveloperAuditLogEntry>> {
  const normalized: DeveloperAuditLogEntry = {
    id: normalizeText(entry.id) || `${normalizeText(entry.actorUserId)}:${normalizeText(entry.action)}:${Date.now()}`,
    actorUserId: normalizeText(entry.actorUserId) || null,
    targetUserId: normalizeText(entry.targetUserId) || null,
    action: normalizeText(entry.action) || "unknown",
    payload: entry.payload ?? null,
    createdAt: normalizeText(entry.createdAt) || new Date().toISOString(),
  };

  const adminClient = createBlundrSupabaseAdminClient();
  if (adminClient) {
    try {
      const { data, error } = await adminClient
        .from(BLUNDR_PERSISTENCE_TABLES.developerAuditLog)
        .insert({
          id: normalized.id,
          actor_user_id: normalized.actorUserId,
          target_user_id: normalized.targetUserId,
          action: normalized.action,
          payload: normalized.payload ?? null,
          created_at: normalized.createdAt,
        })
        .select("*")
        .maybeSingle();
      if (!error && data) {
        return {
          ok: true,
          data: {
            id: normalizeText((data as { id?: unknown }).id) || normalized.id,
            actorUserId: normalizeText((data as { actor_user_id?: unknown }).actor_user_id) || normalized.actorUserId,
            targetUserId: normalizeText((data as { target_user_id?: unknown }).target_user_id) || normalized.targetUserId,
            action: normalizeText((data as { action?: unknown }).action) || normalized.action,
            payload: (data as { payload?: unknown }).payload ?? normalized.payload,
            createdAt: normalizeText((data as { created_at?: unknown }).created_at) || normalized.createdAt,
          },
        };
      }
    } catch {
      // fall back to local audit log below
    }
  }

  const localEntry = writeLocalDeveloperAuditLogEntry(entry);
  return { ok: true, data: localEntry };
}
