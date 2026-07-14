import {
  replayRoute,
  routesReachSamePosition,
} from "./transpositionGroupBuilder";
import type { TranspositionSolution } from "./transpositionActivityTypes";
export function validateTranspositionActivity(
  startFen: string,
  solution: TranspositionSolution,
): string[] {
  const standard = replayRoute(startFen, solution.standardRoute);
  const alternate = replayRoute(startFen, solution.alternateRoute);
  if (!standard || !alternate) return ["illegal_route"];
  return [
    ...(routesReachSamePosition(standard, alternate)
      ? []
      : ["route_fen_mismatch"]),
    ...(standard.moves.join(",") === alternate.moves.join(",")
      ? ["routes_not_distinct"]
      : []),
  ];
}
