import {
  createActivityAttemptState,
  recordActivityAttempt,
  type ActivityAttemptState,
} from "@/lib/blundr/daily/core/dailyActivityConformance";
import type { ContinuationSolution } from "./continuationChallengeTypes";
export type ContinuationReducerState = ActivityAttemptState & {
  userMoveCount: number;
  objectiveScore: number;
  moveQualityScore: number;
  pendingReply: boolean;
  terminal: boolean;
};
export function initialContinuationState(): ContinuationReducerState {
  return {
    ...createActivityAttemptState(),
    userMoveCount: 0,
    objectiveScore: 0,
    moveQualityScore: 0,
    pendingReply: false,
    terminal: false,
  };
}
export function reduceContinuation(
  state: ContinuationReducerState,
  input:
    | {
        type: "user_move";
        uci: string;
        now: string;
        solution: ContinuationSolution;
      }
    | { type: "reveal"; now: string; solution: ContinuationSolution }
    | { type: "retry" },
): ContinuationReducerState {
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
  const expected = input.solution.userMoves[state.userMoveCount];
  const correct = expected === input.uci;
  const count = state.userMoveCount + 1;
  const complete = count >= input.solution.userMoves.length;
  const next = {
    ...state,
    state: complete ? ("submitted" as const) : ("in_progress" as const),
    userMoveCount: count,
    objectiveScore: state.objectiveScore + (correct ? 1 : 0),
    moveQualityScore: state.moveQualityScore + (correct ? 1 : 0),
    pendingReply: !complete,
    terminal: complete,
  };
  return complete
    ? {
        ...next,
        ...recordActivityAttempt(next, {
          outcome: correct ? "correct" : "incorrect",
          now: input.now,
          feedback: input.solution.explanation,
        }),
      }
    : next;
}
