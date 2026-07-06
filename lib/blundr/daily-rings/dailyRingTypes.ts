import type { RepertoirePointSource, RepertoireProgress } from "../repertoire/repertoireTypes";
import type { StreakProgressRecord } from "../streaks/streakTypes";
import type { XpEvent, XpSource } from "../xp/xpTypes";
import type { RewardGrantRecord, TempoCacheState } from "../rewards/rewardTypes";
import type { RewardRoll, UserRewardHistory } from "../accounts/accountTypes";

export type DailyRingId = "daily_tempo" | "daily_battery" | "daily_blundr";

export type DailyRingActivitySource =
  | "opening_run_completed"
  | "continuation_completed"
  | "daily_blundr_deck_completed";

export type DailyRingProgress = {
  ringId: DailyRingId;
  progress: number;
  goal: number;
  closed: boolean;
  closedAt?: string;
};

export type DailyRingActivityEvent = {
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
};

export type DailyRingDayRecord = {
  userId: string;
  localDate: string;
  dailyTempo: DailyRingProgress;
  dailyBattery: DailyRingProgress;
  dailyBlundr: DailyRingProgress;
  allRingsClosed: boolean;
  allRingsClosedAt?: string;
  xpEarnedToday: number;
  repertoirePointsEarnedToday: number;
  activityEventIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type DailyRingActivity = {
  userId: string;
  source: DailyRingActivitySource;
  completionId: string;
  openingId?: string;
  dailySessionId?: string;
  createdAt?: string;
};

export type DailyRingSnapshot = {
  userId: string;
  localDate: string;
  dayRecord: DailyRingDayRecord;
  streakRecord: StreakProgressRecord;
  updatedAt: string;
};

export type DailyRingSummaryItem = {
  ringId: DailyRingId;
  label: string;
  description: string;
  progress: number;
  goal: number;
  closed: boolean;
  percent: number;
};

export type DailyRingPointAward = {
  id: string;
  source: RepertoirePointSource;
  points: number;
  openingId?: string;
  dailySessionId?: string;
  label: string;
};

export type DailyRingXpAward = XpEvent;

export type DailyRingApplicationResult = {
  dayRecord: DailyRingDayRecord;
  activityEvent: DailyRingActivityEvent;
  ringClosedThisAction: boolean;
  allRingsClosedThisAction: boolean;
  activityAlreadyApplied: boolean;
  repertoirePointsAwarded: number;
  xpAwarded: number;
  pointAwards: DailyRingPointAward[];
  xpEvents: DailyRingXpAward[];
};

export type DailyRingCompletionResult = {
  ok: true;
  userId: string;
  localDate: string;
  source: DailyRingActivitySource;
  dayRecord: DailyRingDayRecord;
  streakRecord: StreakProgressRecord;
  repertoireProgress: RepertoireProgress;
  ringClosedThisAction: boolean;
  allRingsClosedThisAction: boolean;
  activityAlreadyApplied: boolean;
  repertoirePointsAwarded: number;
  rewardPointsAwarded: number;
  xpAwarded: number;
  activityEvent: DailyRingActivityEvent;
  pointAwards: DailyRingPointAward[];
  xpEvents: DailyRingXpAward[];
  rewardRolls?: RewardRoll[];
  rewardGrants?: RewardGrantRecord[];
  rewardHistory?: UserRewardHistory;
  tempoCacheState?: TempoCacheState;
  streakMilestone?: {
    milestoneDays: 7 | 30;
    pointsAwarded: number;
    xpAwarded: number;
    eventId: string;
  };
  streakMilestones?: Array<{
    milestoneDays: 7 | 30;
    pointsAwarded: number;
    xpAwarded: number;
    eventId: string;
  }>;
  summaryTitle: string;
  summaryLines: string[];
  tempoMessage: string;
  nextRecommendedAction: string;
};

export type DailyRingCompletionFailure = {
  ok: false;
  code: string;
  message: string;
};

export type DailyRingCompletionResultLike = DailyRingCompletionResult | DailyRingCompletionFailure;
