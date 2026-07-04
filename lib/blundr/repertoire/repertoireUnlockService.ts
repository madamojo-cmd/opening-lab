import { buildInitialRepertoireFromStarterPack, getDefaultStarterPack, getStarterPackById } from "../onboarding/starterPacks";
import { getEligibleRepertoireOpeningIds, buildLockedOpeningIds, getOpeningDisplayName, getOpeningSide } from "./repertoireOpeningPool";
import { createRepertoirePointEvent, getPointAwardForSource } from "./repertoirePoints";
import { createRepertoireUnlockEventId, normalizeRepertoireUnlockEvent, sortRepertoireUnlockEvents, getRepertoireUnlockSpendTotal, getRepertoirePointEventTotal, sortRepertoirePointEvents } from "./repertoireEvents";
import { getNextUnlockCost, getUnlockProgressPct } from "./repertoireUnlockCurve";
import type { StarterPackId } from "../accounts/accountTypes";
import type { RepertoireOpeningCard, RepertoirePointEvent, RepertoirePointSource, RepertoireProgress, RepertoireUnlockEvent, RepertoireUnlockResult } from "./repertoireTypes";

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeProgressEvents(progress: RepertoireProgress): RepertoireProgress {
  const unlockEvents = sortRepertoireUnlockEvents(progress.unlockEvents ?? []);
  const spentPoints = getRepertoireUnlockSpendTotal(unlockEvents);
  const availablePoints = Math.max(0, Number(progress.availablePoints) || 0);
  const pointEvents = sortRepertoirePointEvents(progress.pointEvents ?? []);
  const lifetimePoints = Math.max(availablePoints + spentPoints, getRepertoirePointEventTotal(pointEvents));
  const nextUnlockCost = getNextUnlockCost(progress);
  return {
    ...progress,
    spentPoints,
    lifetimePoints,
    nextUnlockCost,
    nextUnlockProgressPct: getUnlockProgressPct(progress),
    unlockEvents,
    pointEvents,
  };
}

function isStarterPackOpening(progress: RepertoireProgress, openingId: string): boolean {
  const pack = getStarterPackById(progress.selectedStarterPackId) ?? getDefaultStarterPack();
  const starterPackOpenings = new Set([pack.whiteOpeningId, pack.blackOpeningId].filter(Boolean));
  return starterPackOpenings.has(normalizeText(openingId));
}

function normalizeUnlockedOpenings(progress: RepertoireProgress, allOpeningIds: readonly string[]): string[] {
  const fallbackStarterPack = getStarterPackById(progress.selectedStarterPackId) ?? getDefaultStarterPack();
  const starterPackOpenings = [fallbackStarterPack.whiteOpeningId, fallbackStarterPack.blackOpeningId].map((entry) => normalizeText(entry)).filter(Boolean);
  const canonicalUnlocked = new Set([
    ...starterPackOpenings,
    ...progress.unlockedOpeningIds.map((openingId) => normalizeText(openingId)).filter(Boolean),
    ...sortRepertoireUnlockEvents(progress.unlockEvents).map((event) => normalizeText(event.openingId)).filter(Boolean),
  ]);
  return allOpeningIds.filter((openingId) => canonicalUnlocked.has(openingId));
}

export function createDefaultRepertoireProgress(args: {
  userId: string;
  starterPackId?: StarterPackId | null;
  allOpeningIds?: readonly string[];
  now?: string;
}): RepertoireProgress {
  const starterPack = getStarterPackById(args.starterPackId) ?? getDefaultStarterPack();
  const repertoire = buildInitialRepertoireFromStarterPack({
    userId: normalizeText(args.userId),
    starterPackId: starterPack.id,
    allOpeningIds: args.allOpeningIds ?? getEligibleRepertoireOpeningIds(),
    now: args.now ?? nowIso(),
  });
  return normalizeProgressEvents({
    userId: repertoire.userId,
    selectedStarterPackId: repertoire.selectedStarterPackId ?? starterPack.id,
    unlockedOpeningIds: repertoire.unlockedOpeningIds.slice(),
    lockedOpeningIds: repertoire.lockedOpeningIds.slice(),
    availablePoints: Math.max(0, Number(repertoire.openingUnlockPoints) || 0),
    lifetimePoints: Math.max(0, Number(repertoire.openingUnlockPoints) || 0),
    spentPoints: 0,
    nextUnlockCost: repertoire.lockedOpeningIds.length ? getNextUnlockCost({
      selectedStarterPackId: repertoire.selectedStarterPackId ?? starterPack.id,
      unlockedOpeningIds: repertoire.unlockedOpeningIds,
      lockedOpeningIds: repertoire.lockedOpeningIds,
      availablePoints: Math.max(0, Number(repertoire.openingUnlockPoints) || 0),
      lifetimePoints: Math.max(0, Number(repertoire.openingUnlockPoints) || 0),
      spentPoints: 0,
    } as Pick<RepertoireProgress, "selectedStarterPackId" | "unlockedOpeningIds" | "lockedOpeningIds" | "availablePoints">) : 0,
    nextUnlockProgressPct: repertoire.lockedOpeningIds.length ? 0 : 100,
    pointEvents: [],
    unlockEvents: [],
    updatedAt: args.now ?? nowIso(),
  });
}

export function isOpeningUnlocked(progress: RepertoireProgress, openingId: string): boolean {
  const normalized = normalizeText(openingId);
  return progress.unlockedOpeningIds.includes(normalized) || progress.unlockEvents.some((event) => event.openingId === normalized) || isStarterPackOpening(progress, normalized);
}

