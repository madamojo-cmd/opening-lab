import { createDefaultRewardHistory } from "../accounts/accountDefaults";
import { appendLocalRewardInventoryEvent, getLocalRewardHistory, getLocalRewardInventory, upsertLocalRewardHistory, upsertLocalRewardInventory } from "../accounts/localAccountStorage";
import { readBlundrBackendEnv } from "../backend/backendEnv";
import { getOnboardingAuthSession, isBlundrWriteUserResolutionFailure, resolveWriteUserForMode } from "../accounts/accountSession";
import { loadRepertoireProgress, saveRepertoireProgress, syncRepertoireProgressToAccount } from "../repertoire/repertoireProgressService";
import { getEligibleRepertoireOpeningIds } from "../repertoire/repertoireOpeningPool";
import { unlockOpeningWithoutSpendingPoints } from "../repertoire/repertoireUnlockService";
import type { RepertoireProgress } from "../repertoire/repertoireTypes";
import { loadRewardHistorySnapshot, syncRewardStateToAccount } from "./rewardHistoryService";
import type { RewardInventoryEvent, RewardInventorySnapshot, RewardInventoryView } from "./rewardInventoryTypes";
import { buildRewardInventoryView, createDefaultRewardInventory, trimRewardInventoryEvents } from "./rewardInventoryTypes";

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

function buildEventId(parts: readonly string[]): string {
  return parts.map((part) => normalizeText(part) || "unknown").join(":");
}

type ActiveRewardUserResolution =
  | {
      ok: true;
      userId: string;
    }
  | {
      ok: false;
      code: "auth_required";
      message: string;
    };

function isActiveRewardUserResolutionFailure(result: ActiveRewardUserResolution): result is Extract<ActiveRewardUserResolution, { ok: false }> {
  return result.ok === false;
}

function getInventorySnapshot(userId: string): RewardInventorySnapshot {
  const history = getLocalRewardHistory(userId);
  const inventory = getLocalRewardInventory(userId) ?? createDefaultRewardInventory(userId);
  if (!history) {
    return inventory;
  }
  return {
    ...inventory,
    userId: history.userId,
    openingFragments: Math.max(0, Number(history.openingFragments) || 0),
    choiceTokens: Math.max(0, Number(history.choiceTokens) || 0),
    appliedEventIds: Array.from(new Set([...(inventory.appliedEventIds ?? []), ...(history.rewardInventoryAppliedEventIds ?? [])])),
    updatedAt: history.updatedAt || inventory.updatedAt,
  };
}

function appendEvent(snapshot: RewardInventorySnapshot, event: RewardInventoryEvent): RewardInventoryView {
  const next = {
    ...snapshot,
    appliedEventIds: Array.from(new Set([...(snapshot.appliedEventIds ?? []), event.id])),
    events: trimRewardInventoryEvents([...(snapshot.events ?? []).filter((entry) => entry.id !== event.id), event], 100),
    openingFragments: Math.max(0, Math.floor(event.after.openingFragments)),
    choiceTokens: Math.max(0, Math.floor(event.after.choiceTokens)),
    updatedAt: event.createdAt,
  };
  appendLocalRewardInventoryEvent(event);
  return buildRewardInventoryView(next);
}

function resultFromSnapshot(snapshot: RewardInventorySnapshot): RewardInventoryView {
  return buildRewardInventoryView(snapshot);
}

function buildHistorySnapshotFromInventory(snapshot: RewardInventorySnapshot) {
  const history = getLocalRewardHistory(snapshot.userId) ?? {
    ...createDefaultRewardHistory(snapshot.userId, snapshot.updatedAt),
  };
  return {
    ...history,
    userId: snapshot.userId,
    openingFragments: Math.max(0, Math.floor(Number(snapshot.openingFragments) || 0)),
    choiceTokens: Math.max(0, Math.floor(Number(snapshot.choiceTokens) || 0)),
    rewardInventoryAppliedEventIds: Array.from(new Set(snapshot.appliedEventIds ?? [])),
    updatedAt: snapshot.updatedAt,
  };
}

async function shouldSyncRemoteInventory(syncRemote: boolean | undefined): Promise<boolean> {
  if (syncRemote !== undefined) return syncRemote;
  const env = readBlundrBackendEnv();
  if (env.storageModeSetting === "local_demo") return false;
  const session = await getOnboardingAuthSession().catch(() => null);
  return Boolean(session?.accessToken);
}

