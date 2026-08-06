import type {
  ProductionDailyPublicSession,
  ProductionDailySession,
} from "./productionDailyTypes";
import { createDeterministicIdentity } from "@/lib/blundr/contracts";

export function productionDailyActionId(input: {
  sessionId: string;
  cardFingerprint: string;
  stepIndex: number;
  version: number;
}): string {
  return createDeterministicIdentity("daily-action", [
    input.sessionId,
    input.cardFingerprint,
    input.stepIndex,
    input.version,
  ]);
}

export function toPublicDailySession(
  session: ProductionDailySession,
): ProductionDailyPublicSession {
  const completedCardIds = session.state.attempts
    .filter((attempt) => attempt.scored)
    .map((attempt) => attempt.card.cardFingerprint);
  const publicCards = session.publicCards.map((card) => {
    if (!card.steps?.length) return card;
    const stepIndex =
      session.state.activityProgress?.[card.cardFingerprint]?.stepIndex ?? 0;
    const step = card.steps[Math.min(stepIndex, card.steps.length - 1)];
    const { steps: _steps, ...cardWithoutSteps } = card;
    return {
      ...cardWithoutSteps,
      positionFen: step.positionFen,
      prompt: step.prompt,
      side: step.side,
      options: step.options,
      interaction: step.options?.length
        ? ("choice" as const)
        : ("move" as const),
    };
  });
  return {
    sessionId: session.sessionId,
    deckId: session.deckId,
    dateKey: session.dateKey,
    publicCards: publicCards.map((card) => ({
      ...card,
      actionId: productionDailyActionId({
        sessionId: session.sessionId,
        cardFingerprint: String(card.cardFingerprint),
        stepIndex:
          session.state.activityProgress?.[card.cardFingerprint]?.stepIndex ??
          0,
        version: session.version,
      }),
    })),
    reservationIdentity: session.reservationIdentity,
    version: session.version,
    completedAt: session.completedAt,
    state: {
      currentIndex: session.state.currentIndex,
      completedCardIds,
      revealedCardIds: session.state.revealedCardIds,
      activityProgress: session.state.activityProgress,
    },
  };
}
