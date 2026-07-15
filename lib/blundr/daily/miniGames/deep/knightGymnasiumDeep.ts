import {
  buildActivityIdentity,
  type ActivityBuildResult,
  rejection,
} from "@/lib/blundr/daily/core/dailyActivityConformance";
import { validateActivityAccess } from "@/lib/blundr/daily/activities/activityUtils";
import { validateDeepMiniGameScenario } from "./deepMiniGameValidator";
import type { DeepMiniGameScenario } from "./deepMiniGameTypes";
export function buildDeepKnightGymnasium(input: {
  openingId: string;
  positionKey: string;
  startFen: string;
  route: readonly string[];
  targets: readonly string[];
  access: {
    decision: string;
    checkedAt: string;
    expiresAt: string | null;
  } | null;
}): ActivityBuildResult<DeepMiniGameScenario> {
  const access = validateActivityAccess({ access: input.access });
  if (access) return access;
  if (input.targets.length < 2 || input.route.length < input.targets.length)
    return rejection(
      "missing_approved_content",
      "Knight route needs multiple reachable targets.",
    );
  const scenario: DeepMiniGameScenario = {
    id: buildActivityIdentity(
      "knight_gymnasium_deep",
      input.positionKey,
      input.positionKey,
    ),
    miniGameId: "knight_gymnasium_deep",
    startFen: input.startFen,
    sideToMove: "white",
    solution: {
      userMoves: input.route,
      opponentReplies: [],
      requiredTargets: input.targets,
    },
    schemaVersion: "deep-schema-v1",
    generatorVersion: "knight-gymnasium-deep-generator-v1",
    validatorVersion: "knight-gymnasium-deep-validator-v1",
    evidenceVersion: "approved-knight-route-v1",
  };
  const result = validateDeepMiniGameScenario(scenario);
  if (result.ok)
    return {
      ok: true,
      activityId: "knight_gymnasium_deep",
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
