import { NextResponse } from "next/server";
import { createPositionIdentity } from "@/lib/blundr/contracts";
import {
  loadOpeningAccess,
  requireGameDataUser,
} from "@/lib/blundr/gameData/gameDataService";
import { appendLearningEventV2 } from "@/lib/blundr/learning/core/learningEventService.server";
import { getOpeningSide } from "@/lib/blundr/repertoire/repertoireOpeningPool";
import { resolveVerifiedRuntimeLearningPosition } from "@/lib/blundr/learning/core/runtimeLearningPosition.server";
import { resolveLearningEventAttemptId } from "@/lib/blundr/learning/core/learningEventRequest";
import { resolveLearningAttemptAuthority } from "@/lib/blundr/learning/core/learningAttemptAuthority";
import { emitBlundrOperationalEvent } from "@/lib/blundr/telemetry/operationalTelemetry.server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await requireGameDataUser(request);
  if (!user)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  const body = (await request.json().catch(() => null)) as {
    eventId?: string;
    id?: string;
    sessionId?: string;
    type?: string;
    createdAt?: string;
    fen?: string;
    openingId?: string;
    moveOrderKey?: string;
    expectedMoveUci?: string;
    playedMoveUci?: string;
  } | null;
  const eventId = resolveLearningEventAttemptId(body);
  if (!eventId || !body?.sessionId || !body.fen || !body.type)
    return NextResponse.json(
      { error: "invalid_learning_event" },
      { status: 400 },
    );
  const receiptTime = new Date().toISOString();
  let taxonomy:
    | "move_attempted"
    | "move_correct"
    | "move_incorrect"
    | "cue_revealed" = "move_attempted";
  try {
    const verified = await resolveVerifiedRuntimeLearningPosition({
      openingId: body.openingId ?? null,
      moveOrderKey: body.moveOrderKey ?? null,
      canonicalFen: body.fen,
      expectedMoveUci: body.expectedMoveUci ?? null,
    });
    if (!verified) {
      await emitBlundrOperationalEvent("learning_event_rejected", {
        reason: "runtime_position_unverified",
        taxonomy: "unverified",
      });
      return NextResponse.json(
        { error: "runtime_position_unverified" },
        { status: 422 },
      );
    }
    const authority = resolveLearningAttemptAuthority({
      expectedMoveUci: verified.expectedMoveUci,
      playedMoveUci: body.playedMoveUci,
      requestedType: body.type,
      serverNow: receiptTime,
    });
    if ("error" in authority)
      return NextResponse.json({ error: authority.error }, { status: 400 });
    taxonomy = authority.taxonomy;
    const correct = authority.correct;
    const side =
      getOpeningSide(verified.openingId) === "black" ? "black" : "white";
    const position = createPositionIdentity({
      canonicalFen: verified.canonicalFen,
      openingId: verified.openingId,
      expectedMoveUci: verified.expectedMoveUci,
      repertoireSide: side,
      moveOrderKey: verified.moveOrderKey,
    });
    const access = await loadOpeningAccess(user);
    const snapshot = access.get({
      userId: user.userId,
      openingId: verified.openingId,
      repertoireSide: side,
    });
    if (snapshot.decision !== "active")
      return NextResponse.json({ error: "opening_locked" }, { status: 403 });
    const result = await appendLearningEventV2({
      userId: user.userId,
      sessionId: body.sessionId,
      attemptId: eventId,
      source: "train",
      taxonomy,
      position: { ...position, repertoireSide: side },
      correct,
      playedMoveUci: body.playedMoveUci ?? null,
      now: authority.occurredAt,
      access: snapshot,
      reviewEvidence: {
        evidenceType: taxonomy === "cue_revealed" ? "reveal" : "answer",
        // Client timing cannot establish Easy. PR-04 may call the trusted
        // service contract with server-measured elapsed time.
        elapsedMs: null,
        hinted: taxonomy === "cue_revealed",
      },
    });
    await emitBlundrOperationalEvent("learning_event_accepted", {
      status: result.status,
      taxonomy,
      source: "train",
    });
    return NextResponse.json(result, {
      status: result.status === "duplicate" ? 200 : 201,
    });
  } catch (error) {
    await emitBlundrOperationalEvent("learning_event_rejected", {
      reason:
        error instanceof Error
          ? error.message
          : "learning_event_persistence_unavailable",
      taxonomy,
    });
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "learning_event_persistence_unavailable",
      },
      { status: 503 },
    );
  }
}
