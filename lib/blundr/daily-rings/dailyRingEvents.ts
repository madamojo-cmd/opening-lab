import type { DailyRingActivitySource, DailyRingId } from "./dailyRingTypes";

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function safeIso(value: unknown, fallback = new Date().toISOString()): string {
  const text = normalizeText(value);
  if (!text) return fallback;
  const time = Date.parse(text);
  return Number.isFinite(time) ? new Date(time).toISOString() : fallback;
}

export function createDailyRingActivityEventId(args: {
  userId: string;
  localDate: string;
  source: DailyRingActivitySource;
  completionId: string;
  createdAt?: string;
}): string {
  return [
    normalizeText(args.userId) || "user",
    normalizeText(args.localDate) || "date",
    normalizeText(args.source) || "source",
    normalizeText(args.completionId) || "completion",
  ].join(":");
}

export function createAllRingsClosedEventId(userId: string, localDate: string): string {
  return `all-rings:${normalizeText(userId) || "user"}:${normalizeText(localDate) || "date"}`;
}

export function createStreakMilestoneEventId(userId: string, localDate: string, milestoneDays: 7 | 30, currentStreakDays: number): string {
  return [
    `streak-${milestoneDays}`,
    normalizeText(userId) || "user",
    normalizeText(localDate) || "date",
    Math.max(1, Number(currentStreakDays) || milestoneDays),
  ].join(":");
}

export function createDailyRingActivityCompletionId(args: {
  ringId: DailyRingId;
  source: DailyRingActivitySource;
  completionId: string;
}): string {
  return `${normalizeText(args.ringId) || "ring"}:${normalizeText(args.source) || "source"}:${normalizeText(args.completionId) || "completion"}`;
}

export function createDailyRingActivityEvent(args: {
  id?: string;
  userId: string;
  localDate: string;
  source: DailyRingActivitySource;
  ringId: DailyRingId;
  completionId: string;
  pointsAwarded: number;
  xpAwarded: number;
  createdAt?: string;
  openingId?: string;
  dailySessionId?: string;
}): {
  id: string;
  userId: string;
  localDate: string;
  source: DailyRingActivitySource;
  ringId: DailyRingId;
  completionId: string;
  pointsAwarded: number;
  xpAwarded: number;
  createdAt: string;
  openingId?: string;
  dailySessionId?: string;
} {
  const createdAt = safeIso(args.createdAt);
  return {
    id: args.id ?? createDailyRingActivityEventId({
      userId: args.userId,
      localDate: args.localDate,
      source: args.source,
      completionId: args.completionId,
      createdAt,
    }),
    userId: normalizeText(args.userId),
    localDate: normalizeText(args.localDate),
    source: args.source,
    ringId: args.ringId,
    completionId: normalizeText(args.completionId),
    pointsAwarded: Math.max(0, Number(args.pointsAwarded) || 0),
    xpAwarded: Math.max(0, Number(args.xpAwarded) || 0),
    createdAt,
    openingId: normalizeText(args.openingId) || undefined,
    dailySessionId: normalizeText(args.dailySessionId) || undefined,
  };
}
