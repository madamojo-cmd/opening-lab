import { createDailyRingActivityCompletionId } from "../daily-rings/dailyRingEvents";
import { DAILY_RING_XP_BONUSES } from "../daily-rings/dailyRingConstants";
import type { XpEvent, XpProgress, XpSource } from "./xpTypes";

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeXpAmount(value: unknown): number {
  return Math.max(0, Number(value) || 0);
}

export function getXpAwardForActivity(source: XpSource): number {
  switch (source) {
    case "opening_run_completed":
      return DAILY_RING_XP_BONUSES.openingRunCompleted;
    case "continuation_completed":
      return DAILY_RING_XP_BONUSES.continuationCompleted;
    case "daily_blundr_deck_completed":
      return DAILY_RING_XP_BONUSES.dailyBlundrDeckCompleted;
    case "all_rings_closed":
      return DAILY_RING_XP_BONUSES.allRingsClosed;
    case "streak_milestone":
      return 0;
    case "manual_dev_adjustment":
      return 0;
    default:
      return 0;
  }
}

export function getXpAwardForAllRingsClosed(): number {
  return DAILY_RING_XP_BONUSES.allRingsClosed;
}

export function getXpAwardForStreakMilestone(days: number): number {
  const normalized = Math.max(0, Math.floor(Number(days) || 0));
  if (normalized === 7) return DAILY_RING_XP_BONUSES.streak7;
  if (normalized === 30) return DAILY_RING_XP_BONUSES.streak30;
  return 0;
}

export function createXpEvent(args: {
  userId: string;
  source: XpSource;
  xp: number;
  createdAt?: string;
  localDate?: string;
  milestoneDays?: 7 | 30;
  activityId?: string;
  id?: string;
}): XpEvent {
  const createdAt = normalizeText(args.createdAt) || nowIso();
  const baseId = args.id ?? [
    normalizeText(args.userId) || "user",
    normalizeText(args.source) || "source",
    normalizeXpAmount(args.xp),
    normalizeText(args.localDate) || "date",
    normalizeText(args.milestoneDays) || "none",
    normalizeText(args.activityId) || "activity",
    createdAt,
  ].join(":");
  return {
    id: baseId,
    userId: normalizeText(args.userId),
    source: args.source,
    xp: normalizeXpAmount(args.xp),
    createdAt,
    localDate: normalizeText(args.localDate) || undefined,
    milestoneDays: args.milestoneDays,
    activityId: normalizeText(args.activityId) || undefined,
  };
}

export function applyXpEvent(progress: XpProgress, event: XpEvent): XpProgress {
  const normalizedEvent = createXpEvent({
    userId: event.userId,
    source: event.source,
    xp: event.xp,
    createdAt: event.createdAt,
    localDate: event.localDate,
    milestoneDays: event.milestoneDays,
    activityId: event.activityId,
    id: event.id,
  });
  const eventIds = Array.from(new Set([...(progress.eventIds ?? []), normalizedEvent.id]));
  if ((progress.eventIds ?? []).includes(normalizedEvent.id)) {
    return {
      ...progress,
      eventIds,
    };
  }
  return {
    ...progress,
    xpEarnedToday: Math.max(0, progress.xpEarnedToday + normalizedEvent.xp),
    xpLifetime: Math.max(0, progress.xpLifetime + normalizedEvent.xp),
    eventIds,
    updatedAt: normalizedEvent.createdAt,
  };
}