export function earnRepertoirePoints(progress: RepertoireProgress, event: RepertoirePointEvent): RepertoireProgress {
  const normalizedEvent = createRepertoirePointEvent({
    userId: event.userId,
    source: event.source as RepertoirePointSource,
    points: Math.max(0, Number(event.points) || getPointAwardForSource(event.source as RepertoirePointSource)),
    openingId: event.openingId,
    dailySessionId: event.dailySessionId,
    id: event.id,
    createdAt: event.createdAt,
  });
  if (progress.pointEvents.some((entry) => entry.id === normalizedEvent.id)) {
    return normalizeProgressEvents(progress);
  }
  const nextPointEvents = [...progress.pointEvents, normalizedEvent];
  return normalizeProgressEvents({
    ...progress,
    pointEvents: nextPointEvents,
    availablePoints: Math.max(0, progress.availablePoints + Math.max(0, normalizedEvent.points)),
    lifetimePoints: Math.max(0, progress.lifetimePoints + Math.max(0, normalizedEvent.points)),
    updatedAt: normalizedEvent.createdAt,
  });
}

export function unlockOpening(progress: RepertoireProgress, openingId: string): RepertoireUnlockResult {
  const normalizedOpeningId = normalizeText(openingId);
  if (!normalizedOpeningId) {
    return { ok: false, code: "opening_not_found", message: "Choose an opening to unlock." };
  }
  const allOpeningIds = getEligibleRepertoireOpeningIds();
  if (!allOpeningIds.includes(normalizedOpeningId)) {
    return { ok: false, code: "opening_not_found", message: "That opening is not available in the current repertoire pool." };
  }
  const normalizedProgress = normalizeProgressEvents(progress);
  if (!normalizedProgress.lockedOpeningIds.includes(normalizedOpeningId)) {
    return { ok: false, code: "opening_not_locked", message: "That opening is already unlocked." };
  }
  const unlockIndex = normalizedProgress.unlockEvents.length + 1;
  const pointsSpent = getNextUnlockCost(normalizedProgress);
  if (normalizedProgress.availablePoints < pointsSpent) {
    return { ok: false, code: "insufficient_points", message: "Keep training to unlock this opening." };
  }

  const unlockedOpeningIds = normalizeUnlockedOpenings(
    {
      ...normalizedProgress,
      unlockedOpeningIds: [...normalizedProgress.unlockedOpeningIds, normalizedOpeningId],
    },
    allOpeningIds,
  );
  const lockedOpeningIds = buildLockedOpeningIds(allOpeningIds, unlockedOpeningIds);
  const event: RepertoireUnlockEvent = normalizeRepertoireUnlockEvent({
    id: createRepertoireUnlockEventId({
      userId: normalizedProgress.userId,
      openingId: normalizedOpeningId,
      unlockIndex,
      createdAt: nowIso(),
    }),
    userId: normalizedProgress.userId,
    openingId: normalizedOpeningId,
    pointsSpent,
    unlockIndex,
    createdAt: nowIso(),
  }) ?? {
    id: createRepertoireUnlockEventId({
      userId: normalizedProgress.userId,
      openingId: normalizedOpeningId,
      unlockIndex,
      createdAt: nowIso(),
    }),
    userId: normalizedProgress.userId,
    openingId: normalizedOpeningId,
    pointsSpent,
    unlockIndex,
    createdAt: nowIso(),
  };
  const nextAvailablePoints = Math.max(0, normalizedProgress.availablePoints - pointsSpent);
  const nextUnlockEvents = sortRepertoireUnlockEvents([...normalizedProgress.unlockEvents, event]);
  const nextProgress = normalizeProgressEvents({
    ...normalizedProgress,
    availablePoints: nextAvailablePoints,
    spentPoints: normalizedProgress.spentPoints + pointsSpent,
    lifetimePoints: normalizedProgress.lifetimePoints,
    unlockedOpeningIds,
    lockedOpeningIds,
    unlockEvents: nextUnlockEvents,
    nextUnlockCost: getNextUnlockCost({
      ...normalizedProgress,
      unlockedOpeningIds,
      lockedOpeningIds,
      availablePoints: nextAvailablePoints,
    } as RepertoireProgress),
    nextUnlockProgressPct: getUnlockProgressPct({
      ...normalizedProgress,
      unlockedOpeningIds,
      lockedOpeningIds,
      availablePoints: nextAvailablePoints,
    } as RepertoireProgress),
    updatedAt: event.createdAt,
  });
  return {
    ok: true,
    progress: nextProgress,
    event,
  };
}

export function getUnlockedOpeningCards(progress: RepertoireProgress): RepertoireOpeningCard[] {
  return progress.unlockedOpeningIds.map((openingId, index) => ({
    openingId,
    openingName: getOpeningDisplayName(openingId),
    side: getOpeningSide(openingId),
    status: "unlocked",
    pointsCost: 0,
    unlockIndex: index + 1,
    availablePoints: progress.availablePoints,
    description: "Ready to train",
  }));
}

export function getLockedOpeningCards(progress: RepertoireProgress): RepertoireOpeningCard[] {
  const nextCost = getNextUnlockCost(progress);
  return progress.lockedOpeningIds.map((openingId) => ({
    openingId,
    openingName: getOpeningDisplayName(openingId),
    side: getOpeningSide(openingId),
    status: "locked",
    pointsCost: nextCost,
    availablePoints: progress.availablePoints,
    description: progress.availablePoints >= nextCost ? "Unlockable now" : "Keep training to unlock this opening.",
    reason: progress.availablePoints >= nextCost ? "Unlockable now" : "Keep training to unlock this opening.",
  }));
}
