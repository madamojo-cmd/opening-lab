import { appendDeveloperAuditLogEntry, getAccountPersistenceAdapter, readRewardHistory, readTrainingProfile, readUserRepertoire, saveRewardHistory, saveUserRepertoire } from "../accounts/accountRepository";
import { buildInitialRepertoireFromStarterPack } from "../onboarding/starterPacks";
import { createDefaultRewardHistory } from "../accounts/accountDefaults";
import { createRepertoirePointEvent } from "../repertoire/repertoirePoints";
import type { CurrentBlundrUser, UserRepertoire, UserRewardHistory } from "../accounts/accountTypes";
import { createDefaultUserRepertoire } from "../accounts/accountDefaults";
import { isPersistenceFailure } from "../persistence/persistenceTypes";

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeAmount(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return Math.max(0, Math.floor(fallback));
  return Math.max(0, Math.floor(parsed));
}

function adminContext(adminUser: CurrentBlundrUser) {
  return {
    user: adminUser,
    mode: "developer_admin" as const,
    allowLocalFallback: false,
    useAdminClient: true,
  };
}

function buildEventId(parts: readonly string[]): string {
  return parts.map((part) => normalizeText(part) || "unknown").join(":");
}

export type AdminRewardGrantType = "repertoire_points" | "opening_fragment" | "choice_token" | "epic_bonus";

export type AdminRewardGrantInput = {
  adminUser: CurrentBlundrUser;
  targetUserId: string;
  targetEmail?: string | null;
  grantType: AdminRewardGrantType;
  amount?: number;
  reason: string;
  idempotencyKey?: string;
  now?: string;
};

export type AdminRewardGrantResult =
  | {
      ok: true;
      applied: boolean;
      code: "applied" | "duplicate" | "target_not_found" | "invalid_amount" | "missing_reason" | "shared_sync_failed";
      message: string;
      auditId?: string;
      targetUserId: string;
      targetEmail?: string | null;
      grantType: AdminRewardGrantType;
      amount: number;
      before: {
        points: number;
        fragments: number;
        tokens: number;
      };
      after: {
        points: number;
        fragments: number;
        tokens: number;
      };
      repertoire?: UserRepertoire | null;
      rewardHistory?: UserRewardHistory | null;
    }
  | {
      ok: false;
      code: string;
      message: string;
    };

function buildBeforeAfter(
  grantType: AdminRewardGrantType,
  amount: number,
  repertoire: UserRepertoire | null,
  rewardHistory: UserRewardHistory | null,
) {
  const points = Math.max(0, Number(repertoire?.openingUnlockPoints) || 0);
  const fragments = Math.max(0, Number(rewardHistory?.openingFragments) || 0);
  const tokens = Math.max(0, Number(rewardHistory?.choiceTokens) || 0);
  if (grantType === "repertoire_points" || grantType === "epic_bonus") {
    return {
      before: { points, fragments, tokens },
      after: { points: points + amount, fragments, tokens },
    };
  }
  if (grantType === "opening_fragment") {
    return {
      before: { points, fragments, tokens },
      after: { points, fragments: fragments + amount, tokens },
    };
  }
  return {
    before: { points, fragments, tokens },
    after: { points, fragments, tokens: tokens + amount },
  };
}

