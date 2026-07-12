"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { BlundrButton, BlundrCard, BlundrChip, BlundrStateCard } from "@/components/blundr/ui";
import { recordBatteryLineCompleted, recordBlundrTaskCompleted, recordTempoRunCompleted, buildBatteryLineCompletionId, buildBlundrTaskCompletionId, buildTempoRunCompletionId } from "@/lib/blundr/daily-rings/dailyRingGameplayEvents";
import { loadDailyRingSnapshot } from "@/lib/blundr/daily-rings/dailyRingService";
import { getDailyBlundrDateKey } from "@/lib/blundr/daily/dailyBlundrStorage";
import { loadRepertoireProgress, earnAndPersistRepertoirePoints, unlockAndPersistOpening } from "@/lib/blundr/repertoire/repertoireProgressService";
import type { RepertoireOpeningCard } from "@/lib/blundr/repertoire/repertoireTypes";
import { getLocalLearningEvents, clearLocalLearningEvents, recordLearningEvent } from "@/lib/blundr/learning/learningEvents";
import { getLocalStreakRecord, getLocalTrainingProfile, resetLocalAccountState, resetLocalDailyRetentionProgress, resetLocalRewardHistory, resetLocalRewardRolls, resetLocalRepertoireState, resetLocalStreakRecord } from "@/lib/blundr/accounts/localAccountStorage";
import { hydrateSharedAccountBootstrap } from "@/lib/blundr/accounts/accountHydration";
import { grantChoiceTokens, grantOpeningFragments, getRewardInventory, getRewardInventoryEventLog, resetChoiceTokensForDev, resetOpeningFragmentsForDev, resetRewardInventoryForDev, spendChoiceTokenOnOpening, spendOpeningFragmentsOnOpening } from "@/lib/blundr/rewards/rewardInventoryService";
import { applyRewardGrant } from "@/lib/blundr/rewards/rewardGrantService";
import { adaptRewardGrantToPresentation, type RewardPresentationModel } from "@/lib/blundr/rewards/rewardPresentationAdapter";
import { loadRewardHistorySnapshot } from "@/lib/blundr/rewards/rewardHistoryService";
import { clearRewardPopupQueue, enqueueRewardPopup } from "@/lib/blundr/rewards/rewardPopupBus";
import type { TempoCacheState } from "@/lib/blundr/rewards/rewardTypes";
import type { RewardPopupEvent, RewardPopupRewardEvent, RewardPopupTempoCacheEvent } from "@/lib/blundr/rewards/rewardPopupTypes";
import type { RewardsPersistenceTarget } from "@/lib/blundr/rewards/rewardTargetModel";
import { isDailyRingCompletionFailure, isDailyRingCompletionSuccess, type DailyRingCompletionResultLike } from "@/lib/blundr/daily-rings/dailyRingTypes";
import { isRepertoirePersistenceFailure, isRepertoireUnlockFailure } from "@/lib/blundr/repertoire/repertoireProgressService";
import { RewardsTargetPanel } from "./RewardsTargetPanel";
import { RewardsAdminGrantPanel } from "./RewardsAdminGrantPanel";
import { RewardsResetPanel } from "./RewardsResetPanel";
import { RewardsEventLog } from "./RewardsEventLog";
import { RewardsValidationConsole } from "./RewardsValidationConsole";
import type { RewardsDebugSnapshot, RewardsEventLogEntry, RewardsPreviewKind } from "./rewardsDebugTypes";
import { comparePreviewState, type PreviewMutationResult } from "./rewardsValidationModel";

type RewardsDebugPanelProps = {
  userId: string;
  mode: string;
  email?: string | null;
  target: RewardsPersistenceTarget;
  className?: string;
};

function nowIso(): string {
  return new Date().toISOString();
}

function createIdempotencyKey(actionId: string, userId: string): string {
  const suffix = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return `${actionId}:${userId}:${suffix}`;
}

function popupVariantForRarity(rarity: string): "A" | "B" | "C" {
  if (rarity === "epic") return "C";
  if (rarity === "rare") return "B";
  return "A";
}

function buildRewardPopupFromPreview(input: {
  id: string;
  userId: string;
  preview: RewardsPreviewKind;
  snapshot: RewardsDebugSnapshot;
}): RewardPopupEvent | null {
  const { preview } = input;
  if (preview.kind === "reward") {
    return {
      id: createIdempotencyKey(`preview:${input.id}`, input.userId),
      kind: "reward_popup",
      preview: true,
      title: preview.title,
      description: preview.description,
      createdAt: nowIso(),
      variant: popupVariantForRarity(preview.rarity),
      rarity: preview.rarity,
      rewardType: preview.rewardType,
      amount: preview.amount,
    };
  }
  if (preview.kind === "tempo_cache") {
    return {
      id: createIdempotencyKey(`preview:${input.id}`, input.userId),
      kind: "tempo_cache",
      preview: true,
      title: preview.title,
      description: preview.description,
      createdAt: nowIso(),
      variant: preview.variant,
      state: preview.variant === "A" ? "opening" : preview.variant === "B" ? "revealed" : "closed",
      rewardGrants: [],
      rewardHistory: input.snapshot.rewardHistory,
    };
  }
  if (preview.kind === "streak") {
    return {
      id: createIdempotencyKey(`preview:${input.id}`, input.userId),
      kind: "streak",
      preview: true,
      title: preview.title,
      description: preview.description,
      createdAt: nowIso(),
      variant: preview.variant,
      currentStreakDays: preview.variant === "B" ? 7 : preview.variant === "A" ? Math.max(1, 1) : 0,
      longestStreakDays: preview.variant === "B" ? 14 : preview.variant === "A" ? 7 : 0,
    };
  }
  if (preview.kind === "opening_unlock") {
    const openingId = preview.openingId ?? "preview-opening-id";
    const openingName = openingId;
    const card = snapshotFallbackOpeningCard(openingId, openingName);
    return {
      id: createIdempotencyKey(`preview:${input.id}`, input.userId),
      kind: "opening_unlock",
      preview: true,
      title: preview.title,
      description: preview.description,
      createdAt: nowIso(),
      card,
      progress: input.snapshot.repertoire,
      inventory: input.snapshot.rewardInventory,
    };
  }
  if (preview.kind === "unlock_success") {
    return {
      id: createIdempotencyKey(`preview:${input.id}`, input.userId),
      kind: "unlock_success",
      preview: true,
      title: preview.title,
      description: preview.description,
      createdAt: nowIso(),
      openingId: preview.openingId,
      openingName: preview.openingName,
      methodLabel: preview.methodLabel,
      before: preview.before,
      after: preview.after,
    };
  }
  if (preview.kind === "failure") {
    return {
      id: createIdempotencyKey(`preview:${input.id}`, input.userId),
      kind: "failure",
      preview: true,
      title: preview.title,
      description: preview.message,
      createdAt: nowIso(),
      code: preview.code,
      message: preview.message,
    };
  }
  if (preview.kind === "admin_grant") {
    return {
      id: createIdempotencyKey(`preview:${input.id}`, input.userId),
      kind: "admin_grant",
      preview: true,
      title: preview.title,
      description: preview.description,
      createdAt: nowIso(),
      success: preview.success,
      targetUserId: preview.targetUserId,
      targetEmail: preview.targetEmail ?? null,
      grantType: preview.grantType,
      amount: preview.amount,
      reason: preview.reason,
      auditId: preview.auditId,
      beforeSummary: preview.beforeSummary,
      afterSummary: preview.afterSummary,
    };
  }
  return null;
}

function snapshotFallbackOpeningCard(openingId: string, openingName: string) {
  return {
    openingId,
    openingName,
    side: "white" as const,
    status: "locked" as const,
    pointsCost: 25,
    description: "Preview opening.",
  } as RepertoireOpeningCard;
}

function dispatchRewardSuccessPopup(input: {
  id: string;
  userId: string;
  title: string;
  description: string;
  rarity: "common" | "uncommon" | "rare" | "epic";
  rewardType: "unlock_points" | "opening_fragment" | "choice_token";
  amount: number;
  grant?: RewardPopupRewardEvent["grant"];
}) {
  const grant =
    input.grant ?? {
      id: createIdempotencyKey(`popup:${input.id}:grant`, input.userId),
      rewardId: createIdempotencyKey(`popup:${input.id}:reward`, input.userId),
      rewardRollId: createIdempotencyKey(`popup:${input.id}:roll`, input.userId),
      trigger: "weekly_cache" as const,
      triggerEventId: createIdempotencyKey(`popup:${input.id}:trigger`, input.userId),
      rarity: input.rarity,
      rewardType: input.rewardType,
      amount: input.amount,
      displayName: input.title,
      description: input.description,
      pointsApplied: input.rewardType === "unlock_points" ? input.amount : 0,
      applied: true,
      pendingChoice: input.rewardType === "choice_token",
      grantMode: "guaranteed_cache" as const,
      createdAt: nowIso(),
    };
  enqueueRewardPopup({
    id: createIdempotencyKey(`popup:${input.id}`, input.userId),
    kind: "reward_popup",
    preview: false,
    title: input.title,
    description: input.description,
    createdAt: nowIso(),
    variant: popupVariantForRarity(input.rarity),
    rarity: input.rarity,
    rewardType: input.rewardType,
    amount: input.amount,
    grant,
  });
}

