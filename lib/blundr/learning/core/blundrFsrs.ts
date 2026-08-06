import {
  createEmptyCard,
  fsrs,
  Rating,
  type Card,
  type CardInput,
} from "ts-fsrs";

/**
 * The only scheduler configuration permitted for server learning projections.
 *
 * Fuzzing would make a retry of the same immutable event produce a different
 * projection, so it is deliberately disabled. Short-term steps are disabled
 * because Blundr records one durable recall result per exposure rather than a
 * client-owned sequence of transient reviews.
 */
export const BLUNDR_FSRS_ALGORITHM_VERSION = "blundr-fsrs-v1";
export const BLUNDR_FSRS_DESIRED_RETENTION = 0.9;

export type BlundrFsrsCard = Pick<
  Card,
  | "due"
  | "stability"
  | "difficulty"
  | "elapsed_days"
  | "scheduled_days"
  | "reps"
  | "lapses"
  | "learning_steps"
  | "state"
  | "last_review"
>;

export type StoredBlundrFsrsCard = Omit<
  BlundrFsrsCard,
  "due" | "last_review"
> & {
  due: string;
  last_review: string | null;
};

const scheduler = fsrs({
  request_retention: BLUNDR_FSRS_DESIRED_RETENTION,
  enable_fuzz: false,
  enable_short_term: false,
});

function toCard(stored: StoredBlundrFsrsCard | null, now: Date): CardInput {
  if (!stored) return createEmptyCard(now);
  return {
    ...stored,
    due: new Date(stored.due),
    last_review: stored.last_review ? new Date(stored.last_review) : undefined,
  };
}

function storeCard(card: BlundrFsrsCard): StoredBlundrFsrsCard {
  return {
    ...card,
    due: card.due.toISOString(),
    last_review: card.last_review?.toISOString() ?? null,
  };
}

/** Grade one canonical first-recall result. Imported observations must never
 * reach this boundary; callers pass only verified recall evidence. */
export function gradeBlundrRecall(input: {
  previous: StoredBlundrFsrsCard | null;
  correct: boolean;
  occurredAt: string;
}): {
  card: StoredBlundrFsrsCard;
  dueAt: string;
  rating: "again" | "good";
} {
  const now = new Date(input.occurredAt);
  if (Number.isNaN(now.getTime()))
    throw new Error("invalid_recall_occurred_at");
  const result = scheduler.next(
    toCard(input.previous, now),
    now,
    input.correct ? Rating.Good : Rating.Again,
  );
  const card = storeCard(result.card);
  return {
    card,
    dueAt: card.due,
    rating: input.correct ? "good" : "again",
  };
}
