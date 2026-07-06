import { BLUNDR_ANALYTICS_EVENTS } from "../analytics/blundrAnalyticsEvents";
import { trackBlundrAnalyticsEvent } from "../analytics/blundrAnalyticsService";
import { getLocalAccountCurrentUserId, getLocalDailyRetentionProgress, getLocalStreakRecord, getLocalTrainingProfile, setLocalAccountCurrentUserId, upsertLocalDailyRetentionProgress, upsertLocalStreakRecord } from "../accounts/localAccountStorage";
import type { DailyRetentionProgress, StreakRecord, UserTrainingProfile } from "../accounts/accountTypes";
import { getOnboardingAuthSession } from "../onboarding/onboardingAuth";
import { loadRepertoireProgress, earnAndPersistRepertoirePoints } from "../repertoire/repertoireProgressService";
import { getPointAwardForSource } from "../repertoire/repertoirePoints";
import { REWARD_CACHE_COPY } from "../rewards/rewardConstants";
import { evaluateTempoCacheRewards } from "../rewards/tempoCacheService";
import { getDailyBlundrDateKey } from "../daily/dailyBlundrStorage";
import { createAllRingsClosedEventId, createStreakMilestoneEventId } from "./dailyRingEvents";
import { createDefaultDailyRingDay, applyDailyRingActivity, getDailyRingPercent, getDailyRingSummary, isDailyRingClosed, areAllDailyRingsClosed } from "./dailyRingProgress";
import { applyAllRingsClosedDay, createDefaultStreakRecord, getStreakMilestoneBonuses, isConsecutiveLocalDateWrapper } from "../streaks/streakService";
import { createXpEvent, getXpAwardForAllRingsClosed, getXpAwardForStreakMilestone } from "../xp/xpService";
import type { DailyRingActivity, DailyRingCompletionFailure, DailyRingCompletionResult, DailyRingCompletionResultLike, DailyRingDayRecord, DailyRingSnapshot } from "./dailyRingTypes";
import type { RepertoireProgress } from "../repertoire/repertoireTypes";
import type { StreakProgressRecord } from "../streaks/streakTypes";

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + Math.max(0, Number(value) || 0), 0);
}

function toStreakProgressRecord(record: StreakRecord): StreakProgressRecord {
  return {
    userId: normalizeText(record.userId),
    currentStreakDays: Math.max(0, Number(record.currentStreak) || 0),
    longestStreakDays: Math.max(0, Number(record.longestStreak) || 0),
    totalAllRingsClosedDays: Math.max(0, Number(record.totalAllRingsClosedDays) || 0),
    lastCompletedLocalDate: normalizeText(record.lastCompletedLocalDate) || undefined,
    updatedAt: normalizeText(record.updatedAt) || nowIso(),
  };
}

function toAccountStreakRecord(record: StreakProgressRecord): StreakRecord {
  return {
    userId: normalizeText(record.userId),
    currentStreak: Math.max(0, Number(record.currentStreakDays) || 0),
    longestStreak: Math.max(0, Number(record.longestStreakDays) || 0),
    totalAllRingsClosedDays: Math.max(0, Number(record.totalAllRingsClosedDays) || 0),
    lastCompletedLocalDate: normalizeText(record.lastCompletedLocalDate) || undefined,
    updatedAt: normalizeText(record.updatedAt) || nowIso(),
  };
}

