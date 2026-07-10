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
import { notifyDailyRingRefresh } from "./dailyRingRefreshSignal";
import { createDefaultDailyRingDay, applyDailyRingActivity, getDailyRingPercent, getDailyRingSummary, isDailyRingClosed, areAllDailyRingsClosed } from "./dailyRingProgress";
import { applyAllRingsClosedDay, createDefaultStreakRecord, getStreakMilestoneBonuses, isConsecutiveLocalDateWrapper } from "../streaks/streakService";
import { createXpEvent, getXpAwardForAllRingsClosed, getXpAwardForStreakMilestone } from "../xp/xpService";
import type { DailyRingActivity, DailyRingCompletionFailure, DailyRingCompletionResult, DailyRingCompletionResultLike, DailyRingDayRecord, DailyRingProgress, DailyRingSnapshot, DailyRingSnapshotProgress } from "./dailyRingTypes";
import type { RepertoireProgress } from "../repertoire/repertoireTypes";
import type { StreakProgressRecord } from "../streaks/streakTypes";
import type { RewardBatchResult, RewardGrantRecord } from "../rewards/rewardTypes";

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + Math.max(0, Number(value) || 0), 0);
}

function normalizeDailyRingProgress(input: {
  ringId: "daily_tempo" | "daily_battery" | "daily_blundr";
  progress: number;
  goal: number;
  closed: boolean;
  closedAt?: string | null;
}): {
  ringId: "daily_tempo" | "daily_battery" | "daily_blundr";
  progress: number;
  goal: number;
  closed: boolean;
  closedAt?: string;
} {
  const goal = Math.max(1, Math.round(Number(input.goal) || 0) || 1);
  const progress = Math.max(0, Math.min(goal, Math.round(Number(input.progress) || 0)));
  const closed = progress >= goal;
  return {
    ringId: input.ringId,
    progress,
    goal,
    closed,
    closedAt: closed ? normalizeText(input.closedAt) || undefined : undefined,
  };
}

function buildDailyRingSnapshotProgress(ring: DailyRingProgress): DailyRingSnapshotProgress {
  return {
    current: Math.max(0, Math.round(Number(ring.progress) || 0)),
    target: Math.max(1, Math.round(Number(ring.goal) || 0) || 1),
    percent: getDailyRingPercent(ring),
    complete: Boolean(ring.closed),
  };
}

function canonicalizeDailyRingDayRecord(dayRecord: DailyRingDayRecord, profile?: Pick<UserTrainingProfile, "dailyTempoGoal" | "dailyBatteryGoal" | "dailyBlundrGoal">): DailyRingDayRecord {
  const tempoGoal = Math.max(1, Number(profile?.dailyTempoGoal) || dayRecord.dailyTempo.goal);
  const batteryGoal = Math.max(1, Number(profile?.dailyBatteryGoal) || dayRecord.dailyBattery.goal);
  const blundrGoal = Math.max(1, Number(profile?.dailyBlundrGoal) || dayRecord.dailyBlundr.goal);
  const dailyTempo = normalizeDailyRingProgress({
    ringId: "daily_tempo",
    progress: dayRecord.dailyTempo.progress,
    goal: tempoGoal,
    closed: dayRecord.dailyTempo.closed,
    closedAt: dayRecord.dailyTempo.closedAt ?? undefined,
  });
  const dailyBattery = normalizeDailyRingProgress({
    ringId: "daily_battery",
    progress: dayRecord.dailyBattery.progress,
    goal: batteryGoal,
    closed: dayRecord.dailyBattery.closed,
    closedAt: dayRecord.dailyBattery.closedAt ?? undefined,
  });
  const dailyBlundr = normalizeDailyRingProgress({
    ringId: "daily_blundr",
    progress: dayRecord.dailyBlundr.progress,
    goal: blundrGoal,
    closed: dayRecord.dailyBlundr.closed,
    closedAt: dayRecord.dailyBlundr.closedAt ?? undefined,
  });
  const allRingsClosed = dailyTempo.closed && dailyBattery.closed && dailyBlundr.closed;
  return {
    ...dayRecord,
    dailyTempo,
    dailyBattery,
    dailyBlundr,
    allRingsClosed,
    allRingsClosedAt: allRingsClosed ? normalizeText(dayRecord.allRingsClosedAt) || dayRecord.allRingsClosedAt : undefined,
  };
}

