import { BLUNDR_ANALYTICS_EVENTS } from "../analytics/blundrAnalyticsEvents";
import { trackBlundrAnalyticsEvent } from "../analytics/blundrAnalyticsService";
import { getLocalAccountCurrentUserId, getLocalRepertoirePointEvents, getLocalRepertoireUnlockEvents, getLocalTrainingProfile, getLocalUserRepertoire, setLocalAccountCurrentUserId, appendLocalRepertoirePointEvent, appendLocalRepertoireUnlockEvent, upsertLocalUserRepertoire } from "../accounts/localAccountStorage";
import type { StarterPackId, UserRepertoire } from "../accounts/accountTypes";
import { getOnboardingAuthSession } from "../onboarding/onboardingAuth";
import { getDefaultStarterPack, getStarterPackById, getStarterPackOpeningIds } from "../onboarding/starterPacks";
import { buildLockedOpeningIds, getEligibleRepertoireOpeningIds, normalizeOpeningPool } from "./repertoireOpeningPool";
import { applyRepertoirePointEvent, createRepertoirePointEvent, getPointAwardForSource } from "./repertoirePoints";
import { createDefaultRepertoireProgress, isOpeningUnlocked, unlockOpening } from "./repertoireUnlockService";
import { getNextUnlockCost, getUnlockProgressPct } from "./repertoireUnlockCurve";
import { getRepertoirePointEventTotal, getRepertoireUnlockSpendTotal, normalizeRepertoirePointEvent, normalizeRepertoireUnlockEvent, sortRepertoirePointEvents, sortRepertoireUnlockEvents } from "./repertoireEvents";
import type { RepertoirePointEvent, RepertoirePointSource, RepertoireProgress, RepertoireUnlockEvent, RepertoireUnlockResult } from "./repertoireTypes";

type RepertoireProgressLoadOptions = {
  userId?: string | null;
  starterPackId?: StarterPackId | null;
  allOpeningIds?: readonly string[];
  now?: string;
};

type RepertoirePersistenceOptions = {
  syncRemote?: boolean;
};

type RepertoirePointAwardInput = RepertoireProgressLoadOptions & {
  source: RepertoirePointSource;
  points?: number;
  openingId?: string;
  dailySessionId?: string;
  completionId?: string;
};

type RepertoireUnlockRequest = RepertoireProgressLoadOptions & {
  openingId: string;
  syncRemote?: boolean;
};

type RepertoireProgressSnapshot = {
  progress: RepertoireProgress;
  repertoire: UserRepertoire;
};

type RepertoirePersistenceResult =
  | {
      ok: true;
      progress: RepertoireProgress;
      event: RepertoirePointEvent | RepertoireUnlockEvent;
    }
  | {
      ok: false;
      code: string;
      message: string;
      progress: RepertoireProgress;
    };

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function maxIso(values: readonly (string | null | undefined)[]): string {
  let latest = "";
  let latestTime = Number.NEGATIVE_INFINITY;
  for (const value of values) {
    const text = normalizeText(value);
    if (!text) continue;
    const time = Date.parse(text);
    if (!Number.isFinite(time)) continue;
    if (time >= latestTime) {
      latestTime = time;
      latest = new Date(time).toISOString();
    }
  }
  return latest || nowIso();
}

function resolveUserId(input?: string | null): string {
  const normalized = normalizeText(input);
  if (normalized) return normalized;
  return setLocalAccountCurrentUserId(getLocalAccountCurrentUserId());
}

function resolveStarterPackId(userId: string, starterPackId?: StarterPackId | null): StarterPackId {
  const profile = getLocalTrainingProfile(userId);
  const selected = getStarterPackById(starterPackId ?? profile?.selectedStarterPackId ?? null);
  return selected?.id ?? getDefaultStarterPack().id;
}