function toDailyRingDayRecord(progress: DailyRetentionProgress): DailyRingDayRecord {
  return {
    userId: normalizeText(progress.userId),
    localDate: normalizeText(progress.localDate),
    dailyTempo: {
      ringId: "daily_tempo",
      progress: Math.max(0, Number(progress.rings.dailyTempo.progress) || 0),
      goal: Math.max(1, Number(progress.rings.dailyTempo.goal) || 1),
      closed: Boolean(progress.rings.dailyTempo.completed),
      closedAt: progress.rings.dailyTempo.completedAt ?? undefined,
    },
    dailyBattery: {
      ringId: "daily_battery",
      progress: Math.max(0, Number(progress.rings.dailyBattery.progress) || 0),
      goal: Math.max(1, Number(progress.rings.dailyBattery.goal) || 1),
      closed: Boolean(progress.rings.dailyBattery.completed),
      closedAt: progress.rings.dailyBattery.completedAt ?? undefined,
    },
    dailyBlundr: {
      ringId: "daily_blundr",
      progress: Math.max(0, Number(progress.rings.dailyBlundr.progress) || 0),
      goal: Math.max(1, Number(progress.rings.dailyBlundr.goal) || 1),
      closed: Boolean(progress.rings.dailyBlundr.completed),
      closedAt: progress.rings.dailyBlundr.completedAt ?? undefined,
    },
    allRingsClosed: Boolean(progress.allRingsClosed),
    allRingsClosedAt: progress.allRingsClosedAt ?? progress.completedAt ?? undefined,
    xpEarnedToday: Math.max(0, Number(progress.xpEarned) || 0),
    repertoirePointsEarnedToday: Math.max(0, Number(progress.openingPointsEarned) || 0),
    activityEventIds: Array.from(new Set((progress.activityEventIds ?? []).map((entry) => normalizeText(entry)).filter(Boolean))),
    createdAt: progress.completedAt ?? progress.updatedAt,
    updatedAt: normalizeText(progress.updatedAt) || nowIso(),
  };
}

function toDailyRetentionProgress(dayRecord: DailyRingDayRecord, profile?: Pick<UserTrainingProfile, "dailyTempoGoal" | "dailyBatteryGoal" | "dailyBlundrGoal">): DailyRetentionProgress {
  const goals = profile ?? {
    dailyTempoGoal: dayRecord.dailyTempo.goal,
    dailyBatteryGoal: dayRecord.dailyBattery.goal,
    dailyBlundrGoal: dayRecord.dailyBlundr.goal,
  };
  return {
    userId: normalizeText(dayRecord.userId),
    localDate: normalizeText(dayRecord.localDate),
    rings: {
      dailyTempo: {
        type: "daily_tempo",
        goal: Math.max(1, Number(goals.dailyTempoGoal) || dayRecord.dailyTempo.goal),
        progress: Math.max(0, Number(dayRecord.dailyTempo.progress) || 0),
        completed: Boolean(dayRecord.dailyTempo.closed),
        completedAt: dayRecord.dailyTempo.closedAt ?? undefined,
      },
      dailyBattery: {
        type: "daily_battery",
        goal: Math.max(1, Number(goals.dailyBatteryGoal) || dayRecord.dailyBattery.goal),
        progress: Math.max(0, Number(dayRecord.dailyBattery.progress) || 0),
        completed: Boolean(dayRecord.dailyBattery.closed),
        completedAt: dayRecord.dailyBattery.closedAt ?? undefined,
      },
      dailyBlundr: {
        type: "daily_blundr",
        goal: Math.max(1, Number(goals.dailyBlundrGoal) || dayRecord.dailyBlundr.goal),
        progress: Math.max(0, Number(dayRecord.dailyBlundr.progress) || 0),
        completed: Boolean(dayRecord.dailyBlundr.closed),
        completedAt: dayRecord.dailyBlundr.closedAt ?? undefined,
      },
    },
    allRingsClosed: Boolean(dayRecord.allRingsClosed),
    allRingsClosedAt: dayRecord.allRingsClosedAt ?? undefined,
    xpEarned: Math.max(0, Number(dayRecord.xpEarnedToday) || 0),
    openingPointsEarned: Math.max(0, Number(dayRecord.repertoirePointsEarnedToday) || 0),
    streakEligible: Boolean(dayRecord.allRingsClosed),
    activityEventIds: Array.from(new Set(dayRecord.activityEventIds.map((entry) => normalizeText(entry)).filter(Boolean))),
    completedAt: dayRecord.allRingsClosedAt ?? undefined,
    updatedAt: normalizeText(dayRecord.updatedAt) || nowIso(),
  };
}

function syncDailyRingSnapshotLocally(dayRecord: DailyRingDayRecord, streakRecord: StreakProgressRecord, profile?: Pick<UserTrainingProfile, "dailyTempoGoal" | "dailyBatteryGoal" | "dailyBlundrGoal">): DailyRingSnapshot {
  const dailyProgress = toDailyRetentionProgress(dayRecord, profile);
  upsertLocalDailyRetentionProgress(dailyProgress);
  upsertLocalStreakRecord(toAccountStreakRecord(streakRecord));
  setLocalAccountCurrentUserId(dayRecord.userId);
  return {
    userId: dayRecord.userId,
    localDate: dayRecord.localDate,
    dayRecord,
    streakRecord,
    updatedAt: dayRecord.updatedAt,
  };
}