function dispatchFailurePopup(input: {
  id: string;
  userId: string;
  title: string;
  code: string;
  message: string;
}) {
  enqueueRewardPopup({
    id: createIdempotencyKey(`popup:${input.id}`, input.userId),
    kind: "failure",
    preview: false,
    title: input.title,
    description: input.message,
    createdAt: nowIso(),
    code: input.code,
    message: input.message,
  });
}

function dispatchUnlockSuccessPopup(input: {
  id: string;
  userId: string;
  openingId: string;
  openingName: string;
  methodLabel: string;
  before: { points: number; fragments: number; tokens: number };
  after: { points: number; fragments: number; tokens: number };
}) {
  enqueueRewardPopup({
    id: createIdempotencyKey(`popup:${input.id}`, input.userId),
    kind: "unlock_success",
    preview: false,
    title: "Opening unlocked",
    description: `${input.methodLabel} unlocked ${input.openingName}.`,
    createdAt: nowIso(),
    openingId: input.openingId,
    openingName: input.openingName,
    methodLabel: input.methodLabel,
    before: input.before,
    after: input.after,
  });
}

function dispatchAdminGrantPopup(input: {
  id: string;
  userId: string;
  success: boolean;
  targetUserId: string;
  targetEmail?: string | null;
  grantType: string;
  amount: number;
  reason: string;
  auditId?: string;
  beforeSummary: string;
  afterSummary: string;
  title: string;
  description: string;
}) {
  enqueueRewardPopup({
    id: createIdempotencyKey(`popup:${input.id}`, input.userId),
    kind: "admin_grant",
    preview: false,
    title: input.title,
    description: input.description,
    createdAt: nowIso(),
    success: input.success,
    targetUserId: input.targetUserId,
    targetEmail: input.targetEmail ?? null,
    grantType: input.grantType,
    amount: input.amount,
    reason: input.reason,
    auditId: input.auditId,
    beforeSummary: input.beforeSummary,
    afterSummary: input.afterSummary,
  });
}

function dispatchTempoCacheResultPopup(input: {
  id: string;
  userId: string;
  title: string;
  description: string;
  tempoCacheState?: TempoCacheState;
  rewardGrants?: RewardPopupTempoCacheEvent["rewardGrants"];
  rewardHistory?: RewardsDebugSnapshot["rewardHistory"];
  sharedSyncFailed?: boolean;
  sharedSyncFailureMessage?: string;
}) {
  enqueueRewardPopup({
    id: createIdempotencyKey(`popup:${input.id}`, input.userId),
    kind: "tempo_cache",
    preview: false,
    title: input.title,
    description: input.description,
    createdAt: nowIso(),
    variant: input.tempoCacheState === "closed" ? "C" : input.tempoCacheState === "opening" ? "A" : "B",
    state: input.tempoCacheState ?? "closed",
    rewardGrants: input.rewardGrants ?? [],
    rewardHistory: input.rewardHistory ?? loadRewardHistorySnapshot(input.userId).history,
    sharedSyncFailed: input.sharedSyncFailed,
    sharedSyncFailureCode: input.sharedSyncFailed ? "shared_sync_failed" : undefined,
    sharedSyncFailureMessage: input.sharedSyncFailureMessage,
  });
}

function summarizeDaily(snapshot: RewardsDebugSnapshot): string {
  return `Tempo ${snapshot.daily.tempo.current}/${snapshot.daily.tempo.target}, Battery ${snapshot.daily.battery.current}/${snapshot.daily.battery.target}, Blundr ${snapshot.daily.blundr.current}/${snapshot.daily.blundr.target}`;
}

function summarizeInventory(snapshot: RewardsDebugSnapshot): string {
  return `points=${snapshot.repertoire.availablePoints}; fragments=${snapshot.rewardInventory.openingFragments}; tokens=${snapshot.rewardInventory.choiceTokens}`;
}

function summarizeRewardRolls(snapshot: RewardsDebugSnapshot): string {
  return snapshot.rewardRolls
    .slice(-5)
    .map((roll) => `${roll.trigger}:${roll.reward?.displayName ?? "missed"}`)
    .join(" | ") || "None";
}

function summarizeRewardGrants(snapshot: RewardsDebugSnapshot): string {
  return snapshot.rewardInventoryEvents
    .slice(-5)
    .map((event) => `${event.kind}:${event.message ?? "updated"}`)
    .join(" | ") || "None";
}

function getDailyRingSharedSyncFailureMessage(result: DailyRingCompletionResultLike): string | null {
  if (!isDailyRingCompletionSuccess(result)) return null;
  if (!result.sharedSyncFailed) return null;
  return result.sharedSyncFailureMessage ?? "Shared reward persistence failed. Please retry.";
}

function loadSnapshot(userId: string, tempoCacheState: TempoCacheState, pendingPopupLabel: string | null): RewardsDebugSnapshot {
  const profile = getLocalTrainingProfile(userId);
  const daily = loadDailyRingSnapshot({ userId, profile: profile ?? undefined });
  const repertoire = loadRepertoireProgress({ userId, starterPackId: profile?.selectedStarterPackId ?? null });
  const rewardHistorySnapshot = loadRewardHistorySnapshot(userId);
  const rewardInventory = getRewardInventory(userId);
  const rewardInventoryEvents = getRewardInventoryEventLog(userId);
  const streak = getLocalStreakRecord(userId);

  return {
    userId,
    profile,
    daily,
    repertoire,
    rewardHistory: rewardHistorySnapshot.history,
    rewardRolls: rewardHistorySnapshot.rewardRolls,
    rewardInventory,
    rewardInventoryEvents,
    streak,
    tempoCacheState,
    recentRewardGrantSummary: rewardInventoryEvents.slice(-5).map((event) => `${event.kind} • ${event.message ?? "updated"}`),
    recentRewardRollSummary: rewardHistorySnapshot.rewardRolls.slice(-5).map((roll) => `${roll.trigger} • ${roll.reward?.displayName ?? "missed"}`),
    appliedRewardIdsCount: rewardHistorySnapshot.history.appliedRewardIds.length,
    pendingPopupLabel,
  };
}

function buildEventLogEntry(input: {
  id: string;
  trigger: string;
  action: string;
  rewardGenerated: string;
  storageUpdated: string;
  popupShown: string;
  persistenceTarget: string;
  idempotencyKey: string;
  beforeSummary: string;
  afterSummary: string;
  success: boolean;
  error?: string;
}): RewardsEventLogEntry {
  return {
    id: input.id,
    timestamp: nowIso(),
    trigger: input.trigger,
    action: input.action,
    rewardGenerated: input.rewardGenerated,
    storageUpdated: input.storageUpdated,
    popupShown: input.popupShown,
    persistenceTarget: input.persistenceTarget,
    idempotencyKey: input.idempotencyKey,
    beforeSummary: input.beforeSummary,
    afterSummary: input.afterSummary,
    success: input.success,
    error: input.error,
  };
}

