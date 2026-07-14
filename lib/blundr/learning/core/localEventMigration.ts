import type { LearningEvent } from "@/lib/blundr/learning/learningEvents";
import {
  BLUNDR_CLASSIFIER_VERSION,
  BLUNDR_CONTENT_VERSION,
  BLUNDR_CONTRACT_VERSION,
  createDeterministicIdentity,
  createPositionIdentity,
  type LearningEventV2,
} from "@/lib/blundr/contracts";

export const LOCAL_EVENT_MIGRATION_VERSION =
  "legacy-learning-events-v1-to-v2" as const;

export function migrateLegacyLearningEvent(
  event: LearningEvent,
  userId: string,
  migratedAt: string,
): LearningEventV2 {
  const position = event.fen
    ? createPositionIdentity({
        canonicalFen: event.fen,
        openingId: event.openingId,
        expectedMoveUci: event.expectedMoveUci,
        repertoireSide: "unknown",
      })
    : null;
  const taxonomy =
    event.type === "move_correct"
      ? "move_correct"
      : event.type === "move_incorrect"
        ? "move_incorrect"
        : event.type === "cue_revealed"
          ? "cue_revealed"
          : event.type === "position_loaded"
            ? "position_seen"
            : "move_attempted";
  const eventId = createDeterministicIdentity("event", [
    LOCAL_EVENT_MIGRATION_VERSION,
    event.id,
  ]) as LearningEventV2["eventId"];
  return {
    schemaVersion: BLUNDR_CONTRACT_VERSION,
    eventId,
    attemptId: null,
    sessionId: createDeterministicIdentity("session", [
      userId,
      event.sessionId,
    ]) as LearningEventV2["sessionId"],
    userId,
    occurredAt: event.createdAt,
    taxonomy,
    position,
    finding: null,
    firstAttempt:
      event.type === "move_attempted" ||
      event.type === "move_correct" ||
      event.type === "move_incorrect",
    idempotencyKey: createDeterministicIdentity("legacy", [userId, event.id]),
    source:
      event.source === "review"
        ? "review"
        : event.source === "debug"
          ? "system"
          : "train",
    contentVersion: BLUNDR_CONTENT_VERSION,
    classifierVersion: BLUNDR_CLASSIFIER_VERSION,
    migrationMarker: `${LOCAL_EVENT_MIGRATION_VERSION}:${migratedAt.slice(0, 10)}`,
    deletedAt: null,
  };
}
