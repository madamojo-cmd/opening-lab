import type {
  ProductionDailyPublicSession,
  ProductionDailySession,
} from "./productionDailyTypes";

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
    publicCards,
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
