import type { PlanRecallSolution } from "./planRecallTypes";
export function scorePlanAttempt(
  selectedId: string | null,
  solution: PlanRecallSolution,
): { correct: boolean; explanation: string } {
  return {
    correct: Boolean(
      selectedId && solution.question.acceptedIds.includes(selectedId),
    ),
    explanation: solution.question.explanation,
  };
}
