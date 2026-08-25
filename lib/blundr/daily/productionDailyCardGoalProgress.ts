import type { ProductionDailyPublicSession } from "./productionDailyTypes";

export type ProductionDailyCardGoalProgress = {
  totalCards: number;
  completedCards: number;
  goalCards: number;
  progressCards: number;
  percent: number;
  completed: boolean;
};

function clampCardGoal(value: number, fallback = 10): number {
  if (!Number.isFinite(value)) return fallback;
  const n = Math.trunc(value);
  if (n < 1) return 1;
  if (n > 99) return 99;
  return n;
}

function clampPct(numerator: number, denominator: number): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0)
    return 0;
  return Math.max(
    0,
    Math.min(100, Math.round((Math.min(numerator, denominator) / denominator) * 100)),
  );
}

export function resolveProductionDailyCardGoalProgress(
  session: ProductionDailyPublicSession | null | undefined,
  cardGoal: number | null | undefined,
): ProductionDailyCardGoalProgress | null {
  if (!session) return null;
  const totalCards = session.publicCards.length;
  const completedFingerprints = new Set(session.state.completedCardIds);
  const completedCards = session.publicCards.reduce((count, card) => {
    return completedFingerprints.has(card.cardFingerprint) ? count + 1 : count;
  }, 0);

  const requestedGoal = clampCardGoal(Number(cardGoal ?? 10), 10);
  const goalCards = totalCards > 0 ? Math.min(requestedGoal, totalCards) : requestedGoal;
  const progressCards = Math.min(goalCards, completedCards);
  const completed = goalCards > 0 && progressCards >= goalCards;
  return {
    totalCards,
    completedCards,
    goalCards,
    progressCards,
    percent: clampPct(progressCards, goalCards),
    completed,
  };
}

