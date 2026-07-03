import type {
  DailyBlundrFailureType,
  DailyBlundrPromptKind,
  DailyBlundrReviewCard,
  DailyBlundrReviewCardStatus,
  DailyBlundrSrsGrade,
} from "./dailyBlundrReviewTypes";

export const DAILY_BLUNDR_DEFAULT_EASE = 2.35;
export const DAILY_BLUNDR_MIN_EASE = 1.3;
export const DAILY_BLUNDR_MAX_EASE = 3.0;

export type DailyBlundrAttemptGradeInput = {
  promptKind: DailyBlundrPromptKind;
  correct: boolean;
  partialCredit?: number | null;
  usedReveal?: boolean;
  responseTimeMs?: number | null;
  expectedFastMs?: number;
  previousCorrectStreak?: number;
};

export type DailyBlundrScheduleInput = {
  card: DailyBlundrReviewCard;
  completedAt?: string;
  now?: string;
  grade?: DailyBlundrSrsGrade;
  correct?: boolean;
  partialCredit?: number | null;
  usedReveal?: boolean;
  responseTimeMs?: number | null;
  failureType?: DailyBlundrFailureType;
  promptKind?: DailyBlundrPromptKind;
  previousCorrectStreak?: number;
  expectedFastMs?: number;
  moveReason?: string | null;
};

export type ScheduledReviewOutput = {
  card: DailyBlundrReviewCard;
  grade: DailyBlundrSrsGrade;
  score: number;
  correct: boolean;
  partialCredit: number;
  failureType: DailyBlundrFailureType;
};