function getAllOpeningIds(allOpeningIds?: readonly string[]): string[] {
  const eligible = allOpeningIds && allOpeningIds.length > 0 ? allOpeningIds : getEligibleRepertoireOpeningIds();
  return normalizeOpeningPool(eligible);
}

function getStarterPackOpeningIdsForProgress(starterPackId: StarterPackId): string[] {
  const pack = getStarterPackById(starterPackId) ?? getDefaultStarterPack();
  const packOpenings = getStarterPackOpeningIds(pack.id);
  return normalizeOpeningPool([packOpenings.whiteOpeningId, packOpenings.blackOpeningId]);
}

function createSnapshotFromRepertoire(progress: RepertoireProgress): RepertoireProgressSnapshot {
  const repertoire: UserRepertoire = {
    userId: progress.userId,
    selectedStarterPackId: progress.selectedStarterPackId,
    unlockedOpeningIds: progress.unlockedOpeningIds.slice(),
    lockedOpeningIds: progress.lockedOpeningIds.slice(),
    openingUnlockPoints: Math.max(0, Number(progress.availablePoints) || 0),
    updatedAt: progress.updatedAt,
  };
  return { progress, repertoire };
}

function toStoredProgress(progress: RepertoireProgress, allOpeningIds?: readonly string[]): RepertoireProgress {
  const openingPool = getAllOpeningIds(allOpeningIds);
  const starterPackOpenings = getStarterPackOpeningIdsForProgress(progress.selectedStarterPackId);
  const pointEvents = sortRepertoirePointEvents(progress.pointEvents ?? []);
  const unlockEvents = sortRepertoireUnlockEvents(progress.unlockEvents ?? []);
  const cachedUnlocked = normalizeOpeningPool([
    ...starterPackOpenings,
    ...progress.unlockedOpeningIds,
    ...unlockEvents.map((event) => event.openingId),
  ]);
  const unlockedOpeningIds = normalizeOpeningPool([...openingPool, ...cachedUnlocked]).filter((openingId) => cachedUnlocked.includes(openingId));
  const lockedOpeningIds = buildLockedOpeningIds(openingPool, unlockedOpeningIds);
  const availableFromCache = Math.max(0, Number(progress.availablePoints) || 0);
  const earnedFromEvents = getRepertoirePointEventTotal(pointEvents);
  const spentFromEvents = getRepertoireUnlockSpendTotal(unlockEvents);
  const availablePoints = Math.max(0, Math.max(availableFromCache, earnedFromEvents - spentFromEvents));
  const lifetimePoints = Math.max(availablePoints + spentFromEvents, earnedFromEvents);
  const nextUnlockCost = getNextUnlockCost({
    selectedStarterPackId: progress.selectedStarterPackId,
    unlockedOpeningIds,
    lockedOpeningIds,
    availablePoints,
  });
  const normalized: RepertoireProgress = {
    ...progress,
    unlockedOpeningIds,
    lockedOpeningIds,
    availablePoints,
    lifetimePoints,
    spentPoints: spentFromEvents,
    nextUnlockCost,
    nextUnlockProgressPct: getUnlockProgressPct({
      selectedStarterPackId: progress.selectedStarterPackId,
      unlockedOpeningIds,
      lockedOpeningIds,
      availablePoints,
    }),
    pointEvents,
    unlockEvents,
    updatedAt: maxIso([progress.updatedAt, pointEvents.at(-1)?.createdAt, unlockEvents.at(-1)?.createdAt]),
  };
  return normalized;
}

