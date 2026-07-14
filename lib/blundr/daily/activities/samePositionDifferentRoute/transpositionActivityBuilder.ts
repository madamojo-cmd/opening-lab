import {
  buildActivityIdentity,
  rejection,
  type ActivityBuildResult,
} from "@/lib/blundr/daily/core/dailyActivityConformance";
import { validateActivityAccess, evidence } from "../activityUtils";
import {
  replayRoute,
  routesReachSamePosition,
} from "./transpositionGroupBuilder";
import type { TranspositionSolution } from "./transpositionActivityTypes";
export function buildTranspositionActivity(input: {
  openingId: string;
  side: "white" | "black";
  positionKey: string;
  startFen: string;
  standardRoute: readonly string[];
  alternateRoute: readonly string[];
  expectedMoves: readonly string[];
  access: {
    decision: string;
    checkedAt: string;
    expiresAt: string | null;
  } | null;
  sourceId: string;
}): ActivityBuildResult<TranspositionSolution> {
  const accessError = validateActivityAccess({ access: input.access });
  if (accessError) return accessError;
  const standard = replayRoute(input.startFen, input.standardRoute);
  const alternate = replayRoute(input.startFen, input.alternateRoute);
  if (!standard || !alternate)
    return rejection("illegal_move", "Both routes must replay legally.");
  if (
    !routesReachSamePosition(standard, alternate) ||
    standard.moves.join(",") === alternate.moves.join(",")
  )
    return rejection(
      "missing_route_equality",
      "No distinct legal routes reach the same position.",
    );
  if (!input.expectedMoves.length)
    return rejection(
      "missing_approved_content",
      "The shared position has no approved move.",
    );
  return {
    ok: true,
    activityId: "daily_same_position_different_route",
    schemaVersion: "2026-07-13.v1",
    generatorVersion: "transposition-generator-v1",
    validatorVersion: "transposition-validator-v1",
    cardFingerprint: buildActivityIdentity(
      "daily_same_position_different_route",
      input.positionKey,
      input.sourceId,
    ),
    positionKey: input.positionKey,
    openingId: input.openingId,
    side: input.side,
    evidence: [
      evidence("runtime", input.sourceId, "transposition-v1", 0.9, true),
    ],
    solution: {
      standardRoute: standard.moves,
      alternateRoute: alternate.moves,
      expectedMoves: input.expectedMoves,
      sharedFen: standard.finalFen,
    },
  };
}
