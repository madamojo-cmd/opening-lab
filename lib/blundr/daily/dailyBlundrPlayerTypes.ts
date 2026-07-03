import type { DailyBlundrAttempt, DailyBlundrCard, DailyBlundrSession } from "./dailyBlundrTypes";
import type { DailyBlundrMasteryState } from "./dailyBlundrTypes";
import type { DailyBlundrReviewAttempt, DailyBlundrReviewCard } from "./dailyBlundrReviewTypes";
import type { DailyBlundrAttemptScoringResult } from "./dailyBlundrAttemptScoring";
import type { DailyBlundrReviewStats } from "./dailyBlundrReviewStats";
import type { DailyBlundrCardPlayMode } from "./dailyBlundrTypes";

export type { DailyBlundrCardPlayMode } from "./dailyBlundrTypes";

export type DailyBlundrSupportState = {
  usedReveal: boolean;
  revealedAt: string | null;
  answerShown: boolean;
};

export type DailyBlundrBoardMoveAttempt = {
  from: string;
  to: string;
  uci: string;
  san: string | null;
  legal: boolean;
  promotion: string | null;
};

export type DailyBlundrPlayerAttemptCommit = {
  card: DailyBlundrCard;
  attempt: DailyBlundrAttempt;
  reviewAttempt: DailyBlundrReviewAttempt;
  session: DailyBlundrSession;
  mastery: DailyBlundrMasteryState;
  reviewCards: DailyBlundrReviewCard[];
  reviewAttempts: DailyBlundrReviewAttempt[];
  reviewStats: DailyBlundrReviewStats;
  scoring: DailyBlundrAttemptScoringResult;
  feedback: string;
  sessionComplete: boolean;
};

export type DailyBlundrPlayerProps = {
  cards: readonly DailyBlundrCard[];
  session: DailyBlundrSession | null;
  reviewCards: readonly DailyBlundrReviewCard[];
  reviewAttempts: readonly DailyBlundrReviewAttempt[];
  mastery: DailyBlundrMasteryState | null;
  onAttemptComplete?: (commit: DailyBlundrPlayerAttemptCommit) => void;
  onSessionComplete?: (commit: DailyBlundrPlayerAttemptCommit) => void;
};

export type DailyBlundrCardPlayerProps = {
  card: DailyBlundrCard;
  mode: DailyBlundrCardPlayMode;
  moveInput: string;
  support: DailyBlundrSupportState;
  locked: boolean;
  onMoveInputChange: (value: string) => void;
  onSubmitMove: (value: string) => void;
  onBoardMoveAttempt: (attempt: DailyBlundrBoardMoveAttempt) => void;
  onReveal: () => void;
  onShowAnswer: () => void;
  onMarkReviewed: () => void;
};

export type DailyBlundrBoardProps = {
  fen: string;
  disabled?: boolean;
  onMoveAttempt?: (attempt: DailyBlundrBoardMoveAttempt) => void;
};

export type DailyBlundrSupportControlsProps = {
  usedReveal: boolean;
  answerShown: boolean;
  revealedAt: string | null;
  disabled?: boolean;
  onReveal: () => void;
  onShowAnswer: () => void;
  onMarkReviewed: () => void;
};

export type DailyBlundrCardFeedbackProps = {
  message: string;
  tone: "success" | "warning" | "complete" | "neutral";
};

export type DailyBlundrSessionSummaryProps = {
  cards: readonly DailyBlundrCard[];
  session: DailyBlundrSession | null;
  currentCard: DailyBlundrCard | null;
  reviewStats: DailyBlundrReviewStats;
};

export function resolveDailyBlundrCardPlayMode(card: DailyBlundrCard): DailyBlundrCardPlayMode {
  if (card.reviewPromptKind === "target_move_recall" && card.expectedMoveUci) return "uci_graded";
  return "reveal_only";
}
