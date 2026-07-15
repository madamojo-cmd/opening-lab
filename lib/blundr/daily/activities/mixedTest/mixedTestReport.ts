import type { MixedTestState } from "./mixedTestTypes";
export function buildMixedTestReport(state: MixedTestState) {
  return {
    ...scoreMixedTestLike(state),
    completedItems: state.outcomes.length,
    openings: [...new Set(state.items.map((item) => item.openingId))],
  };
}
function scoreMixedTestLike(state: MixedTestState) {
  return {
    score: state.score,
    total: state.items.length,
    accuracy: state.items.length ? state.score / state.items.length : 0,
  };
}
