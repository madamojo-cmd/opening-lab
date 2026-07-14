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
  const isRetry = input.outcome === "retry";
  const result: DailyReducerResult =
    firstScored && !isRetry
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
        : state.revealedCardIds,
    firstAttemptIds: attempt.scored
      ? [...state.firstAttemptIds, card.cardFingerprint]
      : state.firstAttemptIds,
    status:
      state.currentIndex >= state.deck.cards.length - 1 && attempt.scored
        ? "completed"
        : state.status,
  };
  return {
    result,
    state: next,
    presentation: buildDailyPresentation(card, next),
  };
}
