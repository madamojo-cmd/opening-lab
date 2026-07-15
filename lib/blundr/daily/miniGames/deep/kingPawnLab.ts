import {
  buildActivityIdentity,
  type ActivityBuildResult,
  rejection,
} from "@/lib/blundr/daily/core/dailyActivityConformance";
import { validateActivityAccess } from "@/lib/blundr/daily/activities/activityUtils";
import { validateDeepMiniGameScenario } from "./deepMiniGameValidator";
import type { DeepMiniGameScenario } from "./deepMiniGameTypes";
export function buildKingPawnLab(input: {
  openingId: string;
  positionKey: string;
  startFen: string;
  userMoves: readonly string[];
  opponentReplies: readonly string[];
  result: "win" | "draw" | "hold";
  access: {
    decision: string;
    checkedAt: string;
    expiresAt: string | null;
  } | null;
}): ActivityBuildResult<DeepMiniGameScenario> {
  const access = validateActivityAccess({ access: input.access });
  if (access) return access;
  if (input.userMoves.length < 2)
    return rejection(
      "missing_approved_content",
      "Endgame requires a verified multi-step line.",
    );
  const scenario: DeepMiniGameScenario = {
    id: buildActivityIdentity(
      "king_pawn_lab",
      input.positionKey,
      input.positionKey,
    ),
    miniGameId: "king_pawn_lab",
    startFen: input.startFen,
    sideToMove: "white",
    solution: {
      userMoves: input.userMoves,
      opponentReplies: input.opponentReplies,
      terminalResult: input.result,
    },
    schemaVersion: "deep-schema-v1",
    generatorVersion: "king-pawn-lab-generator-v1",
    validatorVersion: "king-pawn-lab-validator-v1",
    evidenceVersion: "curated-endgame-v1",
  };
  const result = validateDeepMiniGameScenario(scenario);
  if (result.ok)
    return {
      ok: true,
      activityId: "king_pawn_lab",
      schemaVersion: "2026-07-13.v1",
      generatorVersion: scenario.generatorVersion,
      validatorVersion: scenario.validatorVersion,
      cardFingerprint: scenario.id,
      positionKey: input.positionKey,
      openingId: input.openingId,
      side: "white",
      evidence: [],
      solution: scenario,
    };
  if ("reason" in result) return rejection(result.reason, result.message);
  return rejection("invalid_content", "Deep scenario validation failed.");
}
