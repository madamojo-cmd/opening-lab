import type {
  DailyBlundrCard,
  DailyBlundrDomain,
  DailyBlundrMasteryTarget,
} from "./dailyBlundrTypes";

export const DAILY_BLUNDR_REVIEW_SCHEMA_VERSION = 1 as const;

export type DailyBlundrReviewCardStatus =
  | "new"
  | "learning"
  | "review"
  | "mastered"
  | "leech"
  | "suspended";

export type DailyBlundrPromptKind =
  | "target_move_recall"
  | "review_prompt"
  | "reveal_review";

export type DailyBlundrFailureType =
  | "wrong_book_move"
  | "hint_dependency"
  | "reveal_dependency"
  | "slow_recall"
  | "wrong_piece_selected"
  | "illegal_move_attempt"
  | "other";

export type DailyBlundrSrsGrade = "AGAIN" | "HARD" | "GOOD" | "EASY";

export type DailyBlundrReviewCard = {
  schemaVersion: typeof DAILY_BLUNDR_REVIEW_SCHEMA_VERSION;
  id: string;
  dedupeKey: string;
  status: DailyBlundrReviewCardStatus;
  promptKind: DailyBlundrPromptKind;
  sourceCard?: DailyBlundrCard | null;
  source: "learning_event" | "progress_mistake" | "daily_attempt" | "merged";
  fen: string;
  positionHash: string;
  expectedMoveUci?: string | null;
  expectedMoveSan?: string | null;
  playedMoveUci?: string | null;
  playedMoveSan?: string | null;
  openingId?: string | null;
  repertoireId?: string | null;
  openingName?: string | null;
  domain: DailyBlundrDomain;
  masteryTargets: DailyBlundrMasteryTarget[];
  failureType: DailyBlundrFailureType;
  severity: 1 | 2 | 3 | 4 | 5;
  signals: string[];
  dueAt: string;
  intervalDays: number;
  ease: number;
  correctStreak: number;
  lapses: number;
  totalAttempts: number;
  revealUses: number;
  avgResponseTimeMs?: number | null;
  lastReviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DailyBlundrReviewAttempt = {
  schemaVersion: typeof DAILY_BLUNDR_REVIEW_SCHEMA_VERSION;
  id: string;
  reviewCardId: string;
  sessionId?: string | null;
  cardId?: string | null;
  startedAt?: string | null;
  completedAt: string;
  grade: DailyBlundrSrsGrade;
  score: number;
  correct: boolean;
  partialCredit: number;
  responseMoveUci?: string | null;
  usedReveal: boolean;
  responseTimeMs?: number | null;
  failureType?: DailyBlundrFailureType | null;
};
