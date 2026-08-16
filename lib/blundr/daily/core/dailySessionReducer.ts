import {
  createDeterministicIdentity,
  type DailyReducerResult,
} from "@/lib/blundr/contracts";
import type {
  DailyAttempt,
  DailyReducerOutput,
  DailySessionState,
} from "./dailyActivityTypes";
import { buildDailyPresentation } from "./dailyPresentationModel";

export function hasRecordedDailyFirstAttempt(
  state: Pick<DailySessionState, "attempts" | "firstAttemptIds">,
  cardFingerprint: string,
): boolean {
  return (
    state.firstAttemptIds.includes(cardFingerprint) ||
    state.attempts.some(
      (attempt) =>
        attempt.card.cardFingerprint === cardFingerprint &&
        attempt.outcome !== "retry",
    )
  );
}

export function reduceDailySession(
  state: DailySessionState,
  input: {
    userId: string;
    cardFingerprint: string;
    now: string;
    outcome: "correct" | "incorrect" | "reveal" | "retry";
    feedback?: string | null;
  },
): DailyReducerOutput {
  const card = state.deck.cards.find(
    (candidate) => candidate.cardFingerprint === input.cardFingerprint,
  );
  if (!card) throw new Error("daily_card_not_in_session");
  const firstScored = state.attempts.some(
    (attempt) =>
      attempt.card.cardFingerprint === card.cardFingerprint && attempt.scored,
  );
  const alreadyCompleted = state.attempts.some(
    (attempt) =>
      attempt.card.cardFingerprint === card.cardFingerprint &&
      attempt.outcome === "correct",
  );
  const isRetry = input.outcome === "retry";
  const result: DailyReducerResult =
    alreadyCompleted && !isRetry
      ? "already_committed"
      : isRetry
        ? "retry_recorded"
        : input.outcome === "reveal"
          ? "revealed"
          : "accepted";
  const attempt: DailyAttempt = {
    attemptId: createDeterministicIdentity("daily-attempt", [
      state.deck.sessionId,
      card.cardFingerprint,
      state.attempts.length,
    ]),
    card,
    submittedAt: input.now,
    outcome: input.outcome,
    // First-attempt scoring is immutable. Later correct answers are retained
    // for teaching progress without rewriting that original recall evidence.
    scored: !isRetry && input.outcome !== "reveal" && !firstScored,
    feedback: input.feedback ?? null,
  };
  const attempts =
    result === "already_committed"
      ? state.attempts
      : [...state.attempts, attempt];
  const next: DailySessionState = {
    ...state,
    attempts,
    revealedCardIds:
      input.outcome === "reveal"
        ? [...new Set([...state.revealedCardIds, card.cardFingerprint])]
        : input.outcome === "retry" || input.outcome === "correct"
          ? state.revealedCardIds.filter((id) => id !== card.cardFingerprint)
          : state.revealedCardIds,
    firstAttemptIds: attempt.scored
      ? [...state.firstAttemptIds, card.cardFingerprint]
      : state.firstAttemptIds,
    currentIndex:
      result === "accepted" && input.outcome === "correct"
        ? Math.min(state.currentIndex + 1, state.deck.cards.length)
        : state.currentIndex,
    status:
      result === "accepted" &&
      input.outcome === "correct" &&
      state.currentIndex >= state.deck.cards.length - 1
        ? "completed"
        : state.status,
  };
  return {
    result,
    state: next,
    presentation: buildDailyPresentation(card, next),
  };
}
