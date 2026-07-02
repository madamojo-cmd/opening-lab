import type { DailyBlundrSession } from "./dailyBlundrTypes";
import type {
  DailyBlundrReviewAttempt,
  DailyBlundrReviewCard,
} from "./dailyBlundrReviewTypes";
import type { DailyBlundrReviewDeckBuildResult } from "./dailyBlundrReviewSelector";

export type DailyBlundrReviewStats = {
  totalReviewCards: number;
  dueToday: number;
  overdue: number;
  completedToday: number;
  savedForReview: number;
  mastered: number;
  leech: number;
  suspended: number;
  readyToday: number;
  selectedToday: number;
};

export type DailyBlundrReviewStatsInput = {
  reviewCards: readonly DailyBlundrReviewCard[];
  reviewAttempts: readonly DailyBlundrReviewAttempt[];
  currentSession?: DailyBlundrSession | null;
  deck?: Pick<DailyBlundrReviewDeckBuildResult, "dueReviewCount" | "selectedReviewCards" | "selectionMode"> | null;
  now?: string;
};

function getLocalDateKey(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseIso(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function isDue(card: DailyBlundrReviewCard, nowMs: number): boolean {
  return parseIso(card.dueAt) <= nowMs;
}

export function buildDailyBlundrReviewStats(input: DailyBlundrReviewStatsInput): DailyBlundrReviewStats {
  const now = normalizeText(input.now) || new Date().toISOString();
  const nowMs = parseIso(now);
  const todayDateKey = getLocalDateKey(new Date(nowMs || Date.now()));
  const totalReviewCards = input.reviewCards.length;
  const mastered = input.reviewCards.filter((card) => card.status === "mastered").length;
  const leech = input.reviewCards.filter((card) => card.status === "leech").length;
  const suspended = input.reviewCards.filter((card) => card.status === "suspended").length;
  const overdue = input.reviewCards.filter((card) => isDue(card, nowMs) && card.status !== "suspended").length;
  const dueToday = input.deck?.dueReviewCount ?? input.deck?.selectedReviewCards.length ?? input.reviewCards.filter((card) => isDue(card, nowMs) && card.status !== "suspended").length;
  const completedToday = input.currentSession?.completedCardIds.length ?? 0;
  const selectedToday = input.deck?.selectedReviewCards.length ?? 0;
  const readyToday = dueToday > 0 ? dueToday : selectedToday;
  const savedForReview = input.reviewAttempts.filter((attempt) => {
    const completedDateKey = getLocalDateKey(new Date(parseIso(attempt.completedAt) || nowMs || Date.now()));
    return completedDateKey === todayDateKey && (attempt.grade === "AGAIN" || attempt.grade === "HARD");
  }).length;

  return {
    totalReviewCards,
    dueToday,
    overdue,
    completedToday,
    savedForReview,
    mastered,
    leech,
    suspended,
    readyToday,
    selectedToday,
  };
}
