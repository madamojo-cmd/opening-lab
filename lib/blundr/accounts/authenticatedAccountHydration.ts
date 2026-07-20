"use client";

import type { UserAccountBootstrap } from "./accountTypes";
import {
  setLocalAccountCurrentUserId,
  upsertLocalDailyRetentionProgress,
  upsertLocalRewardHistory,
  upsertLocalStreakRecord,
  upsertLocalTrainingProfile,
  upsertLocalUserRepertoire,
} from "./localAccountStorage";

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

export type AuthenticatedAccountHydrationResult =
  | { ok: true; userId: string }
  | { ok: false; code: "invalid_snapshot" | "user_mismatch" };

/**
 * Mirrors a server-owned account snapshot only after proving it belongs to the
 * current authenticated session. No local account write occurs on mismatch.
 */
export function persistAuthenticatedAccountSnapshot(
  authenticatedUserId: string,
  snapshot: UserAccountBootstrap | null | undefined,
): AuthenticatedAccountHydrationResult {
  const sessionUserId = normalizeText(authenticatedUserId);
  const snapshotUserId = normalizeText(snapshot?.user?.userId);
  if (!sessionUserId || !snapshot || !snapshotUserId) {
    return { ok: false, code: "invalid_snapshot" };
  }
  if (snapshotUserId !== sessionUserId) {
    return { ok: false, code: "user_mismatch" };
  }

  setLocalAccountCurrentUserId(snapshotUserId);
  upsertLocalTrainingProfile(snapshot.profile);
  upsertLocalUserRepertoire(snapshot.repertoire);
  upsertLocalStreakRecord(snapshot.streakRecord);
  upsertLocalRewardHistory(snapshot.rewardHistory);
  upsertLocalDailyRetentionProgress(snapshot.dailyRetentionProgress);
  return { ok: true, userId: snapshotUserId };
}