export async function grantAdminReward(input: AdminRewardGrantInput): Promise<AdminRewardGrantResult> {
  const targetUserId = normalizeText(input.targetUserId);
  const reason = normalizeText(input.reason);
  const amount = input.grantType === "epic_bonus" ? 100 : normalizeAmount(input.amount, input.grantType === "repertoire_points" ? 10 : 1);
  if (!targetUserId) {
    return { ok: false, code: "missing_target", message: "A target user id is required." };
  }
  if (!reason) {
    return { ok: false, code: "missing_reason", message: "A reason is required." };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, code: "invalid_amount", message: "Grant amount must be greater than zero." };
  }

  const admin = input.adminUser;
  const context = adminContext(admin);
  const now = normalizeText(input.now) || nowIso();
  const idempotencyKey = normalizeText(input.idempotencyKey) || buildEventId([admin.userId, targetUserId, input.grantType, reason, now]);
  const auditId = buildEventId(["admin-manual-reward", admin.userId, targetUserId, input.grantType, idempotencyKey]);
  const adapter = getAccountPersistenceAdapter(context);

  const profileResult = await readTrainingProfile(targetUserId, context);
  if (isPersistenceFailure(profileResult)) {
    return { ok: false, code: profileResult.error.code, message: profileResult.error.message };
  }
  if (!profileResult.data) {
    return { ok: false, code: "target_not_found", message: "Target user profile was not found." };
  }

  const repertoireResult = await readUserRepertoire(targetUserId, context);
  if (isPersistenceFailure(repertoireResult)) {
    return { ok: false, code: repertoireResult.error.code, message: repertoireResult.error.message };
  }
  const repertoire = repertoireResult.data ?? buildInitialRepertoireFromStarterPack({
    userId: targetUserId,
    starterPackId: profileResult.data.selectedStarterPackId ?? undefined,
    now,
  });

  const rewardHistoryResult = await readRewardHistory(targetUserId, context);
  if (isPersistenceFailure(rewardHistoryResult)) {
    return { ok: false, code: rewardHistoryResult.error.code, message: rewardHistoryResult.error.message };
  }
  const rewardHistory = rewardHistoryResult.data ?? createDefaultRewardHistory(targetUserId, now);

  const { before, after } = buildBeforeAfter(input.grantType, amount, repertoire, rewardHistory);

  if (input.grantType === "repertoire_points" || input.grantType === "epic_bonus") {
    const eventId = auditId;
    const existingEvents = await adapter.getRepertoirePointEvents(targetUserId);
    if (isPersistenceFailure(existingEvents)) {
      return { ok: false, code: existingEvents.error.code, message: existingEvents.error.message };
    }
    if (existingEvents.data.some((event) => event.id === eventId)) {
      return {
        ok: true,
        applied: false,
        code: "duplicate",
        message: "That point grant was already applied.",
        auditId,
        targetUserId,
        targetEmail: input.targetEmail ?? null,
        grantType: input.grantType,
        amount,
        before,
        after: before,
        repertoire,
        rewardHistory,
      };
    }

    const nextRepertoire: UserRepertoire = {
      ...repertoire,
      userId: targetUserId,
      openingUnlockPoints: after.points,
      updatedAt: now,
    };
    const pointEvent = createRepertoirePointEvent({
      userId: targetUserId,
      source: "manual_dev_adjustment",
      points: amount,
      id: eventId,
      createdAt: now,
    });

    const savedRepertoire = await saveUserRepertoire(nextRepertoire, context);
    if (isPersistenceFailure(savedRepertoire)) {
      return { ok: false, code: savedRepertoire.error.code, message: savedRepertoire.error.message };
    }
    const savedEvent = await adapter.appendRepertoirePointEvent(pointEvent);
    if (isPersistenceFailure(savedEvent)) {
      return { ok: false, code: savedEvent.error.code, message: savedEvent.error.message };
    }

    const audit = await appendDeveloperAuditLogEntry(
      {
        id: auditId,
        actorUserId: admin.userId,
        targetUserId,
        action: "admin_reward_grant",
        payload: {
          grantType: input.grantType,
          amount,
          reason,
          before,
          after,
          targetEmail: input.targetEmail ?? null,
          source: "admin_manual_grant",
        },
        createdAt: now,
      },
      context,
    );

    return {
      ok: true,
      applied: true,
      code: "applied",
      message: `${amount} Repertoire Point${amount === 1 ? "" : "s"} granted.`,
      auditId: audit.ok ? audit.data.id : auditId,
      targetUserId,
      targetEmail: input.targetEmail ?? null,
      grantType: input.grantType,
      amount,
      before,
      after,
      repertoire: savedRepertoire.data,
      rewardHistory,
    };
  }

  const eventId = auditId;
  const appliedEventIds = new Set(rewardHistory.rewardInventoryAppliedEventIds ?? []);
  if (appliedEventIds.has(eventId)) {
    return {
      ok: true,
      applied: false,
      code: "duplicate",
      message: "That reward inventory grant was already applied.",
      auditId,
      targetUserId,
      targetEmail: input.targetEmail ?? null,
      grantType: input.grantType,
      amount,
      before,
      after: before,
      rewardHistory,
      repertoire,
    };
  }

  const nextRewardHistory: UserRewardHistory = {
    ...rewardHistory,
    userId: targetUserId,
    openingFragments: after.fragments,
    choiceTokens: after.tokens,
    rewardInventoryAppliedEventIds: Array.from(new Set([...(rewardHistory.rewardInventoryAppliedEventIds ?? []), eventId])),
    updatedAt: now,
  };
  const savedHistory = await saveRewardHistory(nextRewardHistory, context);
  if (isPersistenceFailure(savedHistory)) {
    return { ok: false, code: savedHistory.error.code, message: savedHistory.error.message };
  }

  const audit = await appendDeveloperAuditLogEntry(
    {
      id: auditId,
      actorUserId: admin.userId,
      targetUserId,
      action: "admin_reward_grant",
      payload: {
        grantType: input.grantType,
        amount,
        reason,
        before,
        after,
        targetEmail: input.targetEmail ?? null,
        source: "admin_manual_grant",
      },
      createdAt: now,
    },
    context,
  );

  return {
    ok: true,
    applied: true,
    code: "applied",
    message:
      input.grantType === "opening_fragment"
        ? `${amount} Opening Fragment${amount === 1 ? "" : "s"} granted.`
        : `${amount} Choice Token${amount === 1 ? "" : "s"} granted.`,
    auditId: audit.ok ? audit.data.id : auditId,
    targetUserId,
    targetEmail: input.targetEmail ?? null,
    grantType: input.grantType,
    amount,
    before,
    after,
    rewardHistory: savedHistory.data,
    repertoire,
  };
}
