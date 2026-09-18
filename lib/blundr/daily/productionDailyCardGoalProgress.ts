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
  const completedCards = Number.isFinite(session.cardsCompletedToday)
    ? Math.max(0, Math.trunc(Number(session.cardsCompletedToday)))
    : session.state.completedCardIds.length;

  const requestedGoal = clampCardGoal(
    Number(session.dailyCardTarget ?? cardGoal ?? 10),
    10,
  );
  const goalCards = requestedGoal;
  const progressCards = Math.min(goalCards, completedCards);
  const completed = goalCards > 0 && completedCards >= goalCards;
  return {
    totalCards,
    completedCards,
    goalCards,
    progressCards,
    percent: clampPct(progressCards, goalCards),
    completed,
  };
}
