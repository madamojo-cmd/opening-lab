import {
  createActivityAttemptState,
  recordActivityAttempt,
  type ActivityAttemptState,
} from "@/lib/blundr/daily/core/dailyActivityConformance";
import type { PunishmentSolution } from "./punishmentTypes";
export type PunishmentReducerState = ActivityAttemptState & {
  sequence: readonly string[];
  moveIndex: number;
  resetCount: number;
};
export function initialPunishmentState(): PunishmentReducerState {
  return {
    ...createActivityAttemptState(),
    sequence: [],
    moveIndex: 0,
    resetCount: 0,
  };
}
export function reducePunishment(
  state: PunishmentReducerState,
  input:
    | { type: "move"; uci: string; now: string; solution: PunishmentSolution }
    | { type: "reset" }
    | { type: "reveal"; now: string; solution: PunishmentSolution }
    | { type: "retry" },
): PunishmentReducerState {
  if (input.type === "reset")
    return {
      ...state,
      sequence: [],
      moveIndex: 0,
      resetCount: state.resetCount + 1,
      state: "in_progress",
    };
  if (input.type === "retry")
    return {
      ...state,
      ...recordActivityAttempt(state, {
        outcome: "retry",
        now: new Date().toISOString(),
        feedback: "Retry",
      }),
    };
  if (input.type === "reveal")
    return {
      ...state,
      ...recordActivityAttempt(state, {
        outcome: "reveal",
        now: input.now,
        feedback: input.solution.explanation,
      }),
    };
  const expected =
    state.moveIndex === 0
      ? input.solution.bestResponses
      : input.solution.continuation;
  const correct = expected.includes(input.uci);
  const nextIndex = state.moveIndex + 1;
  const complete = nextIndex >= 1 + input.solution.continuation.length;
  const advanced: PunishmentReducerState = {
    ...state,
    sequence: [...state.sequence, input.uci],
    moveIndex: nextIndex,
  };
  return complete
    ? {
        ...advanced,
        ...recordActivityAttempt(advanced, {
          outcome: correct ? "correct" : "incorrect",
          now: input.now,
          feedback: input.solution.explanation,
        }),
      }
    : {
        ...state,
        state: "in_progress",
        sequence: [...state.sequence, input.uci],
        moveIndex: nextIndex,
      };
}