async function resolveActiveRewardUserId(inputUserId?: string | null): Promise<ActiveRewardUserResolution> {
  const env = readBlundrBackendEnv();
  const resolved = await resolveWriteUserForMode({
    requestedUserId: inputUserId,
    storageModeSetting: env.storageModeSetting,
  });
  if (isBlundrWriteUserResolutionFailure(resolved)) {
    return {
      ok: false,
      code: resolved.code,
      message: resolved.message,
    };
  }
  return {
    ok: true,
    userId: resolved.userId,
  };
}

function createEvent(input: {
  id: string;
  kind: RewardInventoryEvent["kind"];
  userId: string;
  quantity: number;
  before: { openingFragments: number; choiceTokens: number };
  after: { openingFragments: number; choiceTokens: number };
  result: RewardInventoryEvent["result"];
  sourceEventId?: string;
  openingId?: string;
  message?: string;
  createdAt?: string;
}): RewardInventoryEvent {
  return {
    id: normalizeText(input.id),
    kind: input.kind,
    userId: normalizeText(input.userId),
    sourceEventId: normalizeText(input.sourceEventId) || undefined,
    openingId: normalizeText(input.openingId) || undefined,
    quantity: Math.max(0, Math.floor(Number(input.quantity) || 0)),
    before: {
      openingFragments: Math.max(0, Math.floor(Number(input.before.openingFragments) || 0)),
      choiceTokens: Math.max(0, Math.floor(Number(input.before.choiceTokens) || 0)),
    },
    after: {
      openingFragments: Math.max(0, Math.floor(Number(input.after.openingFragments) || 0)),
      choiceTokens: Math.max(0, Math.floor(Number(input.after.choiceTokens) || 0)),
    },
    result: input.result,
    message: normalizeText(input.message) || undefined,
    createdAt: normalizeText(input.createdAt) || nowIso(),
  };
}

function buildDuplicateResult(snapshot: RewardInventorySnapshot, message: string, eventId: string): { inventory: RewardInventoryView; event?: RewardInventoryEvent } {
  return {
    inventory: resultFromSnapshot(snapshot),
    event: snapshot.events.find((entry) => entry.id === eventId),
  };
}

function updateInventory(
  snapshot: RewardInventorySnapshot,
  event: RewardInventoryEvent,
): RewardInventoryView {
  return appendEvent(snapshot, event);
}

function getExistingEvent(snapshot: RewardInventorySnapshot, eventId: string): RewardInventoryEvent | null {
  return snapshot.events.find((entry) => entry.id === eventId) ?? null;
}

export type RewardInventoryGrantInput = {
  userId: string;
  amount?: number;
  sourceEventId: string;
  now?: string;
  syncRemote?: boolean;
};

export type RewardInventorySpendInput = {
  userId: string;
  openingId: string;
  sourceEventId: string;
  now?: string;
  syncRemote?: boolean;
};

export type RewardInventoryActionResult = {
  ok: true;
  applied: boolean;
  code:
    | "applied"
    | "duplicate"
    | "noop"
    | "insufficient_fragments"
    | "insufficient_choice_tokens"
    | "no_locked_openings"
    | "opening_not_found"
    | "opening_not_locked"
    | "opening_already_unlocked"
    | "shared_sync_failed";
  message: string;
  inventory: RewardInventoryView;
  progress?: RepertoireProgress;
  event?: RewardInventoryEvent;
  unlockedOpeningId?: string;
} | {
  ok: false;
  applied: false;
  code: "auth_required" | "shared_sync_failed";
  message: string;
  inventory?: RewardInventoryView;
  progress?: RepertoireProgress;
  event?: RewardInventoryEvent;
  unlockedOpeningId?: string;
};

function buildGrantEventId(kind: "opening_fragment_grant" | "choice_token_grant", userId: string, sourceEventId: string): string {
  return kind === "opening_fragment_grant"
    ? buildEventId(["reward-fragment-grant", userId, sourceEventId])
    : buildEventId(["reward-choice-token-grant", userId, sourceEventId]);
}

