import {
  buildActivityIdentity,
  rejection,
  type ActivityBuildResult,
} from "@/lib/blundr/daily/core/dailyActivityConformance";
import { validateActivityAccess } from "../activityUtils";
import {
  continuationObjectives,
  isContinuationObjective,
} from "./continuationObjectiveRegistry";
import type { ContinuationSolution } from "./continuationChallengeTypes";
export function buildContinuationChallenge(input: {
  openingId: string;
  side: "white" | "black";
  positionKey: string;
  access: {
    decision: string;
    checkedAt: string;
    expiresAt: string | null;
  } | null;
  objective: string;
  userMoves: readonly string[];
  opponentReplies: readonly string[];
  sourceId: string;
  evidenceVerified: boolean;
  explanation?: string;
}): ActivityBuildResult<ContinuationSolution> {
  const accessError = validateActivityAccess({ access: input.access });
  if (accessError) return accessError;
  if (!isContinuationObjective(input.objective))
    return rejection(
      "unsupported_objective",
      "This continuation objective is not supported.",
    );
  if (
    !input.evidenceVerified ||
    !input.userMoves.length ||
    input.userMoves.length > 3 ||
    input.opponentReplies.length < input.userMoves.length
  )
    return rejection(
      "missing_approved_content",
      "A verified bounded continuation is not available.",
    );
  return {
    ok: true,
    activityId: "daily_continuation_challenge",
    schemaVersion: "2026-07-13.v1",
    generatorVersion: "continuation-challenge-generator-v1",
    validatorVersion: "continuation-challenge-validator-v1",
    cardFingerprint: buildActivityIdentity(
      "daily_continuation_challenge",
      input.positionKey,
      input.sourceId,
    ),
    positionKey: input.positionKey,
    openingId: input.openingId,
    side: input.side,
    evidence: [
      {
        source: "continuation",
        sourceId: input.sourceId,
        version: "continuation-challenge-v1",
        confidence: 0.8,
        verified: true,
        observedAt: new Date().toISOString(),
      },
    ],
    solution: {
      objective: input.objective,
      userMoves: input.userMoves,
      opponentReplies: input.opponentReplies,
      explanation:
        input.explanation ??
        `This sequence supports the objective: ${continuationObjectives[input.objective]}.`,
      maxUserMoves: 3,
    },
  };
}
