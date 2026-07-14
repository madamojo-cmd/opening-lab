import {
  createActivityAttemptState,
  recordActivityAttempt,
  type ActivityAttemptState,
} from "@/lib/blundr/daily/core/dailyActivityConformance";
import type { TranspositionSolution } from "./transpositionActivityTypes";
export type TranspositionReducerState = ActivityAttemptState & {
  userMove: string | null;
  routeRecognition: "unattempted" | "recognized" | "missed";
};
export function initialTranspositionState(): TranspositionReducerState {
  return {
    ...createActivityAttemptState(),
    userMove: null,
    routeRecognition: "unattempted",
  };
}
export function reduceTransposition(
  state: TranspositionReducerState,
  input:
    | { type: "move"; uci: string }
    | {
        type: "submit" | "reveal";
        now: string;
        solution: TranspositionSolution;
      }
    | { type: "retry" },
): TranspositionReducerState {
  if (input.type === "move")
    return { ...state, state: "in_progress", userMove: input.uci };
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
    state.userMove && input.solution.expectedMoves.includes(state.userMove),
  );
  return {
    ...state,
    ...recordActivityAttempt(state, {
      outcome:
        input.type === "reveal" ? "reveal" : correct ? "correct" : "incorrect",
      now: input.now,
      feedback:
        input.type === "reveal"
          ? "The standard and alternate routes are now revealed."
          : correct
            ? "You recognized the trained move."
            : "The position is shared, but the route recognition needs review.",
    }),
    routeRecognition:
      state.userMove && input.solution.alternateRoute.includes(state.userMove)
        ? "recognized"
        : "missed",
  };
}