function buildDailyRingSnapshot(dayRecord: DailyRingDayRecord, streakRecord: StreakProgressRecord, updatedAt?: string): DailyRingSnapshot {
  const canonicalDayRecord = canonicalizeDailyRingDayRecord(dayRecord);
  const tempo = buildDailyRingSnapshotProgress(canonicalDayRecord.dailyTempo);
  const battery = buildDailyRingSnapshotProgress(canonicalDayRecord.dailyBattery);
  const blundr = buildDailyRingSnapshotProgress(canonicalDayRecord.dailyBlundr);
  return {
    userId: canonicalDayRecord.userId,
    localDate: canonicalDayRecord.localDate,
    dayRecord: canonicalDayRecord,
    streakRecord,
    tempo,
    battery,
    blundr,
    allComplete: tempo.complete && battery.complete && blundr.complete,
    updatedAt: normalizeText(updatedAt) || canonicalDayRecord.updatedAt,
  };
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

function toDailyRingDayRecord(progress: DailyRetentionProgress, profile?: Pick<UserTrainingProfile, "dailyTempoGoal" | "dailyBatteryGoal" | "dailyBlundrGoal">): DailyRingDayRecord {
  const tempoGoal = Math.max(1, Number(profile?.dailyTempoGoal) || Number(progress.rings.dailyTempo.goal) || 1);
  const batteryGoal = Math.max(1, Number(profile?.dailyBatteryGoal) || Number(progress.rings.dailyBattery.goal) || 1);
  const blundrGoal = Math.max(1, Number(profile?.dailyBlundrGoal) || Number(progress.rings.dailyBlundr.goal) || 1);
  return {
    userId: normalizeText(progress.userId),
    localDate: normalizeText(progress.localDate),
    dailyTempo: normalizeDailyRingProgress({
      ringId: "daily_tempo",
      progress: Number(progress.rings.dailyTempo.progress) || 0,
      goal: tempoGoal,
      closed: Boolean(progress.rings.dailyTempo.completed),
      closedAt: progress.rings.dailyTempo.completedAt ?? undefined,
    }),
    dailyBattery: normalizeDailyRingProgress({
      ringId: "daily_battery",
      progress: Number(progress.rings.dailyBattery.progress) || 0,
      goal: batteryGoal,
      closed: Boolean(progress.rings.dailyBattery.completed),
      closedAt: progress.rings.dailyBattery.completedAt ?? undefined,
    }),
    dailyBlundr: normalizeDailyRingProgress({
      ringId: "daily_blundr",
      progress: Number(progress.rings.dailyBlundr.progress) || 0,
      goal: blundrGoal,
      closed: Boolean(progress.rings.dailyBlundr.completed),
      closedAt: progress.rings.dailyBlundr.completedAt ?? undefined,
    }),
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
  const dailyTempo = normalizeDailyRingProgress({
    ringId: "daily_tempo",
    progress: dayRecord.dailyTempo.progress,
    goal: Math.max(1, Number(goals.dailyTempoGoal) || dayRecord.dailyTempo.goal),
    closed: Boolean(dayRecord.dailyTempo.closed),
    closedAt: dayRecord.dailyTempo.closedAt ?? undefined,
  });
  const dailyBattery = normalizeDailyRingProgress({
    ringId: "daily_battery",
    progress: dayRecord.dailyBattery.progress,
    goal: Math.max(1, Number(goals.dailyBatteryGoal) || dayRecord.dailyBattery.goal),
    closed: Boolean(dayRecord.dailyBattery.closed),
    closedAt: dayRecord.dailyBattery.closedAt ?? undefined,
  });
  const dailyBlundr = normalizeDailyRingProgress({
    ringId: "daily_blundr",
    progress: dayRecord.dailyBlundr.progress,
    goal: Math.max(1, Number(goals.dailyBlundrGoal) || dayRecord.dailyBlundr.goal),
    closed: Boolean(dayRecord.dailyBlundr.closed),
    closedAt: dayRecord.dailyBlundr.closedAt ?? undefined,
  });
  return {
    userId: normalizeText(dayRecord.userId),
    localDate: normalizeText(dayRecord.localDate),
    rings: {
      dailyTempo: {
        type: "daily_tempo",
        goal: dailyTempo.goal,
        progress: dailyTempo.progress,
        completed: dailyTempo.closed,
        completedAt: dailyTempo.closedAt ?? undefined,
      },
      dailyBattery: {
        type: "daily_battery",
        goal: dailyBattery.goal,
        progress: dailyBattery.progress,
        completed: dailyBattery.closed,
        completedAt: dailyBattery.closedAt ?? undefined,
      },
      dailyBlundr: {
        type: "daily_blundr",
        goal: dailyBlundr.goal,
        progress: dailyBlundr.progress,
        completed: dailyBlundr.closed,
        completedAt: dailyBlundr.closedAt ?? undefined,
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
  const canonicalDayRecord = canonicalizeDailyRingDayRecord(dayRecord, profile);
  const dailyProgress = toDailyRetentionProgress(canonicalDayRecord, profile);
  upsertLocalDailyRetentionProgress(dailyProgress);
  upsertLocalStreakRecord(toAccountStreakRecord(streakRecord));
  setLocalAccountCurrentUserId(dayRecord.userId);
  return buildDailyRingSnapshot(canonicalDayRecord, streakRecord, canonicalDayRecord.updatedAt);
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

function chooseTempoMessage(
  result: Pick<
    DailyRingCompletionResult,
    "source" | "ringClosedThisAction" | "allRingsClosedThisAction" | "streakMilestones" | "activityAlreadyApplied" | "rewardPointsAwarded" | "sharedSyncFailed" | "sharedSyncFailureMessage"
  > & {
    rewardGrantCount?: number;
  },
): string {
  if (result.activityAlreadyApplied) return "That rep already counted.";
  if (result.sharedSyncFailed) return result.sharedSyncFailureMessage ?? "Shared reward persistence failed. Please retry.";
  if (result.rewardPointsAwarded > 0 || (result.rewardGrantCount ?? 0) > 0) return REWARD_CACHE_COPY.intro;
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

function formatRewardGrantSummary(grant: RewardGrantRecord): string {
  if (grant.rewardType === "opening_fragment") {
    return `${grant.displayName} added to Opening Fragments.`;
  }
  if (grant.rewardType === "choice_token") {
    return `${grant.displayName} added to Choice Tokens.`;
  }
  return `${grant.displayName} +${grant.pointsApplied} repertoire points.`;
}

type TempoCacheRewardBatchLike = Pick<
  RewardBatchResult,
  | "rewardPointsAwarded"
  | "rewardRolls"
  | "rewardGrants"
  | "rewardHistory"
  | "state"
  | "sharedSyncFailed"
  | "sharedSyncFailureCode"
  | "sharedSyncFailureMessage"
>;

export function applyTempoCacheRewardBatchToDailyRingResult(
  result: DailyRingCompletionResult,
  rewardBatch: TempoCacheRewardBatchLike,
  updatedAt?: string | null,
): DailyRingCompletionResult {
  const rewardLanded = !rewardBatch.sharedSyncFailed && rewardBatch.rewardGrants.length > 0;

  result.rewardPointsAwarded = rewardLanded ? rewardBatch.rewardPointsAwarded : 0;
  result.rewardRolls = rewardBatch.rewardRolls;
  result.rewardGrants = rewardBatch.rewardGrants;
  result.rewardHistory = rewardBatch.rewardHistory;
  result.tempoCacheState = rewardBatch.state;
  result.sharedSyncFailed = rewardBatch.sharedSyncFailed;
  result.sharedSyncFailureCode = rewardBatch.sharedSyncFailureCode;
  result.sharedSyncFailureMessage = rewardBatch.sharedSyncFailureMessage;
  result.repertoirePointsAwarded += rewardLanded ? rewardBatch.rewardPointsAwarded : 0;

  if (rewardLanded) {
    result.pointAwards = [
      ...result.pointAwards,
      ...rewardBatch.rewardGrants.map((grant) => ({
        id: grant.id,
        source: "reward_bonus" as const,
        points: grant.pointsApplied,
        label: grant.displayName,
      })),
    ];
    result.dayRecord = {
      ...result.dayRecord,
      repertoirePointsEarnedToday: result.dayRecord.repertoirePointsEarnedToday + rewardBatch.rewardPointsAwarded,
      updatedAt: normalizeText(updatedAt) || result.dayRecord.updatedAt,
    };
    result.summaryLines = [
      ...result.summaryLines,
      ...rewardBatch.rewardGrants.map(formatRewardGrantSummary),
    ];
  } else if (rewardBatch.sharedSyncFailed) {
    const failureMessage = rewardBatch.sharedSyncFailureMessage ?? "Shared reward persistence failed. Please retry.";
    result.summaryLines = [...result.summaryLines, failureMessage];
  }

  result.tempoMessage = chooseTempoMessage({
    source: result.source,
    ringClosedThisAction: result.ringClosedThisAction,
    allRingsClosedThisAction: result.allRingsClosedThisAction,
    streakMilestones: result.streakMilestones,
    activityAlreadyApplied: result.activityAlreadyApplied,
    rewardPointsAwarded: result.rewardPointsAwarded,
    rewardGrantCount: rewardLanded ? rewardBatch.rewardGrants.length : 0,
    sharedSyncFailed: result.sharedSyncFailed,
    sharedSyncFailureMessage: result.sharedSyncFailureMessage,
  });

  return result;
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
  const dayRecord = existingDay ? toDailyRingDayRecord(existingDay, profile ?? undefined) : createDefaultDailyRingDay({
    userId,
    localDate,
    dailyTempoGoal: profile?.dailyTempoGoal,
    dailyBatteryGoal: profile?.dailyBatteryGoal,
    dailyBlundrGoal: profile?.dailyBlundrGoal,
  });
  const streakRecord = existingStreak ? toStreakProgressRecord(existingStreak) : createDefaultStreakRecord(userId);
  const canonicalDayRecord = canonicalizeDailyRingDayRecord(dayRecord, profile ?? undefined);
  return buildDailyRingSnapshot(canonicalDayRecord, streakRecord, canonicalDayRecord.updatedAt);
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
    rewardPointsAwarded: totalPointAwards,
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
  syncRemote?: boolean;
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
        syncRemote: args.syncRemote,
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
    syncRemote: args.syncRemote,
  });

  applyTempoCacheRewardBatchToDailyRingResult(result, rewardBatch, args.now);

  const latestProgress = loadRepertoireProgress({ userId, now: args.now });
  result.repertoireProgress = latestProgress;

  syncDailyRingSnapshotLocally(result.dayRecord, result.streakRecord, args.profile ?? getLocalTrainingProfile(userId) ?? undefined);

  if (args.syncRemote !== false) {
    await syncDailyRingSnapshotRemotely(
      result.dayRecord,
      result.streakRecord,
      args.profile ?? getLocalTrainingProfile(userId) ?? undefined,
    );
  }

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

  notifyDailyRingRefresh({
    userId,
    localDate: result.localDate,
    source: args.activity.source,
    activityEventId: result.activityEvent.id,
    ringId: result.activityEvent.ringId,
    ringClosedThisAction: result.ringClosedThisAction,
    allRingsClosedThisAction: result.allRingsClosedThisAction,
    updatedAt: result.dayRecord.updatedAt,
  });

  return result;
}

export function getDailyRingSnapshotSummary(snapshot: DailyRingSnapshot): string {
  const closedCount = [snapshot.tempo.complete, snapshot.battery.complete, snapshot.blundr.complete].filter(Boolean).length;
  return `${closedCount}/3 rings closed`;
}

type DailyRingCompletionWrapperArgs = {
  userId?: string | null;
  openingId?: string;
  dailySessionId?: string;
  completionId: string;
  dayRecord?: DailyRingDayRecord | null;
  streakRecord?: StreakProgressRecord | null;
  repertoireProgress?: RepertoireProgress | null;
  profile?: Pick<UserTrainingProfile, "dailyTempoGoal" | "dailyBatteryGoal" | "dailyBlundrGoal"> | null;
  now?: string;
  syncRemote?: boolean;
};

export async function markDailyTempoComplete(args: DailyRingCompletionWrapperArgs): Promise<DailyRingCompletionResultLike> {
  return completeDailyRingActivity({
    userId: args.userId,
    activity: {
      userId: normalizeText(args.userId) || getLocalAccountCurrentUserId(),
      source: "opening_run_completed",
      completionId: normalizeText(args.completionId),
      openingId: normalizeText(args.openingId) || undefined,
      dailySessionId: normalizeText(args.dailySessionId) || undefined,
      createdAt: args.now,
    },
    dayRecord: args.dayRecord ?? undefined,
    streakRecord: args.streakRecord ?? undefined,
    repertoireProgress: args.repertoireProgress ?? undefined,
    profile: args.profile ?? undefined,
    now: args.now,
    syncRemote: args.syncRemote,
  });
}

export async function markDailyBatteryComplete(args: DailyRingCompletionWrapperArgs): Promise<DailyRingCompletionResultLike> {
  return completeDailyRingActivity({
    userId: args.userId,
    activity: {
      userId: normalizeText(args.userId) || getLocalAccountCurrentUserId(),
      source: "continuation_completed",
      completionId: normalizeText(args.completionId),
      openingId: normalizeText(args.openingId) || undefined,
      dailySessionId: normalizeText(args.dailySessionId) || undefined,
      createdAt: args.now,
    },
    dayRecord: args.dayRecord ?? undefined,
    streakRecord: args.streakRecord ?? undefined,
    repertoireProgress: args.repertoireProgress ?? undefined,
    profile: args.profile ?? undefined,
    now: args.now,
    syncRemote: args.syncRemote,
  });
}

export async function markDailyBlundrComplete(args: DailyRingCompletionWrapperArgs): Promise<DailyRingCompletionResultLike> {
  return completeDailyRingActivity({
    userId: args.userId,
    activity: {
      userId: normalizeText(args.userId) || getLocalAccountCurrentUserId(),
      source: "daily_blundr_deck_completed",
      completionId: normalizeText(args.completionId),
      openingId: normalizeText(args.openingId) || undefined,
      dailySessionId: normalizeText(args.dailySessionId) || undefined,
      createdAt: args.now,
    },
    dayRecord: args.dayRecord ?? undefined,
    streakRecord: args.streakRecord ?? undefined,
    repertoireProgress: args.repertoireProgress ?? undefined,
    profile: args.profile ?? undefined,
    now: args.now,
    syncRemote: args.syncRemote,
  });
}

export {
  createDefaultDailyRingDay,
  applyDailyRingActivity,
  isDailyRingClosed,
  areAllDailyRingsClosed,
  getDailyRingPercent,
  getDailyRingSummary,
};