function buildSpendEventId(kind: "opening_fragment_spend" | "choice_token_spend", userId: string, openingId: string, sourceEventId: string): string {
  return kind === "opening_fragment_spend"
    ? buildEventId(["reward-fragment-spend", userId, openingId, sourceEventId])
    : buildEventId(["reward-choice-token-spend", userId, openingId, sourceEventId]);
}

function buildInventoryResetEventId(userId: string, sourceEventId: string): string {
  return buildEventId(["reward-inventory-reset", userId, sourceEventId]);
}

async function applyGrant(
  kind: "opening_fragment_grant" | "choice_token_grant",
  input: RewardInventoryGrantInput,
): Promise<RewardInventoryActionResult> {
  const userResolution = await resolveActiveRewardUserId(input.userId);
  if (isActiveRewardUserResolutionFailure(userResolution)) {
    return {
      ok: false,
      applied: false,
      code: userResolution.code,
      message: userResolution.message,
    };
  }
  const userId = userResolution.userId;
  const sourceEventId = normalizeText(input.sourceEventId) || `${userId}:${kind}:${nowIso()}`;
  const amount = normalizeAmount(input.amount, 1);
  const eventId = buildGrantEventId(kind, userId, sourceEventId);
  const snapshot = getInventorySnapshot(userId);
  const existingEvent = getExistingEvent(snapshot, eventId);
  if (existingEvent) {
    return {
      ok: true,
      applied: false,
      code: "duplicate",
      message: "That reward inventory grant was already applied.",
      inventory: resultFromSnapshot(snapshot),
      event: existingEvent,
      progress: loadRepertoireProgress({ userId }),
    };
  }

  const before = {
    openingFragments: snapshot.openingFragments,
    choiceTokens: snapshot.choiceTokens,
  };
  const after =
    kind === "opening_fragment_grant"
      ? {
          openingFragments: before.openingFragments + amount,
          choiceTokens: before.choiceTokens,
        }
      : {
          openingFragments: before.openingFragments,
          choiceTokens: before.choiceTokens + amount,
        };
  const event = createEvent({
    id: eventId,
    kind,
    userId,
    quantity: amount,
    before,
    after,
    result: "applied",
    sourceEventId,
    message:
      kind === "opening_fragment_grant"
        ? `${amount} opening fragment${amount === 1 ? "" : "s"} granted.`
        : `${amount} choice token${amount === 1 ? "" : "s"} granted.`,
    createdAt: normalizeText(input.now) || nowIso(),
  });
  const nextInventory = {
    ...snapshot,
    appliedEventIds: Array.from(new Set([...(snapshot.appliedEventIds ?? []), event.id])),
    events: trimRewardInventoryEvents([...(snapshot.events ?? []).filter((entry) => entry.id !== event.id), event], 100),
    openingFragments: Math.max(0, Math.floor(after.openingFragments)),
    choiceTokens: Math.max(0, Math.floor(after.choiceTokens)),
    updatedAt: event.createdAt,
  };
  const nextHistory = buildHistorySnapshotFromInventory(nextInventory);
  const shouldSyncRemote = await shouldSyncRemoteInventory(input.syncRemote);
  if (shouldSyncRemote) {
    const rewardRolls = loadRewardHistorySnapshot(userId).rewardRolls;
    const remoteSynced = await syncRewardStateToAccount(userId, {
      history: nextHistory,
      rewardRolls,
    });
    if (!remoteSynced) {
      return {
        ok: true,
        applied: false,
        code: "shared_sync_failed",
        message: "Shared reward persistence failed.",
        inventory: resultFromSnapshot(snapshot),
        event,
        progress: loadRepertoireProgress({ userId }),
      };
    }
  }
  upsertLocalRewardHistory(nextHistory);
  upsertLocalRewardInventory(nextInventory);
  return {
    ok: true,
    applied: true,
    code: "applied",
    message: event.message ?? "Inventory updated.",
    inventory: buildRewardInventoryView(nextInventory),
    event,
  };
}

