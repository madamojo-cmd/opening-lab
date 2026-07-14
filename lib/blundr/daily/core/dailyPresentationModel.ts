import type { DailyPresentationModel } from "@/lib/blundr/contracts";
import type { DailyDeckCard, DailySessionState } from "./dailyActivityTypes";

export function buildDailyPresentation(
  card: DailyDeckCard,
  state: DailySessionState,
): DailyPresentationModel {
  const attempt = state.attempts.find(
    (candidate) =>
      candidate.card.cardFingerprint === card.cardFingerprint &&
      candidate.scored,
  );
  const revealed = state.revealedCardIds.includes(card.cardFingerprint);
  return {
    schemaVersion: "2026-07-13.v1",
    card: {
      deckFingerprint: state.deck.deckFingerprint,
      cardFingerprint: card.cardFingerprint,
      positionKey: card.positionKey,
      activityId: card.activityId,
    },
    title: card.title,
    prompt: card.prompt,
    positionFen: card.positionFen,
    openingLabel: card.openingId,
    feedback: attempt
      ? {
          kind: attempt.outcome === "correct" ? "correct" : "incorrect",
          message: attempt.feedback ?? "Recorded.",
        }
      : revealed
        ? { kind: "revealed", message: "Feedback revealed." }
        : null,
    state: attempt ? "committed" : revealed ? "revealed" : "unanswered",
  };
}
