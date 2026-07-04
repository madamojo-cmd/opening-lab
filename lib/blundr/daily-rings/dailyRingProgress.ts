import { getDailyRingDefinition, getDailyRingDefinitionBySource, DAILY_RING_DEFINITIONS } from "./dailyRingConstants";
import { createDailyRingActivityCompletionId, createDailyRingActivityEvent, createDailyRingActivityEventId } from "./dailyRingEvents";
import { getPointAwardForSource } from "../repertoire/repertoirePoints";
import { createXpEvent, getXpAwardForActivity } from "../xp/xpService";
import type { DailyRingActivity, DailyRingApplicationResult, DailyRingDayRecord, DailyRingId, DailyRingProgress, DailyRingSummaryItem } from "./dailyRingTypes";

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeGoal(value: unknown, fallback: number): number {
  return Math.max(1, Number(value) || fallback);
}

function buildRingProgress(ringId: DailyRingId, goal: number): DailyRingProgress {
  return {
    ringId,
    progress: 0,
    goal: Math.max(1, goal),
    closed: false,
  };
}

function uniqueStrings(values: readonly string[]): string[] {
  return Array.from(new Set(values.map((value) => normalizeText(value)).filter(Boolean)));
}

function updateRingProgress(progress: DailyRingProgress): DailyRingProgress {
  const closed = progress.progress >= progress.goal;
  return {
    ...progress,
    closed,
    closedAt: closed ? progress.closedAt ?? nowIso() : progress.closedAt,
  };
}

