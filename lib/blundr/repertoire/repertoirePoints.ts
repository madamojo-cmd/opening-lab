import { getNextUnlockCost } from "./repertoireUnlockCurve";
import { createRepertoirePointEventId, normalizeRepertoirePointEvent, sortRepertoirePointEvents } from "./repertoireEvents";
import type { RepertoirePointEvent, RepertoirePointSource, RepertoireProgress } from "./repertoireTypes";

export const REPERTOIRE_POINT_AWARDS = {
  openingRunCompleted: 1,
  continuationCompleted: 2,
  dailyBlundrDeckCompleted: 5,
} as const;

export function getPointAwardForSource(source: RepertoirePointSource): number {
  switch (source) {
    case "opening_run_completed":
      return REPERTOIRE_POINT_AWARDS.openingRunCompleted;
    case "continuation_completed":
      return REPERTOIRE_POINT_AWARDS.continuationCompleted;
    case "daily_blundr_deck_completed":
      return REPERTOIRE_POINT_AWARDS.dailyBlundrDeckCompleted;
    case "reward_bonus":
      return 0;
    case "manual_dev_adjustment":
      return 0;
    default:
      return 0;
  }
}

export function createRepertoirePointEvent(args: {
  userId: string;
  source: RepertoirePointSource;
  points?: number;
  openingId?: string;
  dailySessionId?: string;
  id?: string;
  createdAt?: string;
}): RepertoirePointEvent {
  const createdAt = args.createdAt ?? new Date().toISOString();
  return {
    id: args.id ?? createRepertoirePointEventId({
      userId: args.userId,
      source: args.source,
      points: args.points ?? getPointAwardForSource(args.source),
      openingId: args.openingId,
      dailySessionId: args.dailySessionId,
      createdAt,
    }),
    userId: String(args.userId).trim(),
    source: args.source,
    points: Math.max(0, Number(args.points ?? getPointAwardForSource(args.source)) || 0),
    openingId: args.openingId ? String(args.openingId).trim() : undefined,
    dailySessionId: args.dailySessionId ? String(args.dailySessionId).trim() : undefined,
    createdAt,
  };
}

export function applyRepertoirePointEvent(progress: RepertoireProgress, event: RepertoirePointEvent): RepertoireProgress {
  const normalizedProgress: RepertoireProgress = {
    ...progress,
    pointEvents: sortRepertoirePointEvents(progress.pointEvents ?? []),
    unlockEvents: progress.unlockEvents ?? [],
  };
  const normalizedEvent = normalizeRepertoirePointEvent(event);
  if (!normalizedEvent) return normalizedProgress;
  if (normalizedProgress.pointEvents.some((entry) => entry.id === normalizedEvent.id)) {
    return normalizedProgress;
  }
  const points = Math.max(0, Number(normalizedEvent.points) || 0);
  if (points <= 0) {
    return {
      ...normalizedProgress,
      pointEvents: sortRepertoirePointEvents([...normalizedProgress.pointEvents, normalizedEvent]),
    };
  }

  const nextPointEvents = sortRepertoirePointEvents([...normalizedProgress.pointEvents, normalizedEvent]);
  const nextAvailablePoints = Math.max(0, normalizedProgress.availablePoints + points);
  const nextLifetimePoints = Math.max(0, normalizedProgress.lifetimePoints + points);
  const nextNextUnlockCost = getNextUnlockCost({
    ...normalizedProgress,
    availablePoints: nextAvailablePoints,
  });
  const nextProgress: RepertoireProgress = {
    ...normalizedProgress,
    availablePoints: nextAvailablePoints,
    lifetimePoints: nextLifetimePoints,
    pointEvents: nextPointEvents,
    nextUnlockCost: nextNextUnlockCost,
    nextUnlockProgressPct: normalizedProgress.lockedOpeningIds.length > 0 ? Math.min(100, Math.max(0, Math.round((nextAvailablePoints / Math.max(1, nextNextUnlockCost)) * 100))) : 100,
    updatedAt: normalizedEvent.createdAt,
  };
  return nextProgress;
}