async function applySpend(
  kind: "opening_fragment_spend" | "choice_token_spend",
  input: RewardInventorySpendInput,
): Promise<RewardInventoryActionResult> {
  const userResolution = await resolveActiveRewardUserId(input.userId);
  if (isActiveRewardUserResolutionFailure(userResolution)) {
    return {
      ok: false,
      applied: false,
      code: userResolution.code,
      message: userResolution.message,
    };
  }
  const userId = userResolution.userId;
  const openingId = normalizeText(input.openingId);
  const sourceEventId = normalizeText(input.sourceEventId) || `${userId}:${openingId}:${kind}:${nowIso()}`;
  const eventId = buildSpendEventId(kind, userId, openingId, sourceEventId);
  const snapshot = getInventorySnapshot(userId);
  const currentProgress = loadRepertoireProgress({ userId });
  const existingEvent = getExistingEvent(snapshot, eventId);
  if (existingEvent) {
    return {
      ok: true,
      applied: false,
      code: "duplicate",
      message: "That unlock spend was already applied.",
      inventory: resultFromSnapshot(snapshot),
      event: existingEvent,
      unlockedOpeningId: existingEvent.openingId,
      progress: currentProgress,
    };
  }

  const lockedOpeningIds = currentProgress.lockedOpeningIds;
  if (lockedOpeningIds.length === 0) {
    const event = createEvent({
      id: eventId,
      kind,
      userId,
      quantity: 0,
      before: { openingFragments: snapshot.openingFragments, choiceTokens: snapshot.choiceTokens },
      after: { openingFragments: snapshot.openingFragments, choiceTokens: snapshot.choiceTokens },
      result: "noop",
      sourceEventId,
      openingId,
      message: "No locked openings remain.",
      createdAt: normalizeText(input.now) || nowIso(),
    });
    const inventory = updateInventory(snapshot, event);
    return {
      ok: true,
      applied: false,
      code: "no_locked_openings",
      message: event.message ?? "No locked openings remain.",
      inventory,
      event,
      progress: currentProgress,
    };
  }

  if (!lockedOpeningIds.includes(openingId)) {
    const message = snapshot.openingFragments === 0 && kind === "opening_fragment_spend"
      ? "You need 3 opening fragments before choosing a locked opening."
      : kind === "choice_token_spend" && snapshot.choiceTokens === 0
        ? "You need a choice token before choosing a locked opening."
        : "That opening is already unlocked or not eligible.";
    const event = createEvent({
      id: eventId,
      kind,
      userId,
      quantity: 0,
      before: { openingFragments: snapshot.openingFragments, choiceTokens: snapshot.choiceTokens },
      after: { openingFragments: snapshot.openingFragments, choiceTokens: snapshot.choiceTokens },
      result: "rejected",
      sourceEventId,
      openingId,
      message,
      createdAt: normalizeText(input.now) || nowIso(),
    });
    const inventory = updateInventory(snapshot, event);
    return {
      ok: true,
      applied: false,
      code: snapshot.openingFragments === 0 && kind === "opening_fragment_spend"
        ? "insufficient_fragments"
        : snapshot.choiceTokens === 0 && kind === "choice_token_spend"
          ? "insufficient_choice_tokens"
          : "opening_not_locked",
      message,
      inventory,
      event,
      progress: currentProgress,
    };
  }

  if (kind === "opening_fragment_spend" && snapshot.openingFragments < 3) {
    const event = createEvent({
      id: eventId,
      kind,
      userId,
      quantity: 0,
      before: { openingFragments: snapshot.openingFragments, choiceTokens: snapshot.choiceTokens },
      after: { openingFragments: snapshot.openingFragments, choiceTokens: snapshot.choiceTokens },
      result: "rejected",
      sourceEventId,
      openingId,
      message: "You need 3 opening fragments to unlock an opening.",
      createdAt: normalizeText(input.now) || nowIso(),
    });
    const inventory = updateInventory(snapshot, event);
    return {
      ok: true,
      applied: false,
      code: "insufficient_fragments",
      message: event.message ?? "You need 3 opening fragments to unlock an opening.",
      inventory,
      event,
      progress: currentProgress,
    };
  }

  if (kind === "choice_token_spend" && snapshot.choiceTokens < 1) {
    const event = createEvent({
      id: eventId,
      kind,
      userId,
      quantity: 0,
      before: { openingFragments: snapshot.openingFragments, choiceTokens: snapshot.choiceTokens },
      after: { openingFragments: snapshot.openingFragments, choiceTokens: snapshot.choiceTokens },
      result: "rejected",
      sourceEventId,
      openingId,
      message: "You need a choice token to unlock an opening.",
      createdAt: normalizeText(input.now) || nowIso(),
    });
    const inventory = updateInventory(snapshot, event);
    return {
      ok: true,
      applied: false,
      code: "insufficient_choice_tokens",
      message: event.message ?? "You need a choice token to unlock an opening.",
      inventory,
      event,
      progress: currentProgress,
    };
  }

  const unlockResult = unlockOpeningWithoutSpendingPoints(currentProgress, openingId, { sourceEventId });
  if (unlockResult.ok === false) {
    const event = createEvent({
      id: eventId,
      kind,
      userId,
      quantity: 0,
      before: { openingFragments: snapshot.openingFragments, choiceTokens: snapshot.choiceTokens },
      after: { openingFragments: snapshot.openingFragments, choiceTokens: snapshot.choiceTokens },
      result: "rejected",
      sourceEventId,
      openingId,
      message: unlockResult.message,
      createdAt: normalizeText(input.now) || nowIso(),
    });
    const inventory = updateInventory(snapshot, event);
    return {
      ok: true,
      applied: false,
      code: unlockResult.code === "opening_not_found" ? "opening_not_found" : "opening_not_locked",
      message: unlockResult.message,
      inventory,
      event,
      progress: currentProgress,
    };
  }

  const spentFragments = kind === "opening_fragment_spend" ? 3 : 0;
  const spentTokens = kind === "choice_token_spend" ? 1 : 0;
  const before = { openingFragments: snapshot.openingFragments, choiceTokens: snapshot.choiceTokens };
  const after = {
    openingFragments: Math.max(0, before.openingFragments - spentFragments),
    choiceTokens: Math.max(0, before.choiceTokens - spentTokens),
  };
  const event = createEvent({
    id: eventId,
    kind,
    userId,
    quantity: kind === "opening_fragment_spend" ? 3 : 1,
    before,
    after,
    result: "applied",
    sourceEventId,
    openingId,
    message:
      kind === "opening_fragment_spend"
        ? `Spent 3 opening fragments to unlock ${openingId}.`
        : `Spent 1 choice token to unlock ${openingId}.`,
    createdAt: normalizeText(input.now) || nowIso(),
  });
  const nextInventory = {
    ...snapshot,
    appliedEventIds: Array.from(new Set([...(snapshot.appliedEventIds ?? []), event.id])),
    events: trimRewardInventoryEvents([...(snapshot.events ?? []).filter((entry) => entry.id !== event.id), event], 100),
    openingFragments: Math.max(0, Math.floor(after.openingFragments)),
    choiceTokens: Math.max(0, Math.floor(after.choiceTokens)),
    updatedAt: event.createdAt,
  };
  const nextHistory = buildHistorySnapshotFromInventory(nextInventory);
  const shouldSyncRemote = await shouldSyncRemoteInventory(input.syncRemote);
  if (shouldSyncRemote) {
    const rewardRolls = loadRewardHistorySnapshot(userId).rewardRolls;
    const rewardSynced = await syncRewardStateToAccount(userId, {
      history: nextHistory,
      rewardRolls,
    });
    if (!rewardSynced) {
      return {
        ok: true,
        applied: false,
        code: "shared_sync_failed",
        message: "Shared reward persistence failed.",
        inventory: resultFromSnapshot(snapshot),
        event,
        progress: currentProgress,
      };
    }
    const repertoireSynced = await syncRepertoireProgressToAccount(unlockResult.progress);
    if (!repertoireSynced) {
      await syncRewardStateToAccount(userId, {
        history: buildHistorySnapshotFromInventory(snapshot),
        rewardRolls,
      }).catch(() => undefined);
      return {
        ok: true,
        applied: false,
        code: "shared_sync_failed",
        message: "Shared repertoire unlock failed.",
        inventory: resultFromSnapshot(snapshot),
        event,
        progress: currentProgress,
      };
    }
  }
  upsertLocalRewardHistory(nextHistory);
  upsertLocalRewardInventory(nextInventory);
  await saveRepertoireProgress(unlockResult.progress, { syncRemote: false });
  return {
    ok: true,
    applied: true,
    code: "applied",
    message: event.message ?? "Opening unlocked.",
    inventory: buildRewardInventoryView(nextInventory),
    event,
    unlockedOpeningId: openingId,
    progress: unlockResult.progress,
  };
}

