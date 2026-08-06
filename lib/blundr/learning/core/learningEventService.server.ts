import "server-only";

import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";
import {
  createDeterministicIdentity,
  type LearningEventV2,
  type OpeningAccessSnapshot,
  type PositionIdentity,
} from "@/lib/blundr/contracts";
import { buildLearningProjection } from "./learningProjection";
import { emitBlundrOperationalEvent } from "@/lib/blundr/telemetry/operationalTelemetry.server";

export async function prepareLearningEventV2(input: {
  userId: string;
  sessionId: string;
  attemptId: string;
  source: LearningEventV2["source"];
  taxonomy: LearningEventV2["taxonomy"];
  position: PositionIdentity;
  correct: boolean;
  now: string;
  access: OpeningAccessSnapshot;
  explanation?: string;
  playedMoveUci?: string | null;
  reviewEvidence?: {
    evidenceType: "answer" | "reveal" | "skip" | "timeout";
    hinted?: boolean;
    elapsedMs?: number | null;
    retry?: boolean;
  };
  /** A requested rating is accepted only by the private Review authority. */
  requestedRating?: "again" | "hard" | "good" | "easy";
}): Promise<{ event: Record<string, unknown>; eventId: string }> {
  const eventId = createDeterministicIdentity("learning-event", [
    input.userId,
    input.attemptId,
  ]);
  const idempotencyKey = createDeterministicIdentity("learning-attempt", [
    input.userId,
    input.attemptId,
    input.taxonomy,
  ]);
  if (input.requestedRating && input.source !== "review")
    throw new Error("requested_rating_requires_review");
  const client = createBlundrSupabaseAdminClient();
  if (!client) {
    if (process.env.NODE_ENV === "test") return { event: {}, eventId };
    throw new Error("learning_event_persistence_unavailable");
  }
  const [review, mastery] = await Promise.all([
    client
      .from("blundr_review_states")
      .select("srs_state,review_state_version")
      .eq("user_id", input.userId)
      .eq("opening_id", input.position.openingId)
      .eq("play_key", input.position.moveOrderKey)
      .maybeSingle(),
    client
      .from("blundr_node_mastery")
      .select(
        "recall_attempt_count,correct_recall_count,lapse_count,mastery_state_version",
      )
      .eq("user_id", input.userId)
      .eq("position_key", input.position.positionKey)
      .maybeSingle(),
  ]);
  if (review.error || mastery.error)
    throw new Error("learning_projection_read_unavailable");
  const recallAttempt =
    input.taxonomy === "move_correct" ||
    input.taxonomy === "move_incorrect" ||
    input.taxonomy === "cue_revealed";
  const exposureId = recallAttempt
    ? createDeterministicIdentity("learning-exposure", [
        input.userId,
        input.sessionId,
        input.position.positionKey,
      ])
    : null;
  const projection = buildLearningProjection({
    source: input.source,
    firstAttempt: recallAttempt,
    exposureId,
    correct: input.correct,
    occurredAt: input.now,
    hinted: input.reviewEvidence?.hinted ?? input.taxonomy === "cue_revealed",
    elapsedMs: input.reviewEvidence?.elapsedMs ?? null,
    requestedRating: input.requestedRating,
    previousFsrs: (review.data?.srs_state as never) ?? null,
    previousMastery: mastery.data
      ? {
          recallAttemptCount: Number(mastery.data.recall_attempt_count ?? 0),
          correctRecallCount: Number(mastery.data.correct_recall_count ?? 0),
          lapseCount: Number(mastery.data.lapse_count ?? 0),
        }
      : null,
  });
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
    played_move_uci: input.playedMoveUci ?? null,
    repertoire_side: input.position.repertoireSide,
    move_order_key: input.position.moveOrderKey,
    source: input.source === "imported_game" ? "imported_game" : input.source,
    first_attempt: projection.firstAttempt,
    finding: input.correct
      ? null
      : {
          category: "opening_move",
          explanation: input.explanation ?? "The approved move was missed.",
        },
    content_version: "stage2-approved-content-v1",
    classifier_version: "weakness-classifier-v1",
    evidence_kind: projection.evidenceKind,
    exposure_id: exposureId,
    evidence_version: "blundr-learning-evidence-v2",
    authority_fingerprint: createDeterministicIdentity("learning-authority", [
      input.userId,
      input.sessionId,
      input.position.positionKey,
      input.position.expectedMoveUci ?? "",
      input.playedMoveUci ?? "",
      input.taxonomy,
      String(input.correct),
      exposureId ?? "",
      projection.evidenceKind === "recall_attempt"
        ? projection.fsrs.rating
        : "unrated",
      input.reviewEvidence?.evidenceType ?? "answer",
      String(input.reviewEvidence?.hinted ?? false),
      String(input.reviewEvidence?.elapsedMs ?? ""),
      input.requestedRating ?? "derived",
    ]),
    correct: input.correct,
    review_rating:
      projection.evidenceKind === "recall_attempt"
        ? projection.fsrs.rating
        : null,
    answer_evidence: {
      evidenceType:
        input.reviewEvidence?.evidenceType ??
        (input.taxonomy === "cue_revealed" ? "reveal" : "answer"),
      submittedAnswer: input.playedMoveUci ?? null,
      expectedAnswerIdentity: input.position.expectedMoveUci ?? null,
      correct: input.correct,
      firstAttempt: projection.firstAttempt,
      retry: input.reviewEvidence?.retry ?? false,
      revealOccurred:
        input.taxonomy === "cue_revealed" ||
        input.reviewEvidence?.evidenceType === "reveal",
      hinted: input.reviewEvidence?.hinted ?? false,
      elapsedMs: input.reviewEvidence?.elapsedMs ?? null,
      priorReps: Number(
        (review.data?.srs_state as { reps?: unknown } | null)?.reps ?? 0,
      ),
      taskId: input.attemptId,
      reservationId: input.sessionId,
      ratingRequested: Boolean(input.requestedRating),
    },
    access_decision: input.access.decision,
    expected_review_state_version: Number(
      review.data?.review_state_version ?? 0,
    ),
    expected_mastery_state_version: Number(
      mastery.data?.mastery_state_version ?? 0,
    ),
    ...(projection.evidenceKind === "recall_attempt"
      ? { fsrs: projection.fsrs, mastery: projection.mastery }
      : {}),
  };
  return { event, eventId };
}

