import {
  createActivityAttemptState,
  recordActivityAttempt,
  type ActivityAttemptState,
} from "@/lib/blundr/daily/core/dailyActivityConformance";
import type { PlanRecallSolution } from "./planRecallTypes";
export type PlanRecallReducerState = ActivityAttemptState & {
  selectedId: string | null;
};
export function initialPlanRecallState(): PlanRecallReducerState {
  return { ...createActivityAttemptState(), selectedId: null };
}
export function reducePlanRecall(
  state: PlanRecallReducerState,
  input:
    | { type: "select"; id: string }
    | { type: "submit" | "reveal"; now: string; solution: PlanRecallSolution }
    | { type: "retry" },
): PlanRecallReducerState {
  if (input.type === "select")
    return { ...state, state: "in_progress", selectedId: input.id };
  if (input.type === "retry")
    return {
      ...state,
      ...recordActivityAttempt(state, {
        outcome: "retry",
        now: new Date().toISOString(),
        feedback: "Retry",
      }),
    };
  const correct = Boolean(
    state.selectedId &&
      input.solution.question.acceptedIds.includes(state.selectedId),
  );
  return {
    ...state,
    ...recordActivityAttempt(state, {
      outcome:
        input.type === "reveal" ? "reveal" : correct ? "correct" : "incorrect",
      now: input.now,
      feedback:
        input.type === "reveal"
          ? "The plan answer is now available."
          : input.solution.question.explanation,
    }),
  };
}
