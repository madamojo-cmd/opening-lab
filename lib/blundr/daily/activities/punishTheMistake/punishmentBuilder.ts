import {
  buildActivityIdentity,
  rejection,
  type ActivityBuildResult,
} from "@/lib/blundr/daily/core/dailyActivityConformance";
import { validateActivityAccess } from "../activityUtils";
import { punishmentFindingEvidence } from "./punishmentFindingAdapter";
import { validateRefutationSequence } from "./refutationValidator";
import type { PunishmentSolution } from "./punishmentTypes";
export function buildPunishmentActivity(input: {
  openingId: string;
  side: "white" | "black";
  positionKey: string;
  fen: string;
  mistakeMove: string;
  bestResponses: readonly string[];
  continuation: readonly string[];
  sourceId: string;
  source: "imported_game" | "continuation";
  access: {
    decision: string;
    checkedAt: string;
    expiresAt: string | null;
  } | null;
  evidenceVerified: boolean;
  explanation: string;
}): ActivityBuildResult<PunishmentSolution> {
  const accessError = validateActivityAccess({ access: input.access });
  if (accessError) return accessError;
  if (!input.evidenceVerified)
    return rejection(
      "unstable_engine_result",
      "The punishment evidence is not stable enough.",
    );
  if (!input.bestResponses.length)
    return rejection(
      "ambiguous_accepted_set",
      "No verified response is available.",
    );
  const error = validateRefutationSequence(input.fen, [
    ...input.bestResponses.slice(0, 1),
    ...input.continuation,
  ]);
  if (error.length)
    return rejection("illegal_move", "The refutation sequence is not legal.");
  return {
    ok: true,
    activityId: "daily_punish_the_mistake",
    schemaVersion: "2026-07-13.v1",
    generatorVersion: "punishment-generator-v1",
    validatorVersion: "punishment-validator-v1",
    cardFingerprint: buildActivityIdentity(
      "daily_punish_the_mistake",
      input.positionKey,
      input.sourceId,
    ),
    positionKey: input.positionKey,
    openingId: input.openingId,
    side: input.side,
    evidence: [
      punishmentFindingEvidence({
        sourceId: input.sourceId,
        source: input.source,
      }),
    ],
    solution: {
      bestResponses: input.bestResponses,
      continuation: input.continuation,
      explanation: input.explanation,
      mistakeMove: input.mistakeMove,
    },
  };
}
