import type { DailyBlundrAttemptOutcome, DailyBlundrCard } from "./dailyBlundrTypes";
import { gradeDailyBlundrMove } from "./dailyMoveGrader";
import type { DailyBlundrFailureType } from "./dailyBlundrReviewTypes";

export type DailyBlundrAttemptScoringInput = {
  card: DailyBlundrCard;
  attemptedMove?: string | null;
  usedReveal?: boolean;
  revealOnlyReviewed?: boolean;
  responseTimeMs?: number | null;
};

export type DailyBlundrAttemptScoringResult = {
  score: number;
  correct: boolean;
  partialCredit: number;
  usedReveal: boolean;
  failureType?: DailyBlundrFailureType;
  outcome: DailyBlundrAttemptOutcome;
  attemptedMoveUci?: string | null;
  attemptedMoveSan?: string | null;
  expectedMoveUci?: string | null;
  expectedMoveSan?: string | null;
  reason: string;
};

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function resolveIllegalFailureType(): DailyBlundrFailureType {
  return "illegal_move_attempt";
}

function resolveWrongFailureType(card: DailyBlundrCard, usedReveal: boolean): DailyBlundrFailureType {
  if (usedReveal) return "reveal_dependency";
  if (card.reviewPromptKind && card.reviewPromptKind !== "target_move_recall") return "hint_dependency";
  return "wrong_book_move";
}

export function scoreDailyBlundrAttempt(input: DailyBlundrAttemptScoringInput): DailyBlundrAttemptScoringResult {
  const attemptedMove = normalizeText(input.attemptedMove);
  const usedReveal = Boolean(input.usedReveal || input.revealOnlyReviewed);
  const revealOnlyReviewed = Boolean(input.revealOnlyReviewed);

  if (revealOnlyReviewed) {
    return {
      score: 45,
      correct: false,
      partialCredit: 0.45,
      usedReveal: true,
      failureType: "reveal_dependency",
      outcome: "reveal",
      attemptedMoveUci: null,
      attemptedMoveSan: null,
      expectedMoveUci: input.card.expectedMoveUci ?? null,
      expectedMoveSan: input.card.expectedMoveSan ?? null,
      reason: "reviewed_after_reveal",
    };
  }

  if (!attemptedMove) {
    return {
      score: 0,
      correct: false,
      partialCredit: 0,
      usedReveal,
      failureType: resolveIllegalFailureType(),
      outcome: "skip",
      attemptedMoveUci: null,
      attemptedMoveSan: null,
      expectedMoveUci: input.card.expectedMoveUci ?? null,
      expectedMoveSan: input.card.expectedMoveSan ?? null,
      reason: "empty_move",
    };
  }

  const graded = gradeDailyBlundrMove({
    fen: input.card.fen,
    expectedMoveUci: input.card.expectedMoveUci ?? null,
    expectedMoveSan: input.card.expectedMoveSan ?? null,
    attemptedMove,
  });
  const illegal = graded.reason === "illegal_move_attempt" || graded.reason === "unrecognized_move_input";

  if (illegal) {
    return {
      score: 0,
      correct: false,
      partialCredit: 0,
      usedReveal,
      failureType: resolveIllegalFailureType(),
      outcome: "incorrect",
      attemptedMoveUci: graded.attemptedMoveUci,
      attemptedMoveSan: graded.attemptedMoveSan,
      expectedMoveUci: graded.expectedMoveUci,
      expectedMoveSan: graded.expectedMoveSan,
      reason: graded.reason,
    };
  }

  const correct = graded.outcome === "correct";
  const score = correct ? (usedReveal ? 60 : 100) : usedReveal ? 35 : 20;
  const partialCredit = correct ? (usedReveal ? 0.6 : 1) : usedReveal ? 0.35 : 0.2;

  return {
    score: clampScore(score),
    correct,
    partialCredit,
    usedReveal,
    failureType: correct ? (usedReveal ? "reveal_dependency" : undefined) : resolveWrongFailureType(input.card, usedReveal),
    outcome: correct ? "correct" : "incorrect",
    attemptedMoveUci: graded.attemptedMoveUci,
    attemptedMoveSan: graded.attemptedMoveSan,
    expectedMoveUci: graded.expectedMoveUci,
    expectedMoveSan: graded.expectedMoveSan,
    reason: graded.reason,
  };
}
