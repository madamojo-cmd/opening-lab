import {
  buildActivityIdentity,
  rejection,
  type ActivityBuildResult,
} from "@/lib/blundr/daily/core/dailyActivityConformance";
import {
  legalMoves,
  validateActivityAccess,
} from "@/lib/blundr/daily/activities/activityUtils";
import { validateDeepMiniGameScenario } from "./deepMiniGameValidator";
import type { DeepMiniGameScenario } from "./deepMiniGameTypes";
export function buildDeepTacticShots(input: {
  openingId: string;
  positionKey: string;
  startFen: string;
  userMoves: readonly string[];
  opponentReplies: readonly string[];
  access: {
    decision: string;
    checkedAt: string;
    expiresAt: string | null;
  } | null;
}): ActivityBuildResult<DeepMiniGameScenario> {
  const access = validateActivityAccess({ access: input.access });
  if (access) return access;
  if (input.userMoves.length < 2 || input.userMoves.length > 4)
    return rejection(
      "missing_approved_content",
      "Tactic sequence must contain 2–4 user plies.",
    );
  const moves = legalMoves(input.startFen);
  if (!Array.isArray(moves) || !moves.length)
    return rejection("illegal_move", "No legal tactic position exists.");
  const scenario: DeepMiniGameScenario = {
    id: buildActivityIdentity(
      "tactic_shots_deep",
      input.positionKey,
      input.positionKey,
    ),
    miniGameId: "tactic_shots_deep",
    startFen: input.startFen,
    sideToMove: "white",
    solution: {
      userMoves: input.userMoves,
      opponentReplies: input.opponentReplies,
    },
    schemaVersion: "deep-schema-v1",
    generatorVersion: "tactic-shots-deep-generator-v1",
    validatorVersion: "tactic-shots-deep-validator-v1",
    evidenceVersion: "approved-tactic-v1",
  };
  const result = validateDeepMiniGameScenario(scenario);
  if (result.ok)
    return {
      ok: true,
      activityId: "tactic_shots_deep",
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
