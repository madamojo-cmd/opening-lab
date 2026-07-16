import { NextResponse } from "next/server";
import { createPositionIdentity } from "@/lib/blundr/contracts";
import {
  loadOpeningAccess,
  requireGameDataUser,
} from "@/lib/blundr/gameData/gameDataService";
import { appendLearningEventV2 } from "@/lib/blundr/learning/core/learningEventService.server";
import { getOpeningSide } from "@/lib/blundr/repertoire/repertoireOpeningPool";

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
    sessionId?: string;
    type?: string;
    createdAt?: string;
    fen?: string;
    openingId?: string;
    expectedMoveUci?: string;
    playedMoveUci?: string;
  } | null;
  if (!body?.eventId || !body.sessionId || !body.fen || !body.type)
    return NextResponse.json(
      { error: "invalid_learning_event" },
      { status: 400 },
    );
  const taxonomy =
    body.type === "move_correct"
      ? "move_correct"
      : body.type === "move_incorrect"
        ? "move_incorrect"
        : body.type === "cue_revealed"
          ? "cue_revealed"
          : "move_attempted";
  const position = createPositionIdentity({
    canonicalFen: body.fen,
    openingId: body.openingId ?? null,
    expectedMoveUci: body.expectedMoveUci ?? null,
    repertoireSide: "unknown",
  });
  try {
    const side =
      getOpeningSide(body.openingId ?? "") === "black" ? "black" : "white";
    const access = await loadOpeningAccess(user);
    const snapshot = access.get({
      userId: user.userId,
      openingId: body.openingId ?? "unknown",
      repertoireSide: side,
    });
    if (snapshot.decision !== "active")
      return NextResponse.json({ error: "opening_locked" }, { status: 403 });
    const result = await appendLearningEventV2({
      userId: user.userId,
      sessionId: body.sessionId,
      attemptId: body.eventId,
      source: "train",
      taxonomy,
      position: { ...position, repertoireSide: side },
      correct: taxonomy === "move_correct",
      firstAttempt:
        taxonomy === "move_correct" || taxonomy === "move_incorrect",
      now: body.createdAt ?? new Date().toISOString(),
      access: snapshot,
    });
    return NextResponse.json(result, {
      status: result.status === "duplicate" ? 200 : 201,
    });
  } catch (error) {
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