export function RewardsDebugPanel({ userId, mode, email, target, className }: RewardsDebugPanelProps) {
  const [tempoCacheState, setTempoCacheState] = useState<TempoCacheState>("closed");
  const [preview, setPreview] = useState<RewardsPreviewKind>({ kind: "none" });
  const [snapshot, setSnapshot] = useState<RewardsDebugSnapshot>(() => loadSnapshot(userId, tempoCacheState, null));
  const [eventLog, setEventLog] = useState<RewardsEventLogEntry[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedOpeningId, setSelectedOpeningId] = useState<string | null>(() => snapshot.repertoire.lockedOpeningIds[0] ?? null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const mutationInFlightRef = useRef(false);

  const previewLabel = preview.kind === "none" ? null : preview.title;
  const snapshotView = useMemo(() => ({ ...snapshot, tempoCacheState, pendingPopupLabel: previewLabel }), [snapshot, tempoCacheState, previewLabel]);
  const lockedOpeningIds = snapshotView.repertoire.lockedOpeningIds;
  const currentStreakDays = snapshotView.streak?.currentStreak ?? 0;
  const persistenceTargetLabel = target.targetMode;

  useEffect(() => {
    setSnapshot((current) => ({ ...current, pendingPopupLabel: previewLabel }));
  }, [previewLabel]);

  useEffect(() => {
    setSnapshot((current) => ({ ...current, tempoCacheState }));
  }, [tempoCacheState]);

  useEffect(() => {
    setSnapshot(loadSnapshot(userId, tempoCacheState, previewLabel));
  }, [userId]);

  useEffect(() => {
    setSelectedOpeningId((current) => {
      if (current && lockedOpeningIds.includes(current)) return current;
      return lockedOpeningIds[0] ?? null;
    });
  }, [lockedOpeningIds.join("|")]);

  useEffect(() => {
    void refreshState();
  }, [userId, target.targetMode]);

  async function refreshState(nextTempoCacheState = tempoCacheState, nextPreviewLabel = previewLabel) {
    if (target.isAuthenticatedShared) {
      const hydration = await hydrateSharedAccountBootstrap();
      if (!hydration.ok) {
        setErrorMessage(hydration.error ?? hydration.message);
      }
    }
    setSnapshot(loadSnapshot(userId, nextTempoCacheState, nextPreviewLabel));
  }

  function appendEventLog(entry: RewardsEventLogEntry) {
    setEventLog((current) => [...current, entry].slice(-100));
  }

  function buildSummary(label: string, value: string): string {
    return `${label}: ${value}`;
  }

  function beforeSummary(): string {
    return `${summarizeDaily(snapshotView)} | ${summarizeInventory(snapshotView)} | streak=${snapshotView.streak?.currentStreak ?? 0}/${snapshotView.streak?.longestStreak ?? 0}`;
  }

  function afterSummary(nextSnapshot: RewardsDebugSnapshot): string {
    return `${summarizeDaily(nextSnapshot)} | ${summarizeInventory(nextSnapshot)} | streak=${nextSnapshot.streak?.currentStreak ?? 0}/${nextSnapshot.streak?.longestStreak ?? 0}`;
  }

  function logPreview(actionId: string, previewState: RewardsPreviewKind): PreviewMutationResult {
    const stateForComparison = {
      repertoire: { availablePoints: snapshotView.repertoire.availablePoints, unlockedOpeningIds: snapshotView.repertoire.unlockedOpeningIds },
      rewardInventory: { openingFragments: snapshotView.rewardInventory.openingFragments, choiceTokens: snapshotView.rewardInventory.choiceTokens },
      rewardHistory: { appliedRewardIds: snapshotView.rewardHistory.appliedRewardIds, allRingsDaysSinceRandomReward: snapshotView.rewardHistory.allRingsDaysSinceRandomReward },
      daily: { tempo: { current: snapshotView.daily.tempo.current }, battery: { current: snapshotView.daily.battery.current }, blundr: { current: snapshotView.daily.blundr.current } },
    };
    const label = previewState.kind === "none" ? "none" : previewState.title;
    setPreview(previewState);
    const popupEvent = buildRewardPopupFromPreview({
      id: actionId,
      userId,
      preview: previewState,
      snapshot: snapshotView,
    });
    if (popupEvent) {
      enqueueRewardPopup(popupEvent);
    }
    const previewEventId = createIdempotencyKey(`preview:${actionId}`, userId);
    appendEventLog(
      buildEventLogEntry({
        id: previewEventId,
        trigger: actionId,
        action: "Preview popup/card",
        rewardGenerated: label,
        storageUpdated: "No storage change",
        popupShown: label,
        persistenceTarget: persistenceTargetLabel,
        idempotencyKey: previewEventId,
        beforeSummary: beforeSummary(),
        afterSummary: beforeSummary(),
        success: true,
      }),
    );
    setStatusMessage(`Previewing ${label}.`);
    setErrorMessage(null);
    return comparePreviewState(stateForComparison, stateForComparison);
  }

  async function executeVariableReward(input: {
    rewardType: "unlock_points" | "opening_fragment" | "choice_token" | "future_reward";
    amount: number;
    displayName: string;
    description: string;
    rarity: "common" | "uncommon" | "rare" | "epic";
    eventId: string;
  }): Promise<RewardPresentationModel | null> {
    if (input.rewardType === "future_reward") {
      setErrorMessage("Unknown future reward types are presentation-only until an approved domain policy exists.");
      return null;
    }
    const roll = {
      id: input.eventId,
      userId,
      trigger: "weekly_cache" as const,
      rolledAt: nowIso(),
      didReward: true,
      seed: `dev-variable:${input.eventId}`,
      reward: {
        id: `${input.eventId}:reward`,
        rarity: input.rarity,
        rewardType: input.rewardType,
        amount: input.amount,
        displayName: input.displayName,
        description: input.description,
      },
    };
    const result = await applyRewardGrant({
      userId,
      roll,
      grantMode: "guaranteed_cache",
      now: nowIso(),
      syncRemote: target.isAuthenticatedShared,
    });
    if ("message" in result) {
      setErrorMessage(result.message);
      return null;
    }
    if (!result.applied) {
      setErrorMessage("Duplicate event; no reward was applied.");
      return null;
    }
    const presentation = adaptRewardGrantToPresentation(result.grant, "Variable Tempo Cache test");
    if (result.grant.rewardType !== "unlock_points" && result.grant.rewardType !== "opening_fragment" && result.grant.rewardType !== "choice_token") {
      setErrorMessage("This reward type has no direct success popup mapping.");
      return null;
    }
    dispatchRewardSuccessPopup({
      id: input.eventId,
      userId,
      title: presentation.displayName,
      description: presentation.description,
      rarity: presentation.rarity,
      rewardType: result.grant.rewardType,
      amount: result.grant.amount,
      grant: result.grant,
    });
    appendEventLog(buildEventLogEntry({
      id: input.eventId,
      trigger: "variable_tempo_cache",
      action: "Execute variable Tempo Cache reward",
      rewardGenerated: presentation.displayName,
      storageUpdated: "Canonical reward grant persisted",
      popupShown: "Published after applied:true",
      persistenceTarget: persistenceTargetLabel,
      idempotencyKey: input.eventId,
      beforeSummary: beforeSummary(),
      afterSummary: beforeSummary(),
      success: true,
    }));
    await refreshState(tempoCacheState, previewLabel);
    return presentation;
  }

  async function handleAction(triggerId: string, options?: { points?: number }) {
    if (mutationInFlightRef.current || busyAction) {
      setErrorMessage("Another rewards transaction is still in flight. Wait for it to finish.");
      return;
    }
    const replayTarget = triggerId === "replay_last_event" ? eventLog.at(-1) ?? null : null;
    if (triggerId === "replay_last_event" && !replayTarget) {
      setErrorMessage("There is no prior transaction to replay.");
      return;
    }
    const effectiveTriggerId = replayTarget?.trigger ?? triggerId;
    const idempotencyKey = replayTarget?.idempotencyKey ?? createIdempotencyKey(effectiveTriggerId, userId);
    const before = beforeSummary();
    mutationInFlightRef.current = true;
    setBusyAction(effectiveTriggerId);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      let nextTempoCacheState = tempoCacheState;
      let rewardGenerated = "None";
      let storageUpdated = "No storage change";
      let popupShown = previewLabel ?? "None";
      let success = true;
      let error: string | undefined;

      switch (effectiveTriggerId) {
        case "tempo_increment": {
          const openingId = selectedOpeningId ?? snapshotView.repertoire.unlockedOpeningIds[0] ?? snapshotView.repertoire.lockedOpeningIds[0] ?? "tempo-dev-opening";
          const result = await recordTempoRunCompleted({
            userId,
            openingId,
            runSessionId: idempotencyKey,
            terminalFen: "dev-tempo",
            completionIndex: snapshotView.daily.tempo.current + 1,
            dateKey: snapshotView.daily.localDate,
            repertoireProgress: snapshotView.repertoire,
            profile: snapshotView.profile,
            now: nowIso(),
          });
          const sharedSyncFailureMessage = getDailyRingSharedSyncFailureMessage(result);
          const dailySuccess = isDailyRingCompletionSuccess(result) && !sharedSyncFailureMessage;
          success = dailySuccess;
          if (dailySuccess) {
            nextTempoCacheState = result.tempoCacheState ?? nextTempoCacheState;
            rewardGenerated = result.rewardGrants?.map((grant) => grant.displayName).join(", ") || "Daily Tempo updated";
            storageUpdated = "Daily ring progress, reward history, and repertoire points";
            popupShown = result.tempoCacheState ? `Tempo Cache ${result.tempoCacheState}` : popupShown;
            setStatusMessage(result.summaryTitle);
            dispatchTempoCacheResultPopup({
              id: triggerId,
              userId,
              title: result.summaryTitle,
              description: result.tempoMessage,
              tempoCacheState: result.tempoCacheState ?? nextTempoCacheState,
              rewardGrants: result.rewardGrants,
              rewardHistory: result.rewardHistory,
              sharedSyncFailed: result.sharedSyncFailed,
              sharedSyncFailureMessage: result.sharedSyncFailureMessage,
            });
          } else {
            error = sharedSyncFailureMessage ?? (isDailyRingCompletionFailure(result) ? result.message : null) ?? "Daily Tempo update failed.";
            rewardGenerated = "Reward persistence failed";
            storageUpdated = "Daily ring progress only";
            popupShown = sharedSyncFailureMessage ? "Shared reward sync failed" : popupShown;
            setErrorMessage(error);
            if (sharedSyncFailureMessage) {
              dispatchFailurePopup({
                id: triggerId,
                userId,
                title: "Shared reward persistence failed",
                code: "shared_sync_failed",
                message: sharedSyncFailureMessage,
              });
            }
          }
          break;
        }
        case "tempo_complete": {
          let workingSnapshot = loadSnapshot(userId, tempoCacheState, previewLabel);
          while (workingSnapshot.daily.tempo.current < workingSnapshot.daily.tempo.target) {
            const openingId = selectedOpeningId ?? workingSnapshot.repertoire.unlockedOpeningIds[0] ?? workingSnapshot.repertoire.lockedOpeningIds[0] ?? "tempo-dev-opening";
            const result = await recordTempoRunCompleted({
              userId,
              openingId,
              runSessionId: `${idempotencyKey}:tempo:${workingSnapshot.daily.tempo.current + 1}`,
              terminalFen: "dev-tempo",
              completionIndex: workingSnapshot.daily.tempo.current + 1,
              dateKey: workingSnapshot.daily.localDate,
              repertoireProgress: workingSnapshot.repertoire,
              profile: workingSnapshot.profile,
              now: nowIso(),
            });
            const sharedSyncFailureMessage = getDailyRingSharedSyncFailureMessage(result);
            if (!isDailyRingCompletionSuccess(result) || sharedSyncFailureMessage) {
              success = false;
              error = sharedSyncFailureMessage ?? (isDailyRingCompletionFailure(result) ? result.message : null) ?? "Tempo ring completion failed.";
              setErrorMessage(error);
              break;
            }
            nextTempoCacheState = result.tempoCacheState ?? nextTempoCacheState;
            workingSnapshot = loadSnapshot(userId, nextTempoCacheState, previewLabel);
          }
          if (!success) {
            rewardGenerated = "Reward persistence failed";
            storageUpdated = "Daily ring progress only";
            popupShown = "Shared reward sync failed";
          } else {
            rewardGenerated = workingSnapshot.daily.tempo.complete ? "Tempo ring closed" : "Tempo ring advanced";
            storageUpdated = "Daily ring progress, reward history, and repertoire points";
            popupShown = nextTempoCacheState;
            setStatusMessage(workingSnapshot.daily.tempo.complete ? "Tempo ring closed." : "Tempo ring advanced.");
          }
          break;
        }
        case "battery_increment": {
          const openingId = selectedOpeningId ?? snapshotView.repertoire.unlockedOpeningIds[0] ?? snapshotView.repertoire.lockedOpeningIds[0] ?? "battery-dev-opening";
          const result = await recordBatteryLineCompleted({
            userId,
            openingId,
            continuationRunId: idempotencyKey,
            lineId: "dev-battery",
            checkmateFen: "dev-battery",
            completionIndex: snapshotView.daily.battery.current + 1,
            dateKey: snapshotView.daily.localDate,
            repertoireProgress: snapshotView.repertoire,
            profile: snapshotView.profile,
            now: nowIso(),
          });
          const sharedSyncFailureMessage = getDailyRingSharedSyncFailureMessage(result);
          const dailySuccess = isDailyRingCompletionSuccess(result) && !sharedSyncFailureMessage;
          success = dailySuccess;
          if (dailySuccess) {
            nextTempoCacheState = result.tempoCacheState ?? nextTempoCacheState;
            rewardGenerated = result.rewardGrants?.map((grant) => grant.displayName).join(", ") || "Daily Battery updated";
            storageUpdated = "Daily ring progress, reward history, and repertoire points";
            popupShown = result.tempoCacheState ? `Tempo Cache ${result.tempoCacheState}` : popupShown;
            setStatusMessage(result.summaryTitle);
            dispatchTempoCacheResultPopup({
              id: triggerId,
              userId,
              title: result.summaryTitle,
              description: result.tempoMessage,
              tempoCacheState: result.tempoCacheState ?? nextTempoCacheState,
              rewardGrants: result.rewardGrants,
              rewardHistory: result.rewardHistory,
              sharedSyncFailed: result.sharedSyncFailed,
              sharedSyncFailureMessage: result.sharedSyncFailureMessage,
            });
          } else {
            error = sharedSyncFailureMessage ?? (isDailyRingCompletionFailure(result) ? result.message : null) ?? "Daily Battery update failed.";
            rewardGenerated = "Reward persistence failed";
            storageUpdated = "Daily ring progress only";
            popupShown = sharedSyncFailureMessage ? "Shared reward sync failed" : popupShown;
            setErrorMessage(error);
            if (sharedSyncFailureMessage) {
              dispatchFailurePopup({
                id: triggerId,
                userId,
                title: "Shared reward persistence failed",
                code: "shared_sync_failed",
                message: sharedSyncFailureMessage,
              });
            }
          }
          break;
        }
        case "battery_complete": {
          let workingSnapshot = loadSnapshot(userId, tempoCacheState, previewLabel);
          while (workingSnapshot.daily.battery.current < workingSnapshot.daily.battery.target) {
            const openingId = selectedOpeningId ?? workingSnapshot.repertoire.unlockedOpeningIds[0] ?? workingSnapshot.repertoire.lockedOpeningIds[0] ?? "battery-dev-opening";
            const result = await recordBatteryLineCompleted({
              userId,
              openingId,
              continuationRunId: `${idempotencyKey}:battery:${workingSnapshot.daily.battery.current + 1}`,
              lineId: "dev-battery",
              checkmateFen: "dev-battery",
              completionIndex: workingSnapshot.daily.battery.current + 1,
              dateKey: workingSnapshot.daily.localDate,
              repertoireProgress: workingSnapshot.repertoire,
              profile: workingSnapshot.profile,
              now: nowIso(),
            });
            const sharedSyncFailureMessage = getDailyRingSharedSyncFailureMessage(result);
            if (!isDailyRingCompletionSuccess(result) || sharedSyncFailureMessage) {
              success = false;
              error = sharedSyncFailureMessage ?? (isDailyRingCompletionFailure(result) ? result.message : null) ?? "Tempo ring completion failed.";
              setErrorMessage(error);
              break;
            }
            nextTempoCacheState = result.tempoCacheState ?? nextTempoCacheState;
            workingSnapshot = loadSnapshot(userId, nextTempoCacheState, previewLabel);
          }
          if (!success) {
            rewardGenerated = "Reward persistence failed";
            storageUpdated = "Daily ring progress only";
            popupShown = "Shared reward sync failed";
          } else {
            rewardGenerated = workingSnapshot.daily.battery.complete ? "Battery ring closed" : "Battery ring advanced";
            storageUpdated = "Daily ring progress, reward history, and repertoire points";
            popupShown = nextTempoCacheState;
            setStatusMessage(workingSnapshot.daily.battery.complete ? "Battery ring closed." : "Battery ring advanced.");
          }
          break;
        }
        case "blundr_increment": {
          const result = await recordBlundrTaskCompleted({
            userId,
            deckId: "dev-deck",
            reviewSessionId: idempotencyKey,
            taskId: "dev-blundr",
            completionIndex: snapshotView.daily.blundr.current + 1,
            dateKey: snapshotView.daily.localDate,
            repertoireProgress: snapshotView.repertoire,
            profile: snapshotView.profile,
            now: nowIso(),
          });
          const sharedSyncFailureMessage = getDailyRingSharedSyncFailureMessage(result);
          const dailySuccess = isDailyRingCompletionSuccess(result) && !sharedSyncFailureMessage;
          success = dailySuccess;
          if (dailySuccess) {
            nextTempoCacheState = result.tempoCacheState ?? nextTempoCacheState;
            rewardGenerated = result.rewardGrants?.map((grant) => grant.displayName).join(", ") || "Daily Blundr updated";
            storageUpdated = "Daily ring progress, reward history, and repertoire points";
            popupShown = result.tempoCacheState ? `Tempo Cache ${result.tempoCacheState}` : popupShown;
            setStatusMessage(result.summaryTitle);
            dispatchTempoCacheResultPopup({
              id: triggerId,
              userId,
              title: result.summaryTitle,
              description: result.tempoMessage,
              tempoCacheState: result.tempoCacheState ?? nextTempoCacheState,
              rewardGrants: result.rewardGrants,
              rewardHistory: result.rewardHistory,
              sharedSyncFailed: result.sharedSyncFailed,
              sharedSyncFailureMessage: result.sharedSyncFailureMessage,
            });
          } else {
            error = sharedSyncFailureMessage ?? (isDailyRingCompletionFailure(result) ? result.message : null) ?? "Daily Blundr update failed.";
            rewardGenerated = "Reward persistence failed";
            storageUpdated = "Daily ring progress only";
            popupShown = sharedSyncFailureMessage ? "Shared reward sync failed" : popupShown;
            setErrorMessage(error);
            if (sharedSyncFailureMessage) {
              dispatchFailurePopup({
                id: triggerId,
                userId,
                title: "Shared reward persistence failed",
                code: "shared_sync_failed",
                message: sharedSyncFailureMessage,
              });
            }
          }
          break;
        }
        case "blundr_complete": {
          let workingSnapshot = loadSnapshot(userId, tempoCacheState, previewLabel);
          while (workingSnapshot.daily.blundr.current < workingSnapshot.daily.blundr.target) {
            const result = await recordBlundrTaskCompleted({
              userId,
              deckId: "dev-deck",
              reviewSessionId: `${idempotencyKey}:blundr:${workingSnapshot.daily.blundr.current + 1}`,
              taskId: "dev-blundr",
              completionIndex: workingSnapshot.daily.blundr.current + 1,
              dateKey: workingSnapshot.daily.localDate,
              repertoireProgress: workingSnapshot.repertoire,
              profile: workingSnapshot.profile,
              now: nowIso(),
            });
            const sharedSyncFailureMessage = getDailyRingSharedSyncFailureMessage(result);
            if (!isDailyRingCompletionSuccess(result) || sharedSyncFailureMessage) {
              success = false;
              error = sharedSyncFailureMessage ?? (isDailyRingCompletionFailure(result) ? result.message : null) ?? "Daily Blundr completion failed.";
              setErrorMessage(error);
              break;
            }
            nextTempoCacheState = result.tempoCacheState ?? nextTempoCacheState;
            workingSnapshot = loadSnapshot(userId, nextTempoCacheState, previewLabel);
          }
          if (!success) {
            rewardGenerated = "Reward persistence failed";
            storageUpdated = "Daily ring progress only";
            popupShown = "Shared reward sync failed";
          } else {
            rewardGenerated = workingSnapshot.daily.blundr.complete ? "Blundr ring closed" : "Blundr ring advanced";
            storageUpdated = "Daily ring progress, reward history, and repertoire points";
            popupShown = nextTempoCacheState;
            setStatusMessage(workingSnapshot.daily.blundr.complete ? "Blundr ring closed." : "Blundr ring advanced.");
          }
          break;
        }
        case "all_rings_celebration": {
          let workingSnapshot = loadSnapshot(userId, tempoCacheState, previewLabel);
          while (!workingSnapshot.daily.tempo.complete) {
            const result = await recordTempoRunCompleted({
              userId,
              openingId: selectedOpeningId ?? workingSnapshot.repertoire.unlockedOpeningIds[0] ?? workingSnapshot.repertoire.lockedOpeningIds[0] ?? "tempo-dev-opening",
              runSessionId: `${idempotencyKey}:tempo:${workingSnapshot.daily.tempo.current + 1}`,
              terminalFen: "dev-tempo",
              completionIndex: workingSnapshot.daily.tempo.current + 1,
              dateKey: workingSnapshot.daily.localDate,
              repertoireProgress: workingSnapshot.repertoire,
              profile: workingSnapshot.profile,
              now: nowIso(),
            });
            const sharedSyncFailureMessage = getDailyRingSharedSyncFailureMessage(result);
            if (!isDailyRingCompletionSuccess(result) || sharedSyncFailureMessage) {
              success = false;
              error = sharedSyncFailureMessage ?? (isDailyRingCompletionFailure(result) ? result.message : null) ?? "Tempo ring completion failed.";
              setErrorMessage(error);
              break;
            }
            nextTempoCacheState = result.tempoCacheState ?? nextTempoCacheState;
            workingSnapshot = loadSnapshot(userId, nextTempoCacheState, previewLabel);
          }
          while (!workingSnapshot.daily.battery.complete) {
            const result = await recordBatteryLineCompleted({
              userId,
              openingId: selectedOpeningId ?? workingSnapshot.repertoire.unlockedOpeningIds[0] ?? workingSnapshot.repertoire.lockedOpeningIds[0] ?? "battery-dev-opening",
              continuationRunId: `${idempotencyKey}:battery:${workingSnapshot.daily.battery.current + 1}`,
              lineId: "dev-battery",
              checkmateFen: "dev-battery",
              completionIndex: workingSnapshot.daily.battery.current + 1,
              dateKey: workingSnapshot.daily.localDate,
              repertoireProgress: workingSnapshot.repertoire,
              profile: workingSnapshot.profile,
              now: nowIso(),
            });
            const sharedSyncFailureMessage = getDailyRingSharedSyncFailureMessage(result);
            if (!isDailyRingCompletionSuccess(result) || sharedSyncFailureMessage) {
              success = false;
              error = sharedSyncFailureMessage ?? (isDailyRingCompletionFailure(result) ? result.message : null) ?? "Battery ring completion failed.";
              setErrorMessage(error);
              break;
            }
            nextTempoCacheState = result.tempoCacheState ?? nextTempoCacheState;
            workingSnapshot = loadSnapshot(userId, nextTempoCacheState, previewLabel);
          }
          while (!workingSnapshot.daily.blundr.complete) {
            const result = await recordBlundrTaskCompleted({
              userId,
              deckId: "dev-deck",
              reviewSessionId: `${idempotencyKey}:blundr:${workingSnapshot.daily.blundr.current + 1}`,
              taskId: "dev-blundr",
              completionIndex: workingSnapshot.daily.blundr.current + 1,
              dateKey: workingSnapshot.daily.localDate,
              repertoireProgress: workingSnapshot.repertoire,
              profile: workingSnapshot.profile,
              now: nowIso(),
            });
            const sharedSyncFailureMessage = getDailyRingSharedSyncFailureMessage(result);
            if (!isDailyRingCompletionSuccess(result) || sharedSyncFailureMessage) {
              success = false;
              error = sharedSyncFailureMessage ?? (isDailyRingCompletionFailure(result) ? result.message : null) ?? "Blundr ring completion failed.";
              setErrorMessage(error);
              break;
            }
            nextTempoCacheState = result.tempoCacheState ?? nextTempoCacheState;
            workingSnapshot = loadSnapshot(userId, nextTempoCacheState, previewLabel);
          }
          if (!success) {
            rewardGenerated = "Reward persistence failed";
            storageUpdated = "Daily ring progress only";
            popupShown = "Shared reward sync failed";
          } else {
            rewardGenerated = workingSnapshot.daily.allComplete ? "All three rings closed" : "Celebration advanced";
            storageUpdated = "Daily ring progress, reward history, streak, and repertoire points";
            popupShown = nextTempoCacheState;
            setStatusMessage(workingSnapshot.daily.allComplete ? "All three rings closed." : "Celebration advanced.");
          }
          break;
        }
        case "grant_small_points": {
          const requestedPoints = Math.max(1, Math.floor(options?.points ?? 10));
          const result = await earnAndPersistRepertoirePoints({
            userId,
            source: "manual_dev_adjustment",
            points: requestedPoints,
            completionId: idempotencyKey,
            starterPackId: snapshotView.repertoire.selectedStarterPackId,
            now: nowIso(),
            syncRemote: target.remoteSyncEnabled,
          });
          if (isRepertoirePersistenceFailure(result)) {
            success = false;
            error = result.message;
            setErrorMessage(result.message);
            dispatchFailurePopup({
              id: triggerId,
              userId,
              title: "Reward failed",
              code: result.code,
              message: result.message,
            });
          } else {
            rewardGenerated = `+${requestedPoints} repertoire points`;
            storageUpdated = "Repertoire points";
            setStatusMessage("Small repertoire point grant applied.");
            dispatchRewardSuccessPopup({
              id: triggerId,
              userId,
              title: "Repertoire Points",
              description: "A steady progress grant for training.",
              rarity: "common",
              rewardType: "unlock_points",
              amount: requestedPoints,
            });
          }
          break;
        }
        case "grant_large_points": {
          const result = await earnAndPersistRepertoirePoints({
            userId,
            source: "manual_dev_adjustment",
            points: 50,
            completionId: idempotencyKey,
            starterPackId: snapshotView.repertoire.selectedStarterPackId,
            now: nowIso(),
            syncRemote: target.remoteSyncEnabled,
          });
          if (isRepertoirePersistenceFailure(result)) {
            success = false;
            error = result.message;
            setErrorMessage(result.message);
            dispatchFailurePopup({
              id: triggerId,
              userId,
              title: "Reward failed",
              code: result.code,
              message: result.message,
            });
          } else {
            rewardGenerated = "+50 repertoire points";
            storageUpdated = "Repertoire points";
            setStatusMessage("Large repertoire point grant applied.");
            dispatchRewardSuccessPopup({
              id: triggerId,
              userId,
              title: "Repertoire Points",
              description: "A larger steady progress grant for training.",
              rarity: "common",
              rewardType: "unlock_points",
              amount: 50,
            });
          }
          break;
        }
        case "grant_epic_bonus": {
          const requestedPoints = Math.max(1, Math.floor(options?.points ?? 100));
          const result = await earnAndPersistRepertoirePoints({
            userId,
            source: "manual_dev_adjustment",
            points: requestedPoints,
            completionId: idempotencyKey,
            starterPackId: snapshotView.repertoire.selectedStarterPackId,
            now: nowIso(),
            syncRemote: target.remoteSyncEnabled,
          });
          if (isRepertoirePersistenceFailure(result)) {
            success = false;
            error = result.message;
            setErrorMessage(result.message);
            dispatchFailurePopup({
              id: triggerId,
              userId,
              title: "Reward failed",
              code: result.code,
              message: result.message,
            });
          } else {
            rewardGenerated = `+${requestedPoints} repertoire points`;
            storageUpdated = "Repertoire points";
            setStatusMessage("Epic bonus applied.");
            dispatchRewardSuccessPopup({
              id: triggerId,
              userId,
              title: "Epic Bonus",
              description: "Epic bonus applied as repertoire points.",
              rarity: "epic",
              rewardType: "unlock_points",
              amount: requestedPoints,
            });
          }
          break;
        }
        case "grant_opening_fragment": {
          const result = await grantOpeningFragments({
            userId,
            amount: 1,
            sourceEventId: idempotencyKey,
            now: nowIso(),
            syncRemote: target.remoteSyncEnabled,
          });
          success = result.applied;
          rewardGenerated = "+1 opening fragment";
          storageUpdated = "Reward inventory";
          if (result.applied) {
            setStatusMessage(result.message);
            dispatchRewardSuccessPopup({
              id: triggerId,
              userId,
              title: "Opening Fragment",
              description: "Collect 3 to choose a new opening.",
              rarity: "uncommon",
              rewardType: "opening_fragment",
              amount: 1,
            });
          } else {
            error = result.message;
            setErrorMessage(result.message);
            if (result.code === "shared_sync_failed") {
              dispatchFailurePopup({
                id: triggerId,
                userId,
                title: "Shared reward persistence failed",
                code: result.code,
                message: result.message,
              });
            }
          }
          break;
        }
        case "grant_3_opening_fragments": {
          const result = await grantOpeningFragments({
            userId,
            amount: 3,
            sourceEventId: idempotencyKey,
            now: nowIso(),
            syncRemote: target.remoteSyncEnabled,
          });
          success = result.applied;
          rewardGenerated = "+3 opening fragments";
          storageUpdated = "Reward inventory";
          if (result.applied) {
            setStatusMessage(result.message);
            dispatchRewardSuccessPopup({
              id: triggerId,
              userId,
              title: "Opening Fragments",
              description: "Collect 3 to choose a new opening.",
              rarity: "uncommon",
              rewardType: "opening_fragment",
              amount: 3,
            });
          } else {
            error = result.message;
            setErrorMessage(result.message);
            if (result.code === "shared_sync_failed") {
              dispatchFailurePopup({
                id: triggerId,
                userId,
                title: "Shared reward persistence failed",
                code: result.code,
                message: result.message,
              });
            }
          }
          break;
        }
        case "grant_6_opening_fragments": {
          const result = await grantOpeningFragments({
            userId,
            amount: 6,
            sourceEventId: idempotencyKey,
            now: nowIso(),
            syncRemote: target.remoteSyncEnabled,
          });
          success = result.applied;
          rewardGenerated = "+6 opening fragments";
          storageUpdated = "Reward inventory";
          if (result.applied) {
            setStatusMessage(result.message);
            dispatchRewardSuccessPopup({
              id: triggerId,
              userId,
              title: "Opening Fragments",
              description: "Collect 3 to choose a new opening.",
              rarity: "uncommon",
              rewardType: "opening_fragment",
              amount: 6,
            });
          } else {
            error = result.message;
            setErrorMessage(result.message);
            if (result.code === "shared_sync_failed") {
              dispatchFailurePopup({
                id: triggerId,
                userId,
                title: "Shared reward persistence failed",
                code: result.code,
                message: result.message,
              });
            }
          }
          break;
        }
        case "grant_choice_token": {
          const result = await grantChoiceTokens({
            userId,
            amount: 1,
            sourceEventId: idempotencyKey,
            now: nowIso(),
            syncRemote: target.remoteSyncEnabled,
          });
          success = result.applied;
          rewardGenerated = "+1 choice token";
          storageUpdated = "Reward inventory";
          if (result.applied) {
            setStatusMessage(result.message);
            dispatchRewardSuccessPopup({
              id: triggerId,
              userId,
              title: "Choice Token",
              description: "Choose one locked opening to unlock.",
              rarity: "rare",
              rewardType: "choice_token",
              amount: 1,
            });
          } else {
            error = result.message;
            setErrorMessage(result.message);
            if (result.code === "shared_sync_failed") {
              dispatchFailurePopup({
                id: triggerId,
                userId,
                title: "Shared reward persistence failed",
                code: result.code,
                message: result.message,
              });
            }
          }
          break;
        }
        case "spend_3_fragments": {
          if (!selectedOpeningId) {
            success = false;
            error = "Select a locked opening before spending fragments.";
            setErrorMessage(error);
            break;
          }
          const result = await spendOpeningFragmentsOnOpening({
            userId,
            openingId: selectedOpeningId,
            sourceEventId: idempotencyKey,
            now: nowIso(),
            syncRemote: target.remoteSyncEnabled,
          });
          success = result.applied;
          rewardGenerated = result.unlockedOpeningId ? `Unlocked ${result.unlockedOpeningId}` : "Fragment spend attempt";
          storageUpdated = "Reward inventory and repertoire unlock state";
          if (result.applied) {
            setStatusMessage(result.message);
            dispatchUnlockSuccessPopup({
              id: triggerId,
              userId,
              openingId: result.unlockedOpeningId ?? selectedOpeningId,
              openingName: result.unlockedOpeningId ?? selectedOpeningId,
              methodLabel: "Opening Fragments",
              before: {
                points: snapshotView.repertoire.availablePoints,
                fragments: snapshotView.rewardInventory.openingFragments,
                tokens: snapshotView.rewardInventory.choiceTokens,
              },
              after: {
                points: snapshotView.repertoire.availablePoints,
                fragments: Math.max(0, snapshotView.rewardInventory.openingFragments - 3),
                tokens: snapshotView.rewardInventory.choiceTokens,
              },
            });
          } else {
            setErrorMessage(result.message);
            if (result.code === "shared_sync_failed") {
              dispatchFailurePopup({
                id: triggerId,
                userId,
                title: "Shared reward persistence failed",
                code: result.code,
                message: result.message,
              });
            }
          }
          break;
        }
        case "spend_choice_token": {
          if (!selectedOpeningId) {
            success = false;
            error = "Select a locked opening before spending a choice token.";
            setErrorMessage(error);
            break;
          }
          const result = await spendChoiceTokenOnOpening({
            userId,
            openingId: selectedOpeningId,
            sourceEventId: idempotencyKey,
            now: nowIso(),
            syncRemote: target.remoteSyncEnabled,
          });
          success = result.applied;
          rewardGenerated = result.unlockedOpeningId ? `Unlocked ${result.unlockedOpeningId}` : "Choice token spend attempt";
          storageUpdated = "Reward inventory and repertoire unlock state";
          if (result.applied) {
            setStatusMessage(result.message);
            dispatchUnlockSuccessPopup({
              id: triggerId,
              userId,
              openingId: result.unlockedOpeningId ?? selectedOpeningId,
              openingName: result.unlockedOpeningId ?? selectedOpeningId,
              methodLabel: "Choice Token",
              before: {
                points: snapshotView.repertoire.availablePoints,
                fragments: snapshotView.rewardInventory.openingFragments,
                tokens: snapshotView.rewardInventory.choiceTokens,
              },
              after: {
                points: snapshotView.repertoire.availablePoints,
                fragments: snapshotView.rewardInventory.openingFragments,
                tokens: Math.max(0, snapshotView.rewardInventory.choiceTokens - 1),
              },
            });
          } else {
            setErrorMessage(result.message);
            if (result.code === "shared_sync_failed") {
              dispatchFailurePopup({
                id: triggerId,
                userId,
                title: "Shared reward persistence failed",
                code: result.code,
                message: result.message,
              });
            }
          }
          break;
        }
        case "unlock_next_opening_with_points": {
          const openingId = selectedOpeningId ?? snapshotView.repertoire.lockedOpeningIds[0] ?? null;
          if (!openingId) {
            success = false;
            error = "No locked openings remain.";
            setErrorMessage(error);
            break;
          }
          const result = await unlockAndPersistOpening({
            userId,
            openingId,
            starterPackId: snapshotView.repertoire.selectedStarterPackId,
            syncRemote: target.remoteSyncEnabled,
          });
          if (isRepertoireUnlockFailure(result)) {
            success = false;
            error = result.message;
            setErrorMessage(result.message);
            if (result.code === "shared_sync_failed") {
              dispatchFailurePopup({
                id: triggerId,
                userId,
                title: "Shared reward persistence failed",
                code: result.code,
                message: result.message,
              });
            }
          } else {
            success = true;
            rewardGenerated = `Unlocked ${openingId}`;
            storageUpdated = "Repertoire progress";
            setStatusMessage("Opening unlocked with points.");
            dispatchUnlockSuccessPopup({
              id: triggerId,
              userId,
              openingId,
              openingName: openingId,
              methodLabel: "Repertoire Points",
              before: {
                points: snapshotView.repertoire.availablePoints,
                fragments: snapshotView.rewardInventory.openingFragments,
                tokens: snapshotView.rewardInventory.choiceTokens,
              },
              after: {
                points: Math.max(0, snapshotView.repertoire.availablePoints - snapshotView.repertoire.nextUnlockCost),
                fragments: snapshotView.rewardInventory.openingFragments,
                tokens: snapshotView.rewardInventory.choiceTokens,
              },
            });
          }
          break;
        }
        case "simulate_opening_run_complete": {
          const result = await recordTempoRunCompleted({
            userId,
            openingId: selectedOpeningId ?? snapshotView.repertoire.unlockedOpeningIds[0] ?? "dev-tempo-opening",
            runSessionId: `${idempotencyKey}:sim`,
            terminalFen: "dev-tempo",
            completionIndex: snapshotView.daily.tempo.current + 1,
            dateKey: snapshotView.daily.localDate,
            repertoireProgress: snapshotView.repertoire,
            profile: snapshotView.profile,
            now: nowIso(),
          });
          const sharedSyncFailureMessage = getDailyRingSharedSyncFailureMessage(result);
          if (isDailyRingCompletionSuccess(result) && !sharedSyncFailureMessage) {
            success = true;
            nextTempoCacheState = result.tempoCacheState ?? nextTempoCacheState;
            rewardGenerated = result.rewardGrants?.map((grant) => grant.displayName).join(", ") || "Opening run simulated";
            storageUpdated = "Daily rings, reward history, and repertoire points";
            setStatusMessage("Opening run simulated.");
          } else {
            success = false;
            error = sharedSyncFailureMessage ?? (isDailyRingCompletionFailure(result) ? result.message : null) ?? "Opening run simulation failed.";
            rewardGenerated = "Reward persistence failed";
            storageUpdated = "Daily ring progress only";
            popupShown = sharedSyncFailureMessage ? "Shared reward sync failed" : popupShown;
            setErrorMessage(error);
          }
          break;
        }
        case "simulate_continuation_checkmate": {
          const result = await recordBatteryLineCompleted({
            userId,
            openingId: selectedOpeningId ?? snapshotView.repertoire.unlockedOpeningIds[0] ?? "dev-battery-opening",
            continuationRunId: `${idempotencyKey}:sim`,
            lineId: "dev-continuation",
            checkmateFen: "dev-continuation",
            completionIndex: snapshotView.daily.battery.current + 1,
            dateKey: snapshotView.daily.localDate,
            repertoireProgress: snapshotView.repertoire,
            profile: snapshotView.profile,
            now: nowIso(),
          });
          const sharedSyncFailureMessage = getDailyRingSharedSyncFailureMessage(result);
          if (isDailyRingCompletionSuccess(result) && !sharedSyncFailureMessage) {
            success = true;
            nextTempoCacheState = result.tempoCacheState ?? nextTempoCacheState;
            rewardGenerated = result.rewardGrants?.map((grant) => grant.displayName).join(", ") || "Continuation simulated";
            storageUpdated = "Daily rings, reward history, and repertoire points";
            setStatusMessage("Continuation checkmate simulated.");
          } else {
            success = false;
            error = sharedSyncFailureMessage ?? (isDailyRingCompletionFailure(result) ? result.message : null) ?? "Continuation checkmate simulation failed.";
            rewardGenerated = "Reward persistence failed";
            storageUpdated = "Daily ring progress only";
            popupShown = sharedSyncFailureMessage ? "Shared reward sync failed" : popupShown;
            setErrorMessage(error);
          }
          break;
        }
        case "simulate_daily_blundr_complete": {
          const result = await recordBlundrTaskCompleted({
            userId,
            deckId: "dev-deck",
            reviewSessionId: `${idempotencyKey}:sim`,
            taskId: "dev-blundr",
            completionIndex: snapshotView.daily.blundr.current + 1,
            dateKey: snapshotView.daily.localDate,
            repertoireProgress: snapshotView.repertoire,
            profile: snapshotView.profile,
            now: nowIso(),
          });
          const sharedSyncFailureMessage = getDailyRingSharedSyncFailureMessage(result);
          if (isDailyRingCompletionSuccess(result) && !sharedSyncFailureMessage) {
            success = true;
            nextTempoCacheState = result.tempoCacheState ?? nextTempoCacheState;
            rewardGenerated = result.rewardGrants?.map((grant) => grant.displayName).join(", ") || "Daily Blundr simulated";
            storageUpdated = "Daily rings, reward history, and repertoire points";
            setStatusMessage("Daily Blundr simulated.");
          } else {
            success = false;
            error = sharedSyncFailureMessage ?? (isDailyRingCompletionFailure(result) ? result.message : null) ?? "Daily Blundr simulation failed.";
            rewardGenerated = "Reward persistence failed";
            storageUpdated = "Daily ring progress only";
            popupShown = sharedSyncFailureMessage ? "Shared reward sync failed" : popupShown;
            setErrorMessage(error);
          }
          break;
        }
        case "simulate_review_item_complete": {
          recordLearningEvent({
            source: "review",
            type: "move_correct",
            sessionId: idempotencyKey,
            userId,
            metadata: {
              kind: "review_item_complete",
            },
          });
          rewardGenerated = "Learning event only";
          storageUpdated = "Learning events cache";
          setStatusMessage("Review item complete recorded.");
          break;
        }
        case "simulate_review_deck_complete": {
          recordLearningEvent({
            source: "review",
            type: "move_correct",
            sessionId: idempotencyKey,
            userId,
            metadata: {
              kind: "review_deck_complete",
            },
          });
          rewardGenerated = "Learning event only";
          storageUpdated = "Learning events cache";
          setStatusMessage("Review deck complete recorded.");
          break;
        }
        case "simulate_minigame_complete": {
          recordLearningEvent({
            source: "review",
            type: "move_correct",
            sessionId: idempotencyKey,
            userId,
            metadata: {
              kind: "minigame_complete",
            },
          });
          rewardGenerated = "Learning event only";
          storageUpdated = "Learning events cache";
          setStatusMessage("Minigame complete recorded.");
          break;
        }
        case "preview_clear": {
          setPreview({ kind: "none" });
          clearRewardPopupQueue();
          rewardGenerated = "Preview cleared";
          storageUpdated = "No storage change";
          popupShown = "None";
          setStatusMessage("Preview cleared.");
          const clearedEventId = createIdempotencyKey("preview_clear", userId);
          appendEventLog(
          buildEventLogEntry({
            id: clearedEventId,
            trigger: "preview_clear",
            action: "Preview cleared",
            rewardGenerated,
            storageUpdated,
            popupShown,
            persistenceTarget: persistenceTargetLabel,
            idempotencyKey: clearedEventId,
            beforeSummary: before,
            afterSummary: before,
            success: true,
            }),
          );
          setBusyAction(null);
          return;
        }
        case "reset_dev_reward_state": {
          resetLocalAccountState(userId);
          clearLocalLearningEvents();
          nextTempoCacheState = "closed";
          setTempoCacheState("closed");
          rewardGenerated = "Full local reset";
          storageUpdated = "Local account bundle and learning events";
          setStatusMessage("Dev reward state reset.");
          break;
        }
        case "reset_daily_rings_only": {
          resetLocalDailyRetentionProgress(userId, getDailyBlundrDateKey());
          rewardGenerated = "Daily rings reset";
          storageUpdated = "Daily retention progress";
          setStatusMessage("Daily rings reset.");
          break;
        }
        case "reset_streak_only": {
          resetLocalStreakRecord(userId);
          rewardGenerated = "Streak reset";
          storageUpdated = "Streak record";
          setStatusMessage("Streak reset.");
          break;
        }
        case "reset_reward_history_only": {
          resetLocalRewardHistory(userId);
          resetLocalRewardRolls(userId);
          rewardGenerated = "Reward history reset";
          storageUpdated = "Reward history";
          nextTempoCacheState = "closed";
          setTempoCacheState("closed");
          setStatusMessage("Reward history reset.");
          break;
        }
        case "reset_tempo_cache_only": {
          resetLocalRewardHistory(userId);
          resetLocalRewardRolls(userId);
          nextTempoCacheState = "closed";
          setTempoCacheState("closed");
          rewardGenerated = "Tempo Cache reset";
          storageUpdated = "Reward history and reward rolls";
          setStatusMessage("Tempo Cache reset.");
          break;
        }
        case "reset_repertoire_unlock_test_data_only": {
          resetLocalRepertoireState(userId);
          rewardGenerated = "Repertoire reset";
          storageUpdated = "Repertoire progress";
          setStatusMessage("Repertoire unlock test data reset.");
          break;
        }
        case "reset_opening_fragments_only": {
          const result = await resetOpeningFragmentsForDev({
            userId,
            sourceEventId: idempotencyKey,
            now: nowIso(),
            syncRemote: target.remoteSyncEnabled,
          });
          success = result.applied;
          rewardGenerated = "Opening fragments reset";
          storageUpdated = "Reward inventory";
          if (result.applied) {
            setStatusMessage(result.message);
          } else {
            error = result.message;
            setErrorMessage(result.message);
          }
          break;
        }
        case "reset_choice_tokens_only": {
          const result = await resetChoiceTokensForDev({
            userId,
            sourceEventId: idempotencyKey,
            now: nowIso(),
            syncRemote: target.remoteSyncEnabled,
          });
          success = result.applied;
          rewardGenerated = "Choice tokens reset";
          storageUpdated = "Reward inventory";
          if (result.applied) {
            setStatusMessage(result.message);
          } else {
            error = result.message;
            setErrorMessage(result.message);
          }
          break;
        }
        case "reset_learning_events_only": {
          clearLocalLearningEvents();
          rewardGenerated = "Learning events cleared";
          storageUpdated = "Learning events cache";
          setStatusMessage("Learning events reset.");
          break;
        }
        case "reward_popup_common":
          logPreview(triggerId, {
            kind: "reward",
            title: "Common reward",
            rarity: "common",
            rewardType: "unlock_points",
            amount: 10,
            description: "A normal point grant preview.",
          });
          return;
        case "reward_popup_uncommon":
          logPreview(triggerId, {
            kind: "reward",
            title: "Uncommon reward",
            rarity: "uncommon",
            rewardType: "opening_fragment",
            amount: 1,
            description: "Opening fragment added to inventory.",
          });
          return;
        case "reward_popup_rare":
          logPreview(triggerId, {
            kind: "reward",
            title: "Rare reward",
            rarity: "rare",
            rewardType: "choice_token",
            amount: 1,
            description: "Choice token added to inventory.",
          });
          return;
        case "reward_popup_epic":
          logPreview(triggerId, {
            kind: "reward",
            title: "Epic reward",
            rarity: "epic",
            rewardType: "unlock_points",
            amount: 100,
            description: "Large repertoire point bonus.",
          });
          return;
        case "opening_fragment_reward":
          logPreview(triggerId, {
            kind: "reward",
            title: "Opening Fragment",
            rarity: "uncommon",
            rewardType: "opening_fragment",
            amount: 1,
            description: "Collect 3 to choose a new opening.",
          });
          return;
        case "choice_token_reward":
          logPreview(triggerId, {
            kind: "reward",
            title: "Choice Token",
            rarity: "rare",
            rewardType: "choice_token",
            amount: 1,
            description: "Choose one locked opening to unlock.",
          });
          return;
        case "epic_bonus_reward":
          logPreview(triggerId, {
            kind: "reward",
            title: "Epic Bonus",
            rarity: "epic",
            rewardType: "unlock_points",
            amount: 100,
            description: "Epic bonus applied as repertoire points.",
          });
          return;
        case "repertoire_points_reward":
          logPreview(triggerId, {
            kind: "reward",
            title: "Repertoire Points",
            rarity: "common",
            rewardType: "unlock_points",
            amount: 25,
            description: "A steady progress grant for training.",
          });
          return;
        case "opening_unlock_popup":
          logPreview(triggerId, {
            kind: "opening_unlock",
            title: "Opening unlocked",
            description: selectedOpeningId ? `Spend fragments or a choice token to unlock ${selectedOpeningId}.` : "Select a locked opening first.",
            openingId: selectedOpeningId,
          });
          return;
        case "tempo_cache_closed":
          logPreview(triggerId, {
            kind: "tempo_cache",
            title: "Tempo Cache closed",
            variant: "C",
            description: "Preview the unopened state.",
          });
          return;
        case "tempo_cache_opening":
          logPreview(triggerId, {
            kind: "tempo_cache",
            title: "Tempo Cache opening",
            variant: "A",
            description: "Preview the opening state.",
          });
          return;
        case "tempo_cache_opened":
          logPreview(triggerId, {
            kind: "tempo_cache",
            title: "Tempo Cache opened",
            variant: "B",
            description: "Preview the reward revealed state.",
          });
          return;
        case "streak_popup":
          logPreview(triggerId, {
            kind: "streak",
            title: "Streak Popup",
            variant: currentStreakDays >= 7 ? "B" : currentStreakDays > 0 ? "A" : "C",
            description: currentStreakDays >= 7 ? "Weekly streak preview." : currentStreakDays > 0 ? "Active streak preview." : "Fresh streak preview.",
          });
          return;
        case "unlock_success_preview":
          logPreview(triggerId, {
            kind: "unlock_success",
            title: "Opening unlocked",
            openingId: selectedOpeningId ?? "preview-opening-id",
            openingName: selectedOpeningId ?? "preview-opening-id",
            methodLabel: "Repertoire Points",
            before: { points: snapshotView.repertoire.availablePoints, fragments: snapshotView.rewardInventory.openingFragments, tokens: snapshotView.rewardInventory.choiceTokens },
            after: {
              points: Math.max(0, snapshotView.repertoire.availablePoints - snapshotView.repertoire.nextUnlockCost),
              fragments: snapshotView.rewardInventory.openingFragments,
              tokens: snapshotView.rewardInventory.choiceTokens,
            },
            description: "Preview the selected opening unlock success state.",
          });
          return;
        case "shared_sync_failed_preview":
          logPreview(triggerId, {
            kind: "failure",
            title: "Shared reward persistence failed",
            code: "shared_sync_failed",
            message: "Shared reward persistence failed. Please retry.",
          });
          return;
        case "generic_reward_failure_preview":
          logPreview(triggerId, {
            kind: "failure",
            title: "Reward failed",
            code: "reward_failed",
            message: "The reward action could not be completed.",
          });
          return;
        case "admin_grant_success_preview":
          logPreview(triggerId, {
            kind: "admin_grant",
            title: "Admin grant applied",
            success: true,
            targetUserId: "preview-target-user",
            targetEmail: "target@example.com",
            grantType: "opening_fragment",
            amount: 1,
            reason: "QA preview",
            auditId: "preview-audit-id",
            beforeSummary: "fragments=0, tokens=0",
            afterSummary: "fragments=1, tokens=0",
            description: "Preview a successful admin grant.",
          });
          return;
        case "admin_grant_failure_preview":
          logPreview(triggerId, {
            kind: "admin_grant",
            title: "Admin grant failed",
            success: false,
            targetUserId: "preview-target-user",
            targetEmail: "target@example.com",
            grantType: "opening_fragment",
            amount: 1,
            reason: "QA preview",
            beforeSummary: "fragments=0, tokens=0",
            afterSummary: "No storage change",
            description: "Preview a failed admin grant.",
          });
          return;
        default:
          success = false;
          error = `Unknown trigger: ${triggerId}`;
          setErrorMessage(error);
          break;
      }

      if (success && popupShown === "None" && (effectiveTriggerId.startsWith("grant_") || effectiveTriggerId.includes("unlock") || effectiveTriggerId.startsWith("spend_"))) {
        popupShown = "Reward presentation published";
      }
      await refreshState(nextTempoCacheState, previewLabel);
      const after = loadSnapshot(userId, nextTempoCacheState, previewLabel);
      if (triggerId === "tempo_increment" || triggerId === "tempo_complete" || triggerId === "battery_increment" || triggerId === "battery_complete" || triggerId === "blundr_increment" || triggerId === "blundr_complete" || triggerId === "all_rings_celebration" || triggerId.startsWith("simulate_")) {
        setTempoCacheState(nextTempoCacheState);
      }
      if (triggerId === "grant_opening_fragment" || triggerId === "grant_3_opening_fragments" || triggerId === "grant_6_opening_fragments" || triggerId === "grant_choice_token" || triggerId === "spend_3_fragments" || triggerId === "spend_choice_token" || triggerId === "reset_opening_fragments_only" || triggerId === "reset_choice_tokens_only" || triggerId === "reset_dev_reward_state") {
        // No-op here; snapshot refresh handles local inventory state.
      }
      setSnapshot(after);
      appendEventLog(
        buildEventLogEntry({
          id: idempotencyKey,
          trigger: effectiveTriggerId,
          action:
            triggerId.startsWith("reset_")
              ? "Reset local state"
              : triggerId.startsWith("simulate_")
                ? "Simulated gameplay event"
                : triggerId.startsWith("grant_") || triggerId.startsWith("spend_") || triggerId.includes("unlock")
                  ? "Reward or repertoire mutation"
                  : "Daily ring bridge",
          rewardGenerated,
          storageUpdated,
          popupShown,
          persistenceTarget: persistenceTargetLabel,
          idempotencyKey,
          beforeSummary: before,
          afterSummary: afterSummary(after),
          success,
          error,
        }),
      );
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unknown rewards QA error.";
      setErrorMessage(message);
      appendEventLog(
        buildEventLogEntry({
          id: idempotencyKey,
          trigger: triggerId,
          action: "Unhandled error",
          rewardGenerated: "None",
          storageUpdated: "None",
          popupShown: previewLabel ?? "None",
          persistenceTarget: persistenceTargetLabel,
          idempotencyKey,
          beforeSummary: beforeSummary(),
          afterSummary: beforeSummary(),
          success: false,
          error: message,
        }),
      );
    } finally {
      mutationInFlightRef.current = false;
      setBusyAction(null);
    }
  }

  async function handleReset(resetId: string) {
    await handleAction(resetId);
  }

  return (
    <section className={className ?? "space-y-4"}>
      <header className="rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.22em] text-green-700">Developer tools</div>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-stone-950">Rewards Validation</h1>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Reward inventory, fragment unlocks, choice token unlocks, and popup previews for {userId}.
            </p>
          </div>
          <BlundrChip tone="stone" icon={<Sparkles size={13} />}>
            {mode}
          </BlundrChip>
        </div>
        <div className="mt-4 grid gap-2 text-sm text-stone-600">
          <div>User: <span className="font-black text-stone-900">{userId}</span></div>
          {email ? <div>Email: <span className="font-black text-stone-900">{email}</span></div> : null}
          <div>Local date: <span className="font-black text-stone-900">{snapshotView.daily.localDate}</span></div>
          <div>Persistence target: <span className="font-black text-stone-900">{persistenceTargetLabel}</span></div>
        </div>
      </header>

      {statusMessage ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-900 shadow-sm">{statusMessage}</div>
      ) : null}
      {errorMessage ? (
        <BlundrStateCard kind="error" eyebrow="Rewards QA" title="Action failed" copy={errorMessage} />
      ) : null}

      <RewardsTargetPanel target={target} />

      <RewardsValidationConsole
        mode={mode}
        snapshot={snapshotView}
        eventLog={eventLog}
        selectedOpeningId={selectedOpeningId}
        lockedOpeningIds={lockedOpeningIds}
        onSelectOpening={setSelectedOpeningId}
        onPreview={(previewState) => logPreview(`validation:${previewState.kind}`, previewState)}
        onExecuteVariableReward={executeVariableReward}
        onTrigger={(triggerId, options) => void handleAction(triggerId, options)}
        onRefresh={() => { void refreshState(tempoCacheState, previewLabel); }}
        stateExtras={<RewardsResetPanel onReset={(resetId) => void handleReset(resetId)} />}
        transactionExtras={mode === "developer_admin" ? <RewardsAdminGrantPanel target={target} adminUserId={userId} adminEmail={email} onRefreshState={async () => refreshState(tempoCacheState, previewLabel)} appendEventLog={appendEventLog} /> : null}
        dailyExtras={<RewardsEventLog entries={eventLog} onClear={() => setEventLog([])} onCopy={async () => { if (typeof navigator !== "undefined" && navigator.clipboard) await navigator.clipboard.writeText(JSON.stringify(eventLog, null, 2)); }} onRefresh={() => { void refreshState(tempoCacheState, previewLabel); }} />}
      />

    </section>
  );
}