export async function appendLearningEventV2(
  input: Parameters<typeof prepareLearningEventV2>[0],
): Promise<{
  status: "inserted" | "duplicate";
  eventId: string;
  reviewRating?: "again" | "hard" | "good" | "easy";
  reviewProjection?: unknown;
  dueAt?: string;
}> {
  const { event, eventId } = await prepareLearningEventV2(input);
  const client = createBlundrSupabaseAdminClient();
  if (!client) {
    if (process.env.NODE_ENV === "test") return { status: "inserted", eventId };
    throw new Error("learning_event_persistence_unavailable");
  }
  const inserted = await client.rpc("blundr_project_learning_evidence_v2", {
    p_user_id: input.userId,
    p_event: event,
  });
  if (inserted.error) throw new Error("learning_event_persistence_unavailable");
  const status = inserted.data?.status;
  if (status !== "inserted" && status !== "duplicate")
    throw new Error("learning_event_persistence_unavailable");
  await emitBlundrOperationalEvent("mastery_projected", {
    status,
    access: input.access.decision,
  });
  const reviewRating = inserted.data?.reviewRating;
  return {
    status,
    eventId,
    ...(reviewRating === "again" ||
    reviewRating === "hard" ||
    reviewRating === "good" ||
    reviewRating === "easy"
      ? { reviewRating }
      : {}),
    ...(inserted.data?.reviewProjection !== undefined
      ? { reviewProjection: inserted.data.reviewProjection }
      : {}),
    ...(typeof inserted.data?.dueAt === "string"
      ? { dueAt: inserted.data.dueAt }
      : {}),
  };
}