export function getRewardInventory(userId: string): RewardInventoryView {
  return buildRewardInventoryView(getInventorySnapshot(userId));
}

export function getRewardInventoryEventLog(userId: string): RewardInventoryEvent[] {
  return getRewardInventory(userId).events;
}

export function getEligibleLockedOpeningsForFragmentUnlock(input: { userId: string; allOpeningIds?: readonly string[] } = { userId: "" }): string[] {
  const progress = loadRepertoireProgress({
    userId: normalizeText(input.userId),
    allOpeningIds: input.allOpeningIds ?? getEligibleRepertoireOpeningIds(),
  });
  return progress.lockedOpeningIds.slice();
}

export function getEligibleLockedOpeningsForChoiceToken(input: { userId: string; allOpeningIds?: readonly string[] } = { userId: "" }): string[] {
  return getEligibleLockedOpeningsForFragmentUnlock(input);
}

export async function grantOpeningFragments(input: RewardInventoryGrantInput): Promise<RewardInventoryActionResult> {
  return applyGrant("opening_fragment_grant", input);
}

export async function grantChoiceTokens(input: RewardInventoryGrantInput): Promise<RewardInventoryActionResult> {
  return applyGrant("choice_token_grant", input);
}

export async function spendOpeningFragmentsOnOpening(input: RewardInventorySpendInput): Promise<RewardInventoryActionResult> {
  return applySpend("opening_fragment_spend", input);
}