async function syncDailyRingSnapshotRemotely(dayRecord: DailyRingDayRecord, streakRecord: StreakProgressRecord, profile?: Pick<UserTrainingProfile, "dailyTempoGoal" | "dailyBatteryGoal" | "dailyBlundrGoal">): Promise<void> {
  const session = await getOnboardingAuthSession().catch(() => null);
  if (!session?.accessToken) return;
  try {
    const response = await fetch("/api/blundr/daily-rings/sync", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${session.accessToken}`,
      },
      cache: "no-store",
      body: JSON.stringify({
        dayRecord: toDailyRetentionProgress(dayRecord, profile),
        streakRecord: toAccountStreakRecord(streakRecord),
      }),
    });
    if (!response.ok) {
      return;
    }
  } catch {
    // Local progress stays authoritative if remote sync is unavailable.
  }
}

function buildFallbackFailure(code: string, message: string): DailyRingCompletionFailure {
  return {
    ok: false,
    code,
    message,
  };
}

function chooseTempoMessage(result: Pick<DailyRingCompletionResult, "source" | "ringClosedThisAction" | "allRingsClosedThisAction" | "streakMilestones" | "activityAlreadyApplied" | "rewardPointsAwarded">): string {
  if (result.activityAlreadyApplied) return "That rep already counted.";
  if (result.rewardPointsAwarded > 0) return REWARD_CACHE_COPY.intro;
  if (result.allRingsClosedThisAction) {
    return result.streakMilestones?.length ? "All three rings closed. Tempo approves." : "All three rings closed. Tempo approves.";
  }
  if (result.ringClosedThisAction) return "Nice. That rep counts.";
  if (result.source === "daily_blundr_deck_completed") return "That one goes into Daily Blundr if it needs review.";
  return "Your repertoire just got a little stronger.";
}

function chooseNextRecommendedAction(result: Pick<DailyRingCompletionResult, "allRingsClosedThisAction" | "dayRecord" | "source">): string {
  if (result.allRingsClosedThisAction) {
    return "Come back tomorrow to keep the streak alive.";
  }
  const incompleteRing = result.dayRecord.dailyTempo.closed
    ? result.dayRecord.dailyBattery.closed
      ? result.dayRecord.dailyBlundr.closed
        ? "daily_blundr"
        : "daily_blundr"
      : "daily_battery"
    : "daily_tempo";
  if (incompleteRing === "daily_tempo") return "Keep training your opening reps.";
  if (incompleteRing === "daily_battery") return "Play a few continuations next.";
  return result.source === "daily_blundr_deck_completed" ? "Train another opening or continuation to keep the loop moving." : "Open Daily Blundr if you want to review today’s misses.";
}

function buildSummaryLines(input: {
  source: DailyRingActivity["source"];
  ringClosedThisAction: boolean;
  allRingsClosedThisAction: boolean;
  repertoirePointsAwarded: number;
  rewardPointsAwarded: number;
  xpAwarded: number;
  streakMilestones: ReadonlyArray<{ milestoneDays: 7 | 30; pointsAwarded: number; xpAwarded: number }>;
  rewardSummaries?: readonly string[];
}): string[] {
  const lines: string[] = [];
  if (input.source === "opening_run_completed") {
    lines.push("Daily Tempo updated.");
  } else if (input.source === "continuation_completed") {
    lines.push("Daily Battery updated.");
  } else {
    lines.push("Daily Blundr updated.");
  }
  if (input.ringClosedThisAction) {
    lines.push("Ring closed.");
  }
  if (input.allRingsClosedThisAction) {
    lines.push("All rings closed.");
  }
  if (input.repertoirePointsAwarded > 0) {
    lines.push(`+${input.repertoirePointsAwarded} repertoire point${input.repertoirePointsAwarded === 1 ? "" : "s"}.`);
  }
  if (input.xpAwarded > 0) {
    lines.push(`+${input.xpAwarded} XP.`);
  }
  if (input.rewardPointsAwarded > 0) {
    lines.push(`+${input.rewardPointsAwarded} reward point${input.rewardPointsAwarded === 1 ? "" : "s"}.`);
  }
  for (const milestone of input.streakMilestones) {
    lines.push(`${milestone.milestoneDays}-day streak reached.`);
  }
  for (const rewardLine of input.rewardSummaries ?? []) {
    lines.push(rewardLine);
  }
  return lines;
}

export function loadDailyRingSnapshot(input: {
  userId?: string | null;
  localDate?: string | null;
  profile?: Pick<UserTrainingProfile, "dailyTempoGoal" | "dailyBatteryGoal" | "dailyBlundrGoal"> | null;
} = {}): DailyRingSnapshot {
  const userId = normalizeText(input.userId) || getLocalAccountCurrentUserId();
  const localDate = normalizeText(input.localDate) || getDailyBlundrDateKey();
  const profile = input.profile ?? getLocalTrainingProfile(userId);
  const existingDay = getLocalDailyRetentionProgress(userId, localDate);
  const existingStreak = getLocalStreakRecord(userId);
  const dayRecord = existingDay ? toDailyRingDayRecord(existingDay) : createDefaultDailyRingDay({
    userId,
    localDate,
    dailyTempoGoal: profile?.dailyTempoGoal,
    dailyBatteryGoal: profile?.dailyBatteryGoal,
    dailyBlundrGoal: profile?.dailyBlundrGoal,
  });
  const streakRecord = existingStreak ? toStreakProgressRecord(existingStreak) : createDefaultStreakRecord(userId);
  syncDailyRingSnapshotLocally(dayRecord, streakRecord, profile ?? undefined);
  return {
    userId,
    localDate,
    dayRecord,
    streakRecord,
    updatedAt: nowIso(),
  };
}

export function buildDailyRingCompletionResult(args: {
  userId: string;
  activity: DailyRingActivity;
  dayRecord?: DailyRingDayRecord | null;
  streakRecord?: StreakProgressRecord | null;
  repertoireProgress: RepertoireProgress;
  profile?: Pick<UserTrainingProfile, "dailyTempoGoal" | "dailyBatteryGoal" | "dailyBlundrGoal"> | null;
  now?: string;
}): DailyRingCompletionResult | DailyRingCompletionFailure {
  const now = normalizeText(args.now) || nowIso();
  const userId = normalizeText(args.userId) || normalizeText(args.activity.userId) || getLocalAccountCurrentUserId();
  if (!userId) {
    return buildFallbackFailure("missing_user", "A user id is required.");
  }
  const localDate = args.dayRecord?.localDate ?? getDailyBlundrDateKey();
  const profile = args.profile ?? getLocalTrainingProfile(userId) ?? undefined;
  const currentDay = args.dayRecord ?? createDefaultDailyRingDay({
    userId,
    localDate,
    dailyTempoGoal: profile?.dailyTempoGoal,
    dailyBatteryGoal: profile?.dailyBatteryGoal,
    dailyBlundrGoal: profile?.dailyBlundrGoal,
    now,
  });
  const currentStreak = args.streakRecord ?? createDefaultStreakRecord(userId);
  const baseResult = applyDailyRingActivity(currentDay, {
    ...args.activity,
    userId,
    createdAt: args.activity.createdAt ?? now,
  });

  const baseSummary = {
    userId,
    localDate,
    source: args.activity.source,
    dayRecord: baseResult.dayRecord,
    ringClosedThisAction: baseResult.ringClosedThisAction,
    allRingsClosedThisAction: baseResult.allRingsClosedThisAction,
    activityAlreadyApplied: baseResult.activityAlreadyApplied,
    repertoirePointsAwarded: baseResult.repertoirePointsAwarded,
    xpAwarded: baseResult.xpAwarded,
  } as const;

  if (baseResult.activityAlreadyApplied) {
    return {
      ok: true,
      userId,
      localDate,
      source: args.activity.source,
      dayRecord: baseResult.dayRecord,
      streakRecord: currentStreak,
      repertoireProgress: args.repertoireProgress,
      ringClosedThisAction: false,
      allRingsClosedThisAction: false,
      activityAlreadyApplied: true,
      repertoirePointsAwarded: 0,
      xpAwarded: 0,
      activityEvent: baseResult.activityEvent,
      pointAwards: [],
      xpEvents: [],
      rewardPointsAwarded: 0,
      rewardRolls: [],
      rewardGrants: [],
      rewardHistory: undefined,
      tempoCacheState: "closed",
      summaryTitle: "Already counted",
      summaryLines: ["Tempo already recorded this rep."],
      tempoMessage: "That rep already counted.",
      nextRecommendedAction: chooseNextRecommendedAction({
        allRingsClosedThisAction: false,
        dayRecord: baseResult.dayRecord,
        source: args.activity.source,
      } as DailyRingCompletionResult),
    };
  }

  let nextDayRecord = baseResult.dayRecord;
  let nextStreakRecord = currentStreak;
  let pointAwards = [...baseResult.pointAwards];
  let xpEvents = [...baseResult.xpEvents];
  const streakMilestones = [] as Array<{ milestoneDays: 7 | 30; pointsAwarded: number; xpAwarded: number; eventId: string }>;

  if (baseResult.allRingsClosedThisAction) {
    const allRingsEventId = createAllRingsClosedEventId(userId, localDate);
    if (!nextDayRecord.activityEventIds.includes(allRingsEventId)) {
      nextDayRecord = {
        ...nextDayRecord,
        allRingsClosed: true,
        allRingsClosedAt: nextDayRecord.allRingsClosedAt ?? now,
        activityEventIds: Array.from(new Set([...nextDayRecord.activityEventIds, allRingsEventId])),
        repertoirePointsEarnedToday: nextDayRecord.repertoirePointsEarnedToday + 10,
        xpEarnedToday: nextDayRecord.xpEarnedToday + getXpAwardForAllRingsClosed(),
        updatedAt: now,
      };
      pointAwards.push({
        id: allRingsEventId,
        source: "manual_dev_adjustment",
        points: 10,
        label: "All rings closed",
      });
      xpEvents.push(createXpEvent({
        userId,
        source: "all_rings_closed",
        xp: getXpAwardForAllRingsClosed(),
        createdAt: now,
        localDate,
        activityId: allRingsEventId,
      }));
    }

    nextStreakRecord = applyAllRingsClosedDay(currentStreak, localDate, now);
    const milestoneBonuses = getStreakMilestoneBonuses(nextStreakRecord, localDate);
    for (const milestone of milestoneBonuses) {
      if (nextDayRecord.activityEventIds.includes(milestone.eventId)) continue;
      streakMilestones.push(milestone);
      nextDayRecord = {
        ...nextDayRecord,
        activityEventIds: Array.from(new Set([...nextDayRecord.activityEventIds, milestone.eventId])),
        repertoirePointsEarnedToday: nextDayRecord.repertoirePointsEarnedToday + milestone.pointsAwarded,
        xpEarnedToday: nextDayRecord.xpEarnedToday + milestone.xpAwarded,
        updatedAt: now,
      };
      pointAwards.push({
        id: milestone.eventId,
        source: "manual_dev_adjustment",
        points: milestone.pointsAwarded,
        label: `${milestone.milestoneDays}-day streak`,
      });
      xpEvents.push(createXpEvent({
        userId,
        source: "streak_milestone",
        xp: milestone.xpAwarded,
        createdAt: now,
        localDate,
        milestoneDays: milestone.milestoneDays,
        activityId: milestone.eventId,
      }));
    }
  }

  const totalPointAwards = sum(pointAwards.map((entry) => entry.points));
  const totalXpAwarded = sum(xpEvents.map((entry) => entry.xp));
  const nextRepertoireProgress = args.repertoireProgress;

  return {
    ok: true,
    userId,
    localDate,
    source: args.activity.source,
    dayRecord: nextDayRecord,
    streakRecord: nextStreakRecord,
    repertoireProgress: nextRepertoireProgress,
    ringClosedThisAction: baseResult.ringClosedThisAction,
    allRingsClosedThisAction: baseResult.allRingsClosedThisAction,
    activityAlreadyApplied: false,
    repertoirePointsAwarded: totalPointAwards,
    xpAwarded: totalXpAwarded,
    activityEvent: baseResult.activityEvent,
    pointAwards,
    xpEvents,
    streakMilestone: streakMilestones[0],
    streakMilestones,
    summaryTitle: baseResult.allRingsClosedThisAction
      ? "All rings closed"
      : baseResult.ringClosedThisAction
        ? "Ring closed"
        : "Ring updated",
    summaryLines: buildSummaryLines({
      source: args.activity.source,
      ringClosedThisAction: baseResult.ringClosedThisAction,
      allRingsClosedThisAction: baseResult.allRingsClosedThisAction,
      repertoirePointsAwarded: totalPointAwards,
      rewardPointsAwarded: 0,
      xpAwarded: totalXpAwarded,
      streakMilestones,
    }),
    tempoMessage: chooseTempoMessage({
      source: args.activity.source,
      ringClosedThisAction: baseResult.ringClosedThisAction,
      allRingsClosedThisAction: baseResult.allRingsClosedThisAction,
      streakMilestones,
      activityAlreadyApplied: false,
      rewardPointsAwarded: 0,
    } as DailyRingCompletionResult),
    nextRecommendedAction: chooseNextRecommendedAction({
      allRingsClosedThisAction: baseResult.allRingsClosedThisAction,
      dayRecord: nextDayRecord,
      source: args.activity.source,
    } as DailyRingCompletionResult),
  };
}

export async function completeDailyRingActivity(args: {
  userId?: string | null;
  activity: DailyRingActivity;
  dayRecord?: DailyRingDayRecord | null;
  streakRecord?: StreakProgressRecord | null;
  repertoireProgress?: RepertoireProgress | null;
  profile?: Pick<UserTrainingProfile, "dailyTempoGoal" | "dailyBatteryGoal" | "dailyBlundrGoal"> | null;
  now?: string;
}): Promise<DailyRingCompletionResultLike> {
  const userId = normalizeText(args.userId) || normalizeText(args.activity.userId) || getLocalAccountCurrentUserId();
  if (!userId) {
    return buildFallbackFailure("missing_user", "A user id is required.");
  }

  const snapshot = loadDailyRingSnapshot({
    userId,
    profile: args.profile ?? undefined,
  });
  const repertoireProgress = args.repertoireProgress ?? loadRepertoireProgress({ userId });
  const result = buildDailyRingCompletionResult({
    userId,
    activity: {
      ...args.activity,
      userId,
    },
    dayRecord: args.dayRecord ?? snapshot.dayRecord,
    streakRecord: args.streakRecord ?? snapshot.streakRecord,
    repertoireProgress,
    profile: args.profile ?? getLocalTrainingProfile(userId) ?? undefined,
    now: args.now,
  });
  if (!result.ok) {
    return result;
  }

  syncDailyRingSnapshotLocally(result.dayRecord, result.streakRecord, args.profile ?? getLocalTrainingProfile(userId) ?? undefined);

  if (!result.activityAlreadyApplied) {
    for (const award of result.pointAwards) {
      const saved = await earnAndPersistRepertoirePoints({
        userId,
        source: award.source,
        points: award.points,
        openingId: award.openingId,
        dailySessionId: award.dailySessionId,
        completionId: award.id,
        starterPackId: repertoireProgress.selectedStarterPackId,
        now: args.now,
      });
      if (saved.ok) {
        result.repertoireProgress = saved.progress;
      }
    }
  }

  const rewardBatch = await evaluateTempoCacheRewards({
    userId,
    localDate: result.localDate,
    activitySource: args.activity.source,
    ringClosedThisAction: result.ringClosedThisAction,
    allRingsClosedThisAction: result.allRingsClosedThisAction,
    currentStreakDays: result.streakRecord.currentStreakDays,
    totalAllRingsClosedDays: result.streakRecord.totalAllRingsClosedDays,
    starterPackId: repertoireProgress.selectedStarterPackId,
    now: args.now,
  });

  result.rewardPointsAwarded = rewardBatch.rewardPointsAwarded;
  result.rewardRolls = rewardBatch.rewardRolls;
  result.rewardGrants = rewardBatch.rewardGrants;
  result.rewardHistory = rewardBatch.rewardHistory;
  result.tempoCacheState = rewardBatch.state;
  result.repertoirePointsAwarded += rewardBatch.rewardPointsAwarded;
  result.pointAwards = [
    ...result.pointAwards,
    ...rewardBatch.rewardGrants.map((grant) => ({
      id: grant.id,
      source: "reward_bonus" as const,
      points: grant.pointsApplied,
      label: grant.displayName,
    })),
  ];
  if (rewardBatch.rewardPointsAwarded > 0) {
    result.dayRecord = {
      ...result.dayRecord,
      repertoirePointsEarnedToday: result.dayRecord.repertoirePointsEarnedToday + rewardBatch.rewardPointsAwarded,
      updatedAt: args.now ?? result.dayRecord.updatedAt,
    };
    result.summaryLines = [
      ...result.summaryLines,
      ...rewardBatch.rewardGrants.map((grant) => `${grant.displayName} +${grant.pointsApplied} repertoire points.`),
    ];
    result.tempoMessage = REWARD_CACHE_COPY.intro;
  }

  const latestProgress = loadRepertoireProgress({ userId, now: args.now });
  result.repertoireProgress = latestProgress;

  syncDailyRingSnapshotLocally(result.dayRecord, result.streakRecord, args.profile ?? getLocalTrainingProfile(userId) ?? undefined);

  await syncDailyRingSnapshotRemotely(
    result.dayRecord,
    result.streakRecord,
    args.profile ?? getLocalTrainingProfile(userId) ?? undefined,
  );

  trackBlundrAnalyticsEvent(
    result.allRingsClosedThisAction
      ? BLUNDR_ANALYTICS_EVENTS.ALL_DAILY_RINGS_CLOSED
      : result.ringClosedThisAction
        ? args.activity.source === "opening_run_completed"
          ? BLUNDR_ANALYTICS_EVENTS.DAILY_TEMPO_RING_CLOSED
          : args.activity.source === "continuation_completed"
            ? BLUNDR_ANALYTICS_EVENTS.DAILY_BATTERY_RING_CLOSED
            : BLUNDR_ANALYTICS_EVENTS.DAILY_BLUNDR_RING_CLOSED
        : BLUNDR_ANALYTICS_EVENTS.DAILY_RINGS_CARD_VIEWED,
    {
      userId,
      localDate: result.localDate,
      activitySource: args.activity.source,
      ringClosedThisAction: result.ringClosedThisAction,
      allRingsClosedThisAction: result.allRingsClosedThisAction,
      repertoirePointsAwarded: result.repertoirePointsAwarded,
      xpAwarded: result.xpAwarded,
    },
  );

  if (result.streakMilestones?.length) {
    for (const milestone of result.streakMilestones) {
      trackBlundrAnalyticsEvent(BLUNDR_ANALYTICS_EVENTS.STREAK_MILESTONE_REACHED, {
        userId,
        localDate: result.localDate,
        milestoneDays: milestone.milestoneDays,
        pointsAwarded: milestone.pointsAwarded,
        xpAwarded: milestone.xpAwarded,
      });
    }
  }

  if (result.xpAwarded > 0) {
    trackBlundrAnalyticsEvent(BLUNDR_ANALYTICS_EVENTS.XP_EARNED, {
      userId,
      localDate: result.localDate,
      xpAwarded: result.xpAwarded,
    });
  }

  if (result.streakRecord.currentStreakDays > 0 && result.allRingsClosedThisAction) {
    trackBlundrAnalyticsEvent(BLUNDR_ANALYTICS_EVENTS.STREAK_INCREMENTED, {
      userId,
      localDate: result.localDate,
      currentStreakDays: result.streakRecord.currentStreakDays,
      longestStreakDays: result.streakRecord.longestStreakDays,
      totalAllRingsClosedDays: result.streakRecord.totalAllRingsClosedDays,
    });
  }

  return result;
}

export function getDailyRingSnapshotSummary(snapshot: DailyRingSnapshot): string {
  const closedCount = [snapshot.dayRecord.dailyTempo.closed, snapshot.dayRecord.dailyBattery.closed, snapshot.dayRecord.dailyBlundr.closed].filter(Boolean).length;
  return `${closedCount}/3 rings closed`;
}

export {
  createDefaultDailyRingDay,
  applyDailyRingActivity,
  isDailyRingClosed,
  areAllDailyRingsClosed,
  getDailyRingPercent,
  getDailyRingSummary,
};
