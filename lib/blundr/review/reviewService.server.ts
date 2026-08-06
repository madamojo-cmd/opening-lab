import "server-only";

import { createPositionIdentity } from "@/lib/blundr/contracts";
import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";
import { loadOpeningAccess } from "@/lib/blundr/gameData/gameDataService";
import { getOpeningSide } from "@/lib/blundr/repertoire/repertoireOpeningPool";
import { resolveRuntimeReviewPosition } from "@/lib/blundr/learning/core/runtimeLearningPosition.server";
import { prepareLearningEventV2 } from "@/lib/blundr/learning/core/learningEventService.server";
import { createDeterministicIdentity } from "@/lib/blundr/contracts";
import type { CurrentBlundrUser } from "@/lib/blundr/accounts/accountTypes";
import {
  allowedRatings,
  reviewItemId,
  type ReviewRating,
} from "./reviewContracts";

type DueRow = {
  opening_id: string;
  play_key: string;
  review_state_version: number;
  srs_state: { reps?: number } | null;
  due_at: string;
};

/** Server-only queue: it intentionally never exposes the answer or raw SRS card. */
export async function getReviewQueue(user: CurrentBlundrUser) {
  const client = createBlundrSupabaseAdminClient();
  if (!client) throw new Error("review_persistence_unavailable");
  const rows = await client
    .from("blundr_review_states")
    .select("opening_id,play_key,review_state_version,srs_state,due_at")
    .eq("user_id", user.userId)
    .lte("due_at", new Date().toISOString())
    .order("due_at")
    .limit(50);
  if (rows.error) throw new Error("review_queue_unavailable");
  const access = await loadOpeningAccess(user);
  const items = [];
  for (const row of (rows.data ?? []) as DueRow[]) {
    const verified = await resolveRuntimeReviewPosition({
      openingId: row.opening_id,
      moveOrderKey: row.play_key,
    });
    if (!verified) continue; // orphaned runtime coordinates fail closed
    const side =
      getOpeningSide(verified.openingId) === "black" ? "black" : "white";
    if (
      access.get({
        userId: user.userId,
        openingId: verified.openingId,
        repertoireSide: side,
      }).decision !== "active"
    )
      continue;
    const itemId = reviewItemId({
      userId: user.userId,
      openingId: row.opening_id,
      playKey: row.play_key,
      version: Number(row.review_state_version),
    });
    const attemptId = createDeterministicIdentity("review-attempt", [
      user.userId,
      itemId,
      row.review_state_version,
    ]);
    const reserved = await client.rpc("blundr_reserve_review_attempt_v1", {
      p_user_id: user.userId,
      p_reservation: {
        attempt_id: attemptId,
        review_item_id: itemId,
        opening_id: row.opening_id,
        play_key: row.play_key,
        review_state_version: Number(row.review_state_version),
        expected_move_uci: verified.expectedMoveUci,
        prior_reps: Number(row.srs_state?.reps ?? 0),
      },
    });
    if (reserved.error) throw new Error("review_reservation_unavailable");
    const attemptState = reserved.data?.state ?? "awaiting_answer";
    const elapsedMs = Math.max(
      0,
      Date.now() -
        Date.parse(
          String(reserved.data?.startedAt ?? new Date().toISOString()),
        ),
    );
    items.push({
      reviewItemId: itemId,
      openingId: row.opening_id,
      playKey: row.play_key,
      fen: verified.canonicalFen,
      dueAt: row.due_at,
      attempt: { attemptId, state: attemptState },
      allowedRatings:
        attemptState === "awaiting_rating"
          ? allowedRatings({
              correct: true,
              revealOccurred: false,
              priorFailure: false,
              priorReps: Number(row.srs_state?.reps ?? 0),
              elapsedMs,
            })
          : [],
    });
  }
  return { items };
}

