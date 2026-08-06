import { createDeterministicIdentity } from "@/lib/blundr/contracts";

export type ReviewRating = "again" | "hard" | "good" | "easy";
export type ReviewAttemptState =
  | "awaiting_answer"
  | "awaiting_rating"
  | "rated";

/** Public, answer-free representation returned by the Review queue API. */
export type ReviewQueueItem = {
  reviewItemId: string;
  openingId: string;
  playKey: string;
  fen: string;
  dueAt: string;
  attempt: {
    attemptId: string;
    state: ReviewAttemptState;
  };
  allowedRatings: readonly ReviewRating[];
};

export type ReviewQueueResponse = {
  items: readonly ReviewQueueItem[];
};

export type ReviewAttemptResponse = {
  state?: ReviewAttemptState;
  allowedRatings?: readonly ReviewRating[];
};

export function reviewItemId(input: {
  userId: string;
  openingId: string;
  playKey: string;
  version: number;
}) {
  return createDeterministicIdentity("review-item-v1", [
    input.userId,
    input.openingId,
    input.playKey,
    input.version,
  ]);
}

export function allowedRatings(input: {
  correct: boolean;
  revealOccurred: boolean;
  priorFailure: boolean;
  priorReps: number;
  elapsedMs: number | null;
}): readonly ReviewRating[] {
  if (!input.correct || input.revealOccurred || input.priorFailure)
    return ["again"];
  const ratings: ReviewRating[] = ["hard", "good"];
  if (
    input.priorReps >= 8 &&
    input.elapsedMs !== null &&
    input.elapsedMs <= 5_000
  )
    ratings.push("easy");
  return ratings;
}

export function validateReviewRating(input: {
  rating: ReviewRating;
  correct: boolean;
  revealOccurred: boolean;
  priorFailure: boolean;
  priorReps: number;
  elapsedMs: number | null;
}): boolean {
  return allowedRatings(input).includes(input.rating);
}