async function syncProgressToBackend(progress: RepertoireProgress): Promise<void> {
  const session = await getOnboardingAuthSession().catch(() => null);
  if (!session?.accessToken) return;
  try {
    const response = await fetch("/api/blundr/repertoire/sync", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${session.accessToken}`,
      },
      cache: "no-store",
      body: JSON.stringify({ progress }),
    });
    if (!response.ok) {
      return;
    }
  } catch {
    // Local progress is still authoritative if backend sync is unavailable.
  }
}

function persistProgressLocally(progress: RepertoireProgress, allOpeningIds?: readonly string[]): RepertoireProgress {
  const normalized = toStoredProgress(progress, allOpeningIds);
  upsertLocalUserRepertoire({
    userId: normalized.userId,
    selectedStarterPackId: normalized.selectedStarterPackId,
    unlockedOpeningIds: normalized.unlockedOpeningIds.slice(),
    lockedOpeningIds: normalized.lockedOpeningIds.slice(),
    openingUnlockPoints: Math.max(0, Number(normalized.availablePoints) || 0),
    updatedAt: normalized.updatedAt,
  });
  for (const event of normalized.pointEvents) {
    appendLocalRepertoirePointEvent(event);
  }
  for (const event of normalized.unlockEvents) {
    appendLocalRepertoireUnlockEvent(event);
  }
  setLocalAccountCurrentUserId(normalized.userId);
  return normalized;
}

export function loadRepertoireProgress(input: RepertoireProgressLoadOptions = {}): RepertoireProgress {
  const userId = resolveUserId(input.userId);
  const starterPackId = resolveStarterPackId(userId, input.starterPackId ?? null);
  const allOpeningIds = getAllOpeningIds(input.allOpeningIds);
  const now = input.now ?? nowIso();
  const existingRepertoire = getLocalUserRepertoire(userId);
  if (!existingRepertoire) {
    const defaultProgress = createDefaultRepertoireProgress({
      userId,
      starterPackId,
      allOpeningIds,
      now,
    });
    const normalized = persistProgressLocally(defaultProgress, allOpeningIds);
    return normalized;
  }

  const pointEvents = sortRepertoirePointEvents(getLocalRepertoirePointEvents(userId));
  const unlockEvents = sortRepertoireUnlockEvents(getLocalRepertoireUnlockEvents(userId));
  const starterPackOpenings = getStarterPackOpeningIdsForProgress(starterPackId);
  const unlockedOpeningIds = normalizeOpeningPool([
    ...starterPackOpenings,
    ...existingRepertoire.unlockedOpeningIds,
    ...unlockEvents.map((event) => event.openingId),
  ]);
  const lockedOpeningIds = buildLockedOpeningIds(allOpeningIds, unlockedOpeningIds);
  const availableFromCache = Math.max(0, Number(existingRepertoire.openingUnlockPoints) || 0);
  const earnedFromEvents = getRepertoirePointEventTotal(pointEvents);
  const spentFromEvents = getRepertoireUnlockSpendTotal(unlockEvents);
  const availablePoints = Math.max(0, Math.max(availableFromCache, earnedFromEvents - spentFromEvents));
  const lifetimePoints = Math.max(earnedFromEvents, availablePoints + spentFromEvents);
  const progress: RepertoireProgress = {
    userId,
    selectedStarterPackId: starterPackId,
    unlockedOpeningIds,
    lockedOpeningIds,
    availablePoints,
    lifetimePoints,
    spentPoints: spentFromEvents,
    nextUnlockCost: getNextUnlockCost({
      selectedStarterPackId: starterPackId,
      unlockedOpeningIds,
      lockedOpeningIds,
      availablePoints,
    }),
    nextUnlockProgressPct: getUnlockProgressPct({
      selectedStarterPackId: starterPackId,
      unlockedOpeningIds,
      lockedOpeningIds,
      availablePoints,
    }),
    pointEvents,
    unlockEvents,
    updatedAt: maxIso([existingRepertoire.updatedAt, pointEvents.at(-1)?.createdAt, unlockEvents.at(-1)?.createdAt, now]),
  };
  const normalized = persistProgressLocally(progress, allOpeningIds);
  return normalized;
}

export async function saveRepertoireProgress(progress: RepertoireProgress, options: RepertoirePersistenceOptions = {}): Promise<RepertoireProgress> {
  const normalized = persistProgressLocally(progress);
  if (options.syncRemote !== false) {
    await syncProgressToBackend(normalized);
  }
  return normalized;
}

export function recordRepertoirePointEvent(event: RepertoirePointEvent): RepertoirePointEvent {
  const normalized = normalizeRepertoirePointEvent(event) ?? createRepertoirePointEvent(event);
  appendLocalRepertoirePointEvent(normalized);
  return normalized;
}

export function recordRepertoireUnlockEvent(event: RepertoireUnlockEvent): RepertoireUnlockEvent {
  const normalized = normalizeRepertoireUnlockEvent(event);
  if (!normalized) {
    const fallback: RepertoireUnlockEvent = {
      id: normalizeText(event.id) || `${normalizeText(event.userId)}:${normalizeText(event.openingId)}:${nowIso()}`,
      userId: normalizeText(event.userId),
      openingId: normalizeText(event.openingId),
      pointsSpent: Math.max(0, Number(event.pointsSpent) || 0),
      unlockIndex: Math.max(1, Number(event.unlockIndex) || 1),
      createdAt: normalizeText(event.createdAt) || nowIso(),
    };
    appendLocalRepertoireUnlockEvent(fallback);
    return fallback;
  }
  appendLocalRepertoireUnlockEvent(normalized);
  return normalized;
}

export async function earnAndPersistRepertoirePoints(input: RepertoirePointAwardInput): Promise<RepertoirePersistenceResult> {
  const userId = resolveUserId(input.userId);
  const current = loadRepertoireProgress({
    userId,
    starterPackId: input.starterPackId ?? null,
    allOpeningIds: input.allOpeningIds,
    now: input.now,
  });
  const event = createRepertoirePointEvent({
    userId,
    source: input.source,
    points: Math.max(0, Number(input.points) || getPointAwardForSource(input.source)),
    openingId: input.openingId,
    dailySessionId: input.dailySessionId,
    id: input.completionId ? normalizeText(input.completionId) : undefined,
    createdAt: input.now ?? nowIso(),
  });
  const nextProgress = applyRepertoirePointEvent(current, event);
  const saved = await saveRepertoireProgress(nextProgress);
  trackBlundrAnalyticsEvent(BLUNDR_ANALYTICS_EVENTS.OPENING_UNLOCK_PROGRESS_EARNED, {
    userId,
    source: input.source,
    points: event.points,
    openingId: input.openingId ?? null,
    dailySessionId: input.dailySessionId ?? null,
    availablePoints: saved.availablePoints,
    lifetimePoints: saved.lifetimePoints,
  });
  return {
    ok: true,
    progress: saved,
    event,
  };
}

export async function unlockAndPersistOpening(input: RepertoireUnlockRequest): Promise<RepertoireUnlockResult> {
  const userId = resolveUserId(input.userId);
  const current = loadRepertoireProgress({
    userId,
    starterPackId: input.starterPackId ?? null,
    allOpeningIds: input.allOpeningIds,
    now: input.now,
  });
  const result = unlockOpening(current, input.openingId);
  if (!result.ok) {
    return result;
  }
  const saved = await saveRepertoireProgress(result.progress, { syncRemote: input.syncRemote });
  trackBlundrAnalyticsEvent(BLUNDR_ANALYTICS_EVENTS.OPENING_UNLOCKED, {
    userId,
    openingId: input.openingId,
    pointsSpent: result.event.pointsSpent,
    unlockIndex: result.event.unlockIndex,
    availablePoints: saved.availablePoints,
    lifetimePoints: saved.lifetimePoints,
  });
  return {
    ok: true,
    progress: saved,
    event: result.event,
  };
}

export function getRepertoireProgressSnapshot(input: RepertoireProgressLoadOptions = {}): RepertoireProgressSnapshot {
  const progress = loadRepertoireProgress(input);
  return createSnapshotFromRepertoire(progress);
}

export { isOpeningUnlocked, getUnlockedOpeningCards, getLockedOpeningCards } from "./repertoireUnlockService";
