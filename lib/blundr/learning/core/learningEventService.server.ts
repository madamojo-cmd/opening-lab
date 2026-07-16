import "server-only";

import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";
import {
  createDeterministicIdentity,
  type LearningEventV2,
  type OpeningAccessSnapshot,
  type PositionIdentity,
} from "@/lib/blundr/contracts";
import { reduceNodeMastery } from "./nodeMasteryReducer";

export async function appendLearningEventV2(input: {
  userId: string;
  sessionId: string;
  attemptId: string;
  source: LearningEventV2["source"];
  taxonomy: LearningEventV2["taxonomy"];
  position: PositionIdentity;
  correct: boolean;
  firstAttempt: boolean;
  now: string;
  access: OpeningAccessSnapshot;
  explanation?: string;
}): Promise<{ status: "inserted" | "duplicate"; eventId: string }> {
  const eventId = createDeterministicIdentity("learning-event", [
    input.userId,
    input.attemptId,
  ]);
  const idempotencyKey = createDeterministicIdentity("learning-attempt", [
    input.userId,
    input.attemptId,
    input.firstAttempt,
  ]);
  const client = createBlundrSupabaseAdminClient();
  if (!client) return { status: "inserted", eventId };
  const event = {
    event_id: eventId,
    user_id: input.userId,
    idempotency_key: idempotencyKey,
    schema_version: "2026-07-13.v1",
    session_id: input.sessionId,
    attempt_id: input.attemptId,
    occurred_at: input.now,
    taxonomy: input.taxonomy,
    position_key: input.position.positionKey,
    canonical_fen: input.position.canonicalFen,
    opening_id: input.position.openingId,
    expected_move_uci: input.position.expectedMoveUci,
    repertoire_side: input.position.repertoireSide,
    move_order_key: input.position.moveOrderKey,
    source: input.source === "imported_game" ? "imported_game" : input.source,
    first_attempt: input.firstAttempt,
    finding: input.correct
      ? null
      : {
          category: "opening_move",
          explanation: input.explanation ?? "The approved move was missed.",
        },
    content_version: "stage2-approved-content-v1",
    classifier_version: "weakness-classifier-v1",
  };
  const inserted = await client.from("blundr_learning_events").insert(event);
  if (inserted.error && inserted.error.code !== "23505")
    throw new Error("learning_event_persistence_unavailable");
  if (inserted.error?.code === "23505") return { status: "duplicate", eventId };
  const previous = await client
    .from("blundr_node_mastery")
    .select("*")
    .eq("user_id", input.userId)
    .eq("position_key", input.position.positionKey)
    .maybeSingle();
  const mastery = reduceNodeMastery(
    previous.data
      ? {
          positionKey: input.position.positionKey,
          userId: input.userId,
          attempts: Number(previous.data.attempts ?? 0),
          firstAttemptAt: previous.data.first_attempt_at,
          firstAttemptResult: previous.data.first_attempt_result,
          confidence: Number(previous.data.confidence ?? 0),
          updatedAt: String(previous.data.updated_at ?? input.now),
          access: input.access.decision,
        }
      : null,
    {
      schemaVersion: "2026-07-13.v1",
      eventId: eventId as LearningEventV2["eventId"],
      attemptId: input.attemptId as LearningEventV2["attemptId"],
      sessionId: input.sessionId as LearningEventV2["sessionId"],
      userId: input.userId,
      occurredAt: input.now,
      taxonomy: input.taxonomy,
      position: input.position,
      finding: null,
      firstAttempt: input.firstAttempt,
      idempotencyKey,
      source: input.source,
      contentVersion: "stage2-approved-content-v1",
      classifierVersion: "weakness-classifier-v1",
      migrationMarker: null,
      deletedAt: null,
    },
    input.access,
  );
  if (mastery.changed)
    await client.from("blundr_node_mastery").upsert({
      user_id: input.userId,
      position_key: input.position.positionKey,
      attempts: mastery.state.attempts,
      first_attempt_at: mastery.state.firstAttemptAt,
      first_attempt_result: mastery.state.firstAttemptResult,
      confidence: mastery.state.confidence,
      access_decision: mastery.state.access,
      updated_at: input.now,
    });
  if (!input.correct)
    await client.from("blundr_weakness_projection").upsert({
      user_id: input.userId,
      position_key: input.position.positionKey,
      category: "opening_move",
      score: 0.7,
      confidence: 0.65,
      explanation: input.explanation ?? "The approved move was missed.",
      recommended_daily_intervention: "recall_move",
      access_decision: input.access.decision,
      source_event_ids: [eventId],
      updated_at: input.now,
    });
  return { status: "inserted", eventId };
}