export function createDefaultDailyRingDay(args: {
  userId: string;
  localDate: string;
  dailyTempoGoal?: number;
  dailyBatteryGoal?: number;
  dailyBlundrGoal?: number;
  now?: string;
}): DailyRingDayRecord {
  const now = normalizeText(args.now) || nowIso();
  return {
    userId: normalizeText(args.userId),
    localDate: normalizeText(args.localDate),
    dailyTempo: buildRingProgress("daily_tempo", normalizeGoal(args.dailyTempoGoal, getDailyRingDefinition("daily_tempo").defaultGoal)),
    dailyBattery: buildRingProgress("daily_battery", normalizeGoal(args.dailyBatteryGoal, getDailyRingDefinition("daily_battery").defaultGoal)),
    dailyBlundr: buildRingProgress("daily_blundr", normalizeGoal(args.dailyBlundrGoal, getDailyRingDefinition("daily_blundr").defaultGoal)),
    allRingsClosed: false,
    allRingsClosedAt: undefined,
    xpEarnedToday: 0,
    repertoirePointsEarnedToday: 0,
    activityEventIds: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function isDailyRingClosed(dayRecord: DailyRingDayRecord, ringId: DailyRingId): boolean {
  const ring = getRing(dayRecord, ringId);
  return Boolean(ring?.closed);
}

export function areAllDailyRingsClosed(dayRecord: DailyRingDayRecord): boolean {
  return Boolean(dayRecord.dailyTempo.closed && dayRecord.dailyBattery.closed && dayRecord.dailyBlundr.closed);
}

export function getDailyRingPercent(ring: DailyRingProgress): number {
  if (!ring.goal) return 0;
  return Math.max(0, Math.min(100, Math.round((Math.min(ring.progress, ring.goal) / ring.goal) * 100)));
}

export function getDailyRingSummary(dayRecord: DailyRingDayRecord): DailyRingSummaryItem[] {
  return DAILY_RING_DEFINITIONS.map((definition) => {
    const ring = getRing(dayRecord, definition.ringId);
    return {
      ringId: definition.ringId,
      label: definition.label,
      description: definition.description,
      progress: ring?.progress ?? 0,
      goal: ring?.goal ?? definition.defaultGoal,
      closed: Boolean(ring?.closed),
      percent: getDailyRingPercent(ring ?? buildRingProgress(definition.ringId, definition.defaultGoal)),
    };
  });
}

export function applyDailyRingActivity(dayRecord: DailyRingDayRecord, activity: DailyRingActivity): DailyRingApplicationResult {
  const normalizedActivity = normalizeActivity(dayRecord, activity);
  if (dayRecord.activityEventIds.includes(normalizedActivity.eventId)) {
    return {
      dayRecord,
      activityEvent: normalizedActivity.event,
      ringClosedThisAction: false,
      allRingsClosedThisAction: false,
      activityAlreadyApplied: true,
      repertoirePointsAwarded: 0,
      xpAwarded: 0,
      pointAwards: [],
      xpEvents: [],
    };
  }

  const ring = getRing(dayRecord, normalizedActivity.ringId);
  const beforeClosed = Boolean(ring?.closed);
  const nextRing: DailyRingProgress = updateRingProgress({
    ...ring,
    progress: (ring?.progress ?? 0) + 1,
  } as DailyRingProgress);
  const nextDayRecord: DailyRingDayRecord = {
    ...dayRecord,
    [normalizedActivity.ringId === "daily_tempo" ? "dailyTempo" : normalizedActivity.ringId === "daily_battery" ? "dailyBattery" : "dailyBlundr"]: nextRing,
    activityEventIds: uniqueStrings([...dayRecord.activityEventIds, normalizedActivity.eventId]),
    updatedAt: normalizedActivity.createdAt,
  } as DailyRingDayRecord;
  const allClosed = areAllDailyRingsClosed(nextDayRecord);
  if (allClosed && !dayRecord.allRingsClosed) {
    nextDayRecord.allRingsClosed = true;
    nextDayRecord.allRingsClosedAt = nextDayRecord.allRingsClosedAt ?? normalizedActivity.createdAt;
  }

  const basePoints = getPointAwardForSource(normalizedActivity.pointSource as Parameters<typeof getPointAwardForSource>[0]);
  const baseXp = getXpAwardForActivity(normalizedActivity.pointSource === "opening_run_completed" || normalizedActivity.pointSource === "continuation_completed" || normalizedActivity.pointSource === "daily_blundr_deck_completed"
    ? normalizedActivity.pointSource
    : "manual_dev_adjustment");
  const pointAwards = basePoints > 0
    ? [{
        id: normalizedActivity.eventId,
        source: normalizedActivity.pointSource,
        points: basePoints,
        openingId: normalizedActivity.activity.openingId,
        dailySessionId: normalizedActivity.activity.dailySessionId,
        label: normalizedActivity.ringLabel,
      }]
    : [];
  const xpEvents = baseXp > 0
    ? [createXpEvent({
        userId: normalizedActivity.activity.userId,
        source: normalizedActivity.xpSource,
        xp: baseXp,
        createdAt: normalizedActivity.createdAt,
        localDate: dayRecord.localDate,
        activityId: normalizedActivity.eventId,
      })]
    : [];

  return {
    dayRecord: {
      ...nextDayRecord,
      xpEarnedToday: nextDayRecord.xpEarnedToday + baseXp,
      repertoirePointsEarnedToday: nextDayRecord.repertoirePointsEarnedToday + basePoints,
    },
    activityEvent: normalizedActivity.event,
    ringClosedThisAction: !beforeClosed && nextRing.closed,
    allRingsClosedThisAction: allClosed && !dayRecord.allRingsClosed,
    activityAlreadyApplied: false,
    repertoirePointsAwarded: basePoints,
    xpAwarded: baseXp,
    pointAwards,
    xpEvents,
  };
}

function getRing(dayRecord: DailyRingDayRecord, ringId: DailyRingId): DailyRingProgress | null {
  if (ringId === "daily_tempo") return dayRecord.dailyTempo;
  if (ringId === "daily_battery") return dayRecord.dailyBattery;
  if (ringId === "daily_blundr") return dayRecord.dailyBlundr;
  return null;
}

function setRing(dayRecord: DailyRingDayRecord, ringId: DailyRingId, nextRing: DailyRingProgress): DailyRingDayRecord {
  if (ringId === "daily_tempo") return { ...dayRecord, dailyTempo: nextRing };
  if (ringId === "daily_battery") return { ...dayRecord, dailyBattery: nextRing };
  return { ...dayRecord, dailyBlundr: nextRing };
}

function normalizeActivity(dayRecord: DailyRingDayRecord, activity: DailyRingActivity) {
  const definition = getDailyRingDefinitionBySource(activity.source);
  const createdAt = normalizeText(activity.createdAt) || nowIso();
  const completionId = normalizeText(activity.completionId) || `${dayRecord.userId}:${dayRecord.localDate}:${definition.ringId}:${createdAt}`;
  const eventId = createDailyRingActivityEventId({
    userId: activity.userId,
    localDate: dayRecord.localDate,
    source: activity.source,
    completionId,
    createdAt,
  });
  return {
    activity: {
      ...activity,
      userId: normalizeText(activity.userId) || dayRecord.userId,
      completionId,
      createdAt,
    },
    eventId,
    event: createDailyRingActivityEvent({
      id: eventId,
      userId: normalizeText(activity.userId) || dayRecord.userId,
      localDate: dayRecord.localDate,
      source: activity.source,
      ringId: definition.ringId,
      completionId,
      createdAt,
      openingId: activity.openingId,
      dailySessionId: activity.dailySessionId,
      pointsAwarded: getPointAwardForSource(activity.source),
      xpAwarded: getXpAwardForActivity(activity.source),
    }),
    ringId: definition.ringId,
    ringLabel: definition.label,
    pointSource: activity.source,
    xpSource: activity.source as "opening_run_completed" | "continuation_completed" | "daily_blundr_deck_completed" | "manual_dev_adjustment",
    createdAt,
  };
}