export async function spendChoiceTokenOnOpening(input: RewardInventorySpendInput): Promise<RewardInventoryActionResult> {
  return applySpend("choice_token_spend", input);
}

export async function resetOpeningFragmentsForDev(input: { userId: string; sourceEventId: string; now?: string; syncRemote?: boolean }): Promise<RewardInventoryActionResult> {
  const userResolution = await resolveActiveRewardUserId(input.userId);
  if (isActiveRewardUserResolutionFailure(userResolution)) {
    return {
      ok: false,
      applied: false,
      code: userResolution.code,
      message: userResolution.message,
    };
  }
  const userId = userResolution.userId;
  const snapshot = getInventorySnapshot(userId);
  const eventId = buildInventoryResetEventId(userId, normalizeText(input.sourceEventId) || `${userId}:reset-fragments`);
  const event = createEvent({
    id: eventId,
    kind: "inventory_reset",
    userId,
    quantity: 0,
    before: { openingFragments: snapshot.openingFragments, choiceTokens: snapshot.choiceTokens },
    after: { openingFragments: 0, choiceTokens: snapshot.choiceTokens },
    result: "applied",
    sourceEventId: input.sourceEventId,
    message: "Opening fragments reset for dev QA.",
    createdAt: normalizeText(input.now) || nowIso(),
  });
  const nextInventory = {
    ...snapshot,
    appliedEventIds: Array.from(new Set([...(snapshot.appliedEventIds ?? []), event.id])),
    events: trimRewardInventoryEvents([...(snapshot.events ?? []).filter((entry) => entry.id !== event.id), event], 100),
    openingFragments: 0,
    choiceTokens: snapshot.choiceTokens,
    updatedAt: event.createdAt,
  };
  const nextHistory = buildHistorySnapshotFromInventory(nextInventory);
  if (await shouldSyncRemoteInventory(input.syncRemote)) {
    const rewardRolls = loadRewardHistorySnapshot(userId).rewardRolls;
    const synced = await syncRewardStateToAccount(userId, { history: nextHistory, rewardRolls });
    if (!synced) {
      return {
        ok: true,
        applied: false,
        code: "shared_sync_failed",
        message: "Shared reward persistence failed.",
        inventory: resultFromSnapshot(snapshot),
        event,
      };
    }
  }
  upsertLocalRewardHistory(nextHistory);
  upsertLocalRewardInventory(nextInventory);
  return {
    ok: true,
    applied: true,
    code: "applied",
    message: event.message ?? "Opening fragments reset.",
    inventory: buildRewardInventoryView(nextInventory),
    event,
  };
}

