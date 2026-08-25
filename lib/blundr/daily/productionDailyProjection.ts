import type {
  ProductionDailyPublicCard,
  ProductionDailyPublicSession,
  ProductionDailySession,
  ProductionDailyTeachingPayload,
} from "./productionDailyTypes";
import { createDeterministicIdentity } from "@/lib/blundr/contracts";
import { buildProductionDailyTeachingPayload } from "./productionDailyTeaching";

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

function revealedTeachingForCard(input: {
  session: ProductionDailySession;
  card: ProductionDailyPublicCard;
  stepIndex: number;
}): ProductionDailyTeachingPayload | null {
  const progress =
    input.session.state.activityProgress?.[input.card.cardFingerprint];
  const revealed =
    input.session.state.revealedCardIds.includes(input.card.cardFingerprint) ||
    progress?.status === "revealed";
  if (!revealed) return null;

  const privateCard = input.session.privateCards.find(
    (candidate) =>
      candidate.cardFingerprint === input.card.cardFingerprint,
  );
  if (!privateCard) return null;

  const privateStep = privateCard.privateSteps?.[input.stepIndex];
  const sourceFen = privateStep?.positionFen ?? privateCard.positionFen;
  const moveUci = (privateStep?.acceptedMoves ?? privateCard.acceptedMoves)[0];
  if (!moveUci) return null;

  return buildProductionDailyTeachingPayload({
    sourceFen,
    moveUci,
    note: privateStep?.explanation ?? privateCard.explanation,
  });
}

export function toPublicDailySession(
  session: ProductionDailySession,
  options: { cardsCompletedToday?: number } = {},
): ProductionDailyPublicSession {
  const completedCardIds = session.state.attempts
    .filter((attempt) => attempt.outcome === "correct")
    .map((attempt) => attempt.card.cardFingerprint);

  const publicCards = session.publicCards.map((card) => {
    const stepIndex =
      session.state.activityProgress?.[card.cardFingerprint]?.stepIndex ?? 0;
    let projectedCard: ProductionDailyPublicCard = card;

    if (card.steps?.length) {
      const step = card.steps[Math.min(stepIndex, card.steps.length - 1)];
      const { steps: _steps, ...cardWithoutSteps } = card;
      projectedCard = {
        ...cardWithoutSteps,
        positionFen: step.positionFen,
        prompt: step.prompt,
        side: step.side,
        options: step.options,
        interaction: step.options?.length ? "choice" : "move",
      };
    }

    const teaching = revealedTeachingForCard({
      session,
      card,
      stepIndex,
    });
    return teaching
      ? {
          ...projectedCard,
          teaching,
        }
      : projectedCard;
  });

  return {
    sessionId: session.sessionId,
    deckId: session.deckId,
    dateKey: session.dateKey,
    cardsCompletedToday: options.cardsCompletedToday,
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
