import type { ProductionDailyPublicSession } from "./productionDailyTypes";

export type ProductionDailyCompletionDescriptor = {
  completionId: string;
  dateKey: string;
  deckId: string;
  reviewSessionId: string;
  taskId: "daily_blundr_deck_completed";
  completedAt: string;
};

export function resolveProductionDailyCompletion(
  session: ProductionDailyPublicSession | null | undefined,
): ProductionDailyCompletionDescriptor | null {
  if (!session?.completedAt) return null;
  if (session.publicCards.length === 0) return null;
  if (session.state.completedCardIds.length !== session.publicCards.length)
    return null;

  const completed = new Set(session.state.completedCardIds);
  if (session.publicCards.some((card) => !completed.has(card.cardFingerprint)))
    return null;

  return {
    completionId: `${session.dateKey}:${session.sessionId}:daily_blundr_deck_completed`,
    dateKey: session.dateKey,
    deckId: session.deckId,
    reviewSessionId: session.sessionId,
    taskId: "daily_blundr_deck_completed",
    completedAt: session.completedAt,
  };
}
