import type { TranspositionSolution } from "./transpositionActivityTypes";
export function scoreTransposition(
  uci: string | null,
  solution: TranspositionSolution,
) {
  return {
    positionMastery: Boolean(uci && solution.expectedMoves.includes(uci)),
    routeRecognition: Boolean(uci && solution.alternateRoute.includes(uci)),
  };
}