export async function commitReviewAttempt(input: {
  user: CurrentBlundrUser;
  itemId: string;
  attemptId: string;
  playedMoveUci?: string | null;
  reveal?: boolean;
}) {
  const client = createBlundrSupabaseAdminClient();
  if (!client) throw new Error("review_persistence_unavailable");
  const event = await prepareReviewEvent({
    ...input,
    requestedRating: "again",
  });
  const result = await client.rpc("blundr_commit_review_attempt_v1", {
    p_user_id: input.user.userId,
    p_item_id: input.itemId,
    p_attempt_id: input.attemptId,
    p_played_move_uci: input.playedMoveUci ?? null,
    p_reveal: Boolean(input.reveal),
    p_event: event,
  });
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function commitReviewRating(input: {
  user: CurrentBlundrUser;
  itemId: string;
  attemptId: string;
  rating: ReviewRating;
  idempotencyId: string;
}) {
  const client = createBlundrSupabaseAdminClient();
  if (!client) throw new Error("review_persistence_unavailable");
  const event = await prepareReviewEvent({
    ...input,
    requestedRating: input.rating,
  });
  const result = await client.rpc("blundr_commit_review_rating_v1", {
    p_user_id: input.user.userId,
    p_item_id: input.itemId,
    p_attempt_id: input.attemptId,
    p_rating: input.rating,
    p_idempotency_id: input.idempotencyId,
    p_event: event,
  });
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export { allowedRatings };

async function prepareReviewEvent(input: {
  user: CurrentBlundrUser;
  itemId: string;
  attemptId: string;
  playedMoveUci?: string | null;
  reveal?: boolean;
  requestedRating: ReviewRating;
}) {
  const client = createBlundrSupabaseAdminClient();
  if (!client) throw new Error("review_persistence_unavailable");
  const attempt = await client
    .from("blundr_review_attempts")
    .select(
      "opening_id,play_key,expected_move_uci,state,review_state_version,started_at,actual_move_uci,reveal_occurred,prior_failure,correct,prior_reps",
    )
    .eq("user_id", input.user.userId)
    .eq("review_item_id", input.itemId)
    .eq("attempt_id", input.attemptId)
    .maybeSingle();
  if (attempt.error || !attempt.data)
    throw new Error("review_item_not_reserved");
  const runtime = await resolveRuntimeReviewPosition({
    openingId: attempt.data.opening_id,
    moveOrderKey: attempt.data.play_key,
  });
  if (!runtime || runtime.expectedMoveUci !== attempt.data.expected_move_uci)
    throw new Error("review_runtime_stale");
  const side =
    getOpeningSide(runtime.openingId) === "black" ? "black" : "white";
  const access = await loadOpeningAccess(input.user);
  const snapshot = access.get({
    userId: input.user.userId,
    openingId: runtime.openingId,
    repertoireSide: side,
  });
  if (snapshot.decision !== "active")
    throw new Error("review_opening_access_denied");
  const position = createPositionIdentity({
    canonicalFen: runtime.canonicalFen,
    openingId: runtime.openingId,
    moveOrderKey: runtime.moveOrderKey,
    expectedMoveUci: runtime.expectedMoveUci,
    repertoireSide: side,
  });
  const playedMoveUci =
    input.playedMoveUci ?? attempt.data.actual_move_uci ?? null;
  const reveal = input.reveal ?? Boolean(attempt.data.reveal_occurred);
  const correct =
    input.playedMoveUci !== undefined
      ? !reveal && playedMoveUci === runtime.expectedMoveUci
      : Boolean(attempt.data.correct);
  const prepared = await prepareLearningEventV2({
    userId: input.user.userId,
    sessionId: input.attemptId,
    attemptId: input.attemptId,
    source: "review",
    taxonomy: correct
      ? "move_correct"
      : reveal
        ? "cue_revealed"
        : "move_incorrect",
    position,
    correct,
    now: new Date().toISOString(),
    access: snapshot,
    playedMoveUci,
    requestedRating: input.requestedRating,
    reviewEvidence: {
      evidenceType: reveal ? "reveal" : "answer",
      hinted: reveal,
      elapsedMs: Math.max(
        0,
        Date.now() - new Date(attempt.data.started_at).getTime(),
      ),
      retry: Boolean(attempt.data.prior_failure),
    },
  });
  return prepared.event;
}
