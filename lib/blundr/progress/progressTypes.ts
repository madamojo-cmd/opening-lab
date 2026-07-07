import type { DailyRingSnapshot } from "../daily-rings/dailyRingTypes";
import type { DailyBlundrOverview } from "../daily/dailyBlundrReadModel";
import type { RepertoireProgress } from "../repertoire/repertoireTypes";

export type BlundrProgressSnapshot = {
  userId: string;
  generatedAt: string;
  todayDateKey: string;
  ringSnapshot: DailyRingSnapshot;
  dailyBlundrOverview: DailyBlundrOverview;
  repertoireProgress: RepertoireProgress;
};

export type BlundrProgressRingSummary = {
  ringId: "daily_tempo" | "daily_battery" | "daily_blundr";
  label: string;
  progress: number;
  goal: number;
  percent: number;
  closed: boolean;
};

export type BlundrProgressWeekDay = {
  localDate: string;
  label: string;
  hasTraining: boolean;
  allRingsClosed: boolean;
  reviewCount: number;
};

export type BlundrProgressInsight = {
  title: string;
  message: string;
  detail?: string;
};

export type BlundrProgressActivityItem = {
  key: string;
  title: string;
  message: string;
  localDate: string;
  href?: string;
  tone?: "neutral" | "positive" | "warning";
};

export type BlundrProgressNextAction = {
  title: string;
  href: string;
  description: string;
};

export type BlundrProgressSummary = {
  userId: string;
  generatedAt: string;
  todayDateKey: string;
  today: {
    rings: BlundrProgressRingSummary[];
    allRingsClosed: boolean;
    nextBestAction: string;
  };
  streak: {
    currentDays: number;
    bestDays: number;
    totalAllRingsClosedDays: number;
    daysTrainedThisWeek: number;
    week: BlundrProgressWeekDay[];
  };
  trainingVolume: {
    openingRunsToday: number;
    openingRunsWeek: number;
    batteryToday: number;
    batteryWeek: number;
    dailyBlundrToday: number;
    dailyBlundrWeek: number;
    reviewAttemptsToday: number;
    reviewAttemptsWeek: number;
    minigamesToday: number;
    minigamesWeek: number;
  };
  accuracy: {
    correct: number;
    incorrect: number;
    accuracyPct: number | null;
    enoughData: boolean;
    message: string;
  };
  repertoire: {
    unlockedOpenings: number;
    lockedOpenings: number;
    availablePoints: number;
    nextUnlockCost: number;
    nextUnlockProgressPct: number;
    mostTrainedOpeningId: string | null;
    mostTrainedOpeningName: string | null;
    recommendedOpeningId: string | null;
    recommendedOpeningName: string | null;
  };
  weakAreas: {
    items: Array<{
      openingId: string;
      openingName: string;
      misses: number;
    }>;
    message: string;
  };
  milestones: BlundrProgressInsight[];
  recentActivity: BlundrProgressActivityItem[];
  nextActions: BlundrProgressNextAction[];
};
