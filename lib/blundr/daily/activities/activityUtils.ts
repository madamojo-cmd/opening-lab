import { Chess } from "chess.js";
import {
  createDeterministicIdentity,
  type LearningEventV2,
} from "@/lib/blundr/contracts";
import {
  rejection,
  type ActivityEvidence,
  type ActivityRejection,
  isActiveAccess,
} from "@/lib/blundr/daily/core/dailyActivityConformance";

export function legalMoves(
  fen: string,
): { uci: string; san: string }[] | ActivityRejection {
  try {
    const chess = new Chess(fen);
    return chess.moves({ verbose: true }).map((move) => ({
      uci: `${move.from}${move.to}${move.promotion ?? ""}`,
      san: move.san,
    }));
  } catch {
    return rejection("illegal_move", "The displayed position is not legal.");
  }
}

export function validateActivityAccess(input: {
  access:
    | { decision: string; checkedAt: string; expiresAt: string | null }
    | null
    | undefined;
}): ActivityRejection | null {
  if (!input.access || input.access.decision !== "active")
    return rejection(
      "locked_access",
      "This opening is not currently available.",
    );
  if (!isActiveAccess(input.access))
    return rejection("stale_access", "Opening access needs to be refreshed.");
  return null;
}

export function evidence(
  source: ActivityEvidence["source"],
  sourceId: string,
  version: string,
  confidence: number,
  verified: boolean,
  observedAt = new Date().toISOString(),
): ActivityEvidence {
  return { source, sourceId, version, confidence, verified, observedAt };
}

export function activityLearningEvent(input: {
  userId: string;
  sessionId: string;
  activityId: string;
  positionKey: string;
  taxonomy: LearningEventV2["taxonomy"];
  firstAttempt: boolean;
  now: string;
  sourceId: string;
  position?: LearningEventV2["position"];
}): LearningEventV2 {
  const eventId = createDeterministicIdentity("daily-event", [
    input.userId,
    input.sessionId,
    input.activityId,
    input.positionKey,
    input.taxonomy,
    input.firstAttempt ? "first" : "retry",
    input.now,
  ]);
  return {
    schemaVersion: "2026-07-13.v1",
    eventId: eventId as LearningEventV2["eventId"],
    attemptId: null,
    sessionId: input.sessionId as LearningEventV2["sessionId"],
    userId: input.userId,
    occurredAt: input.now,
    taxonomy: input.taxonomy,
    position: input.position ?? null,
    finding: null,
    firstAttempt: input.firstAttempt,
    idempotencyKey: eventId,
    source: "daily",
    contentVersion: "daily-activity-v1",
    classifierVersion: "daily-activity-classifier-v1",
    migrationMarker: null,
    deletedAt: null,
  };
}