function nowIso(): string {
  return new Date().toISOString();
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function clampEase(value: number): number {
  if (!Number.isFinite(value)) return DAILY_BLUNDR_DEFAULT_EASE;
  return Math.max(DAILY_BLUNDR_MIN_EASE, Math.min(DAILY_BLUNDR_MAX_EASE, value));
}

function clampSeverity(value: number): 1 | 2 | 3 | 4 | 5 {
  if (!Number.isFinite(value)) return 1;
  if (value <= 1) return 1;
  if (value <= 2) return 2;
  if (value <= 3) return 3;
  if (value <= 4) return 4;
  return 5;
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function parseIso(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function addMinutesIso(base: string, minutes: number): string {
  const value = Date.parse(base);
  const safe = Number.isFinite(value) ? value : Date.now();
  return new Date(safe + minutes * 60_000).toISOString();
}

function addDaysIso(base: string, days: number): string {
  const value = Date.parse(base);
  const safe = Number.isFinite(value) ? value : Date.now();
  return new Date(safe + days * 86_400_000).toISOString();
}

function defaultExpectedFastMs(promptKind: DailyBlundrPromptKind): number {
  return promptKind === "target_move_recall" ? 3_500 : 2_500;
}

function gradeToScore(grade: DailyBlundrSrsGrade): number {
  if (grade === "AGAIN") return 0;
  if (grade === "HARD") return 0.45;
  if (grade === "GOOD") return 0.8;
  return 1;
}

function isRecognitionPrompt(promptKind: DailyBlundrPromptKind): boolean {
  return promptKind !== "target_move_recall";
}

function isMastered(card: DailyBlundrReviewCard, nextCorrectStreak: number, nextIntervalDays: number, nextLapses: number): boolean {
  if (nextLapses >= 8) return false;
  if (card.status === "suspended") return false;
  return nextCorrectStreak >= 4 && nextIntervalDays >= 7 && card.ease >= 2.45;
}

function determineFailureType(input: DailyBlundrScheduleInput, promptKind: DailyBlundrPromptKind, grade: DailyBlundrSrsGrade, partialCredit: number, correct: boolean): DailyBlundrFailureType {
  if (input.failureType) return input.failureType;
  if (input.usedReveal) return "reveal_dependency";
  const responseTimeMs = typeof input.responseTimeMs === "number" && Number.isFinite(input.responseTimeMs) ? input.responseTimeMs : null;
  const expectedFastMs = input.expectedFastMs ?? defaultExpectedFastMs(promptKind);
  if (responseTimeMs !== null && responseTimeMs > expectedFastMs * 2.5) return "slow_recall";
  const moveReason = normalizeText(input.moveReason);
  if (moveReason === "unrecognized_move_input" || moveReason === "illegal_move_attempt") return "illegal_move_attempt";
  if (!correct && grade === "AGAIN" && partialCredit < 0.5) return promptKind === "target_move_recall" ? "wrong_book_move" : "hint_dependency";
  if (promptKind !== "target_move_recall") return "hint_dependency";
  return "other";
}

function resolvePartialCredit(input: DailyBlundrScheduleInput, grade: DailyBlundrSrsGrade): number {
  if (typeof input.partialCredit === "number" && Number.isFinite(input.partialCredit)) {
    return clamp01(input.partialCredit);
  }
  if (grade === "AGAIN") return 0;
  if (grade === "HARD") return input.usedReveal ? 0.55 : 0.45;
  if (grade === "GOOD") return 0.8;
  return 1;
}

export function gradeDailyBlundrAttempt(input: DailyBlundrAttemptGradeInput): DailyBlundrSrsGrade {
  const promptKind = input.promptKind;
  const partialCredit = clamp01(Number(input.partialCredit ?? (input.correct ? 1 : 0)) || 0);
  const usedReveal = Boolean(input.usedReveal);
  const responseTimeMs = typeof input.responseTimeMs === "number" && Number.isFinite(input.responseTimeMs) ? input.responseTimeMs : null;
  const expectedFastMs = input.expectedFastMs ?? defaultExpectedFastMs(promptKind);
  const previousCorrectStreak = Math.max(0, Number(input.previousCorrectStreak ?? 0) || 0);
  const correct = Boolean(input.correct);

  if (usedReveal) return "HARD";
  if (!correct && partialCredit < 0.5) return "AGAIN";
  if (responseTimeMs !== null && responseTimeMs > expectedFastMs * 2.5) return "HARD";

  if (correct && previousCorrectStreak >= 2 && responseTimeMs !== null && responseTimeMs <= expectedFastMs) {
    return isRecognitionPrompt(promptKind) ? "GOOD" : "EASY";
  }

  if (correct || partialCredit >= 0.75) {
    return "GOOD";
  }

  return "HARD";
}

export function scheduleDailyBlundrReview(input: DailyBlundrScheduleInput): ScheduledReviewOutput {
  const completedAt = normalizeText(input.completedAt) || nowIso();
  const now = normalizeText(input.now) || completedAt;
  const promptKind = input.promptKind ?? input.card.promptKind;
  const grade = input.grade ?? gradeDailyBlundrAttempt({
    promptKind,
    correct: Boolean(input.correct ?? true),
    partialCredit: input.partialCredit ?? null,
    usedReveal: input.usedReveal,
    responseTimeMs: input.responseTimeMs,
    expectedFastMs: input.expectedFastMs,
    previousCorrectStreak: input.previousCorrectStreak ?? input.card.correctStreak,
  });
  const correct = Boolean(input.correct ?? grade !== "AGAIN");
  const partialCredit = resolvePartialCredit(input, grade);
  const score = gradeToScore(grade);
  const failureType = determineFailureType(input, promptKind, grade, partialCredit, correct);
  const usedReveal = Boolean(input.usedReveal);
  const isNewCard = input.card.totalAttempts <= 0;
  const previousEase = clampEase(input.card.ease || DAILY_BLUNDR_DEFAULT_EASE);
  const previousIntervalDays = Math.max(0, Number(input.card.intervalDays ?? 0) || 0);
  const previousCorrectStreak = Math.max(0, Number(input.previousCorrectStreak ?? input.card.correctStreak ?? 0) || 0);
  const expectedFastMs = input.expectedFastMs ?? defaultExpectedFastMs(promptKind);
  const responseTimeMs = typeof input.responseTimeMs === "number" && Number.isFinite(input.responseTimeMs) ? input.responseTimeMs : null;

  let nextEase = previousEase;
  let nextIntervalDays = previousIntervalDays;
  let nextCorrectStreak = input.card.correctStreak;
  let nextLapses = input.card.lapses;
  let nextStatus: DailyBlundrReviewCardStatus = input.card.status;

  if (grade === "AGAIN") {
    nextEase = clampEase(previousEase - 0.2);
    nextIntervalDays = 0;
    nextCorrectStreak = 0;
    nextLapses = input.card.lapses + 1;
  } else if (grade === "HARD") {
    nextEase = clampEase(previousEase - 0.08);
    nextIntervalDays = Math.max(1, isNewCard ? 1 : Math.max(1, Math.round(Math.max(1, previousIntervalDays) * 1.1)));
    nextCorrectStreak = correct || partialCredit >= 0.75 ? input.card.correctStreak + 1 : 0;
  } else if (grade === "GOOD") {
    nextEase = clampEase(previousEase + 0.04);
    nextIntervalDays = Math.max(1, isNewCard ? 1 : Math.round(Math.max(1, previousIntervalDays) * nextEase));
    nextCorrectStreak = input.card.correctStreak + 1;
  } else {
    nextEase = clampEase(previousEase + 0.15);
    nextIntervalDays = Math.max(3, isNewCard ? 3 : Math.round(Math.max(1, previousIntervalDays) * (nextEase + 0.2)));
    nextCorrectStreak = input.card.correctStreak + 1;
  }

  if (isRecognitionPrompt(promptKind) && grade === "EASY") {
    nextIntervalDays = Math.max(1, Math.min(nextIntervalDays, 2));
    nextEase = clampEase(nextEase - 0.05);
  }

  if (isRecognitionPrompt(promptKind) && grade === "GOOD") {
    nextIntervalDays = Math.max(1, Math.min(nextIntervalDays, 3));
  }

  if (grade === "AGAIN") {
    const firstAttempt = isNewCard;
    const dueMinutes = firstAttempt ? 5 : 10;
    const dueAt = addMinutesIso(completedAt, dueMinutes);
    const updatedCard: DailyBlundrReviewCard = {
      ...input.card,
      promptKind,
      status: nextLapses >= 8 ? "leech" : "learning",
      severity: clampSeverity(nextLapses >= 8 ? 5 : Math.max(input.card.severity, 3)),
      intervalDays: 0,
      ease: nextEase,
      correctStreak: 0,
      lapses: nextLapses,
      totalAttempts: input.card.totalAttempts + 1,
      revealUses: input.card.revealUses + (usedReveal ? 1 : 0),
      avgResponseTimeMs: resolveAvgResponseTime(input.card.avgResponseTimeMs, responseTimeMs),
      lastReviewedAt: completedAt,
      dueAt,
      updatedAt: now,
      source: input.card.source,
    };
    return {
      card: updatedCard,
      grade,
      score,
      correct,
      partialCredit,
      failureType,
    };
  }

  const mastered = isMastered(input.card, nextCorrectStreak, nextIntervalDays, nextLapses);
  if (mastered) {
    nextStatus = "mastered";
  } else if (nextLapses >= 8) {
    nextStatus = "leech";
  } else if (input.card.status === "new" && nextCorrectStreak <= 1) {
    nextStatus = "learning";
  } else {
    nextStatus = "review";
  }

  const dueAt = addDaysIso(completedAt, nextIntervalDays);
  const updatedCard: DailyBlundrReviewCard = {
    ...input.card,
    promptKind,
    status: nextStatus,
    severity: clampSeverity(Math.max(input.card.severity, grade === "GOOD" ? 3 : grade === "EASY" ? 2 : 4)),
    intervalDays: nextIntervalDays,
    ease: nextEase,
    correctStreak: nextCorrectStreak,
    lapses: nextLapses,
    totalAttempts: input.card.totalAttempts + 1,
    revealUses: input.card.revealUses + (usedReveal ? 1 : 0),
    avgResponseTimeMs: resolveAvgResponseTime(input.card.avgResponseTimeMs, responseTimeMs),
    lastReviewedAt: completedAt,
    dueAt,
    updatedAt: now,
    source: input.card.source,
  };

  return {
    card: updatedCard,
    grade,
    score,
    correct,
    partialCredit,
    failureType,
  };
}

function resolveAvgResponseTime(previous: number | null | undefined, responseTimeMs: number | null): number | undefined {
  if (responseTimeMs === null) {
    return previous === null || previous === undefined ? undefined : previous;
  }
  if (previous === null || previous === undefined) return Math.round(responseTimeMs);
  return Math.round(previous * 0.72 + responseTimeMs * 0.28);
}
