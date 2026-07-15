import { createActivityAttemptState } from "@/lib/blundr/daily/core/dailyActivityConformance";
import type { MixedTestItem, MixedTestState } from "./mixedTestTypes";
export function createMixedTestState(
  items: readonly MixedTestItem[],
): MixedTestState {
  return {
    ...createActivityAttemptState(),
    items: [...items],
    currentIndex: 0,
    outcomes: [],
    score: 0,
    firstAttemptOutcomes: [],
  };
}
export function reduceMixedTest(
  state: MixedTestState,
  event:
    | { type: "submit"; correct: boolean; now: string }
    | { type: "reveal"; now: string }
    | { type: "retry" }
    | { type: "resume" },
): MixedTestState {
  if (event.type === "retry")
    return { ...state, state: "in_progress", retryCount: state.retryCount + 1 };
  if (event.type === "resume") return state;
  if (state.currentIndex >= state.items.length || state.state === "completed")
    return state;
  const outcome =
    event.type === "reveal"
      ? "reveal"
      : event.correct
        ? "correct"
        : "incorrect";
  const outcomes = [...state.outcomes, outcome] as MixedTestState["outcomes"];
  const firstAttemptOutcomes = [
    ...state.firstAttemptOutcomes,
    outcome,
  ] as MixedTestState["firstAttemptOutcomes"];
  const done = outcomes.length === state.items.length;
  const firstAttempt = done
    ? firstAttemptOutcomes.includes("reveal")
      ? "reveal"
      : firstAttemptOutcomes.includes("incorrect")
        ? "incorrect"
        : "correct"
    : state.firstAttempt;
  return {
    ...state,
    state: done ? "completed" : "in_progress",
    currentIndex: state.currentIndex + 1,
    outcomes,
    score: state.score + (outcome === "correct" ? 1 : 0),
    firstAttempt,
    firstAttemptOutcomes,
    firstAttemptRecordedAt: done ? event.now : state.firstAttemptRecordedAt,
    feedback: done
      ? "Mixed Test complete."
      : event.type === "reveal"
        ? "Item revealed; no credit recorded."
        : null,
  };
}
