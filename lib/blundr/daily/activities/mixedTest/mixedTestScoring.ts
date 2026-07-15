import type { MixedTestState } from "./mixedTestTypes";
export function scoreMixedTest(state: MixedTestState) {
  return {
    score: state.score,
    total: state.items.length,
    accuracy: state.items.length ? state.score / state.items.length : 0,
    outcomes: state.outcomes,
  };
}