export async function resetChoiceTokensForDev(input: { userId: string; sourceEventId: string; now?: string; syncRemote?: boolean }): Promise<RewardInventoryActionResult> {
  const userResolution = await resolveActiveRewardUserId(input.userId);
  if (isActiveRewardUserResolutionFailure(userResolution)) {
    return {
      ok: false,
      applied: false,
      code: userResolution.code,
      message: userResolution.message,
    };
  }
  const userId = userResolution.userId;
  const snapshot = getInventorySnapshot(userId);
  const eventId = buildInventoryResetEventId(userId, normalizeText(input.sourceEventId) || `${userId}:reset-choice-tokens`);
  const event = createEvent({
    id: eventId,
    kind: "inventory_reset",
    userId,
    quantity: 0,
    before: { openingFragments: snapshot.openingFragments, choiceTokens: snapshot.choiceTokens },
    after: { openingFragments: snapshot.openingFragments, choiceTokens: 0 },
    result: "applied",
    sourceEventId: input.sourceEventId,
    message: "Choice tokens reset for dev QA.",
    createdAt: normalizeText(input.now) || nowIso(),
  });
  const nextInventory = {
    ...snapshot,
    appliedEventIds: Array.from(new Set([...(snapshot.appliedEventIds ?? []), event.id])),
    events: trimRewardInventoryEvents([...(snapshot.events ?? []).filter((entry) => entry.id !== event.id), event], 100),
    openingFragments: snapshot.openingFragments,
    choiceTokens: 0,
    updatedAt: event.createdAt,
  };
  const nextHistory = buildHistorySnapshotFromInventory(nextInventory);
  if (await shouldSyncRemoteInventory(input.syncRemote)) {
    const rewardRolls = loadRewardHistorySnapshot(userId).rewardRolls;
    const synced = await syncRewardStateToAccount(userId, { history: nextHistory, rewardRolls });
    if (!synced) {
      return {
        ok: true,
        applied: false,
        code: "shared_sync_failed",
        message: "Shared reward persistence failed.",
        inventory: resultFromSnapshot(snapshot),
        event,
      };
    }
  }
  upsertLocalRewardHistory(nextHistory);
  upsertLocalRewardInventory(nextInventory);
  return {
    ok: true,
    applied: true,
    code: "applied",
    message: event.message ?? "Choice tokens reset.",
    inventory: buildRewardInventoryView(nextInventory),
    event,
  };
}

export async function resetRewardInventoryForDev(input: { userId: string; sourceEventId: string; now?: string; syncRemote?: boolean }): Promise<RewardInventoryActionResult> {
  const userResolution = await resolveActiveRewardUserId(input.userId);
  if (isActiveRewardUserResolutionFailure(userResolution)) {
    return {
      ok: false,
      applied: false,
      code: userResolution.code,
      message: userResolution.message,
    };
  }
  const userId = userResolution.userId;
  const snapshot = getInventorySnapshot(userId);
  const eventId = buildInventoryResetEventId(userId, normalizeText(input.sourceEventId) || `${userId}:reset-inventory`);
  const event = createEvent({
    id: eventId,
    kind: "inventory_reset",
    userId,
    quantity: 0,
    before: { openingFragments: snapshot.openingFragments, choiceTokens: snapshot.choiceTokens },
    after: { openingFragments: 0, choiceTokens: 0 },
    result: "applied",
    sourceEventId: input.sourceEventId,
    message: "Reward inventory reset for dev QA.",
    createdAt: normalizeText(input.now) || nowIso(),
  });
  const nextInventory = {
    ...snapshot,
    appliedEventIds: Array.from(new Set([...(snapshot.appliedEventIds ?? []), event.id])),
    events: trimRewardInventoryEvents([...(snapshot.events ?? []).filter((entry) => entry.id !== event.id), event], 100),
    openingFragments: 0,
    choiceTokens: 0,
    updatedAt: event.createdAt,
  };
  const nextHistory = buildHistorySnapshotFromInventory(nextInventory);
  if (await shouldSyncRemoteInventory(input.syncRemote)) {
    const rewardRolls = loadRewardHistorySnapshot(userId).rewardRolls;
    const synced = await syncRewardStateToAccount(userId, { history: nextHistory, rewardRolls });
    if (!synced) {
      return {
        ok: true,
        applied: false,
        code: "shared_sync_failed",
        message: "Shared reward persistence failed.",
        inventory: resultFromSnapshot(snapshot),
        event,
      };
    }
  }
  upsertLocalRewardHistory(nextHistory);
  upsertLocalRewardInventory(nextInventory);
  return {
    ok: true,
    applied: true,
    code: "applied",
    message: event.message ?? "Reward inventory reset.",
    inventory: buildRewardInventoryView(nextInventory),
    event,
  };
}
