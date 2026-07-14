import {
  createActivityAttemptState,
  recordActivityAttempt,
  type ActivityAttemptState,
} from "@/lib/blundr/daily/core/dailyActivityConformance";
import type { CandidateChoiceSolution } from "./candidateChoiceTypes";
export type CandidateChoiceReducerState = ActivityAttemptState & {
  selectedId: string | null;
};
export function initialCandidateChoiceState(): CandidateChoiceReducerState {
  return { ...createActivityAttemptState(), selectedId: null };
}
export function reduceCandidateChoice(
  state: CandidateChoiceReducerState,
  input:
    | { type: "select"; id: string }
    | { type: "submit"; now: string; solution: CandidateChoiceSolution }
    | { type: "reveal"; now: string; solution: CandidateChoiceSolution }
    | { type: "retry" },
): CandidateChoiceReducerState {
  if (input.type === "select")
    return state.state === "completed" || state.state === "revealed"
      ? state
      : { ...state, state: "in_progress", selectedId: input.id };
  if (input.type === "retry")
    return {
      ...state,
      ...recordActivityAttempt(state, {
        outcome: "retry",
        now: new Date().toISOString(),
        feedback: "Retry",
      }),
    };
  if (!state.selectedId)
    return {
      ...state,
      state: "invalid_content",
      feedback: "Choose an option before submitting.",
    };
  const correct = input.solution.acceptedIds.includes(state.selectedId);
  return {
    ...state,
    ...recordActivityAttempt(state, {
      outcome:
        input.type === "reveal" ? "reveal" : correct ? "correct" : "incorrect",
      now: input.now,
      feedback:
        input.type === "reveal"
          ? "The answer has been revealed."
          : (input.solution.feedbackById[state.selectedId] ?? "Recorded."),
    }),
  };
}
