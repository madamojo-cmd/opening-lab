import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { Chess } from "chess.js";

import { BLUNDR_RUNTIME_VERSION, type PositionIdentity } from "@/lib/blundr/contracts";
import { requireGameDataUser, loadOpeningAccess } from "@/lib/blundr/gameData/gameDataService";
import { appendLearningEventV2 } from "@/lib/blundr/learning/core/learningEventService.server";
import { loadReviewMistakeSolution } from "@/lib/blundr/reviewQueue/reviewMistakeRepository.server";

export const dynamic = "force-dynamic";

function normalizeUci(value: string): string {
  return String(value ?? "").trim().toLowerCase();
}

function uciToMove(uci: string): {
  from: string;
  to: string;
  promotion?: "q" | "r" | "b" | "n";
} | null {
  const normalized = normalizeUci(uci);
  if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(normalized)) return null;
  const from = normalized.slice(0, 2);
  const to = normalized.slice(2, 4);
  const promo = normalized.slice(4);
  if (promo === "q" || promo === "r" || promo === "b" || promo === "n")
    return { from, to, promotion: promo };
  return { from, to };
}

export async function POST(
  request: Request,
  context: { params: Promise<{ mistakeId: string }> },
) {
  const user = await requireGameDataUser(request);
  if (!user)
    return NextResponse.json(
      { ok: false, error: "authentication_required" },
      { status: 401 },
    );

  const { mistakeId } = await context.params;
  const solution = await loadReviewMistakeSolution({
    userId: user.userId,
    mistakeId,
  });
  if (!solution.ok) {
    const status =
      solution.error === "invalid_request"
        ? 400
        : solution.error === "not_found"
          ? 404
          : 503;
    return NextResponse.json({ ok: false, error: solution.error }, { status });
  }

  const accessRepo = await loadOpeningAccess(user);
  if (!solution.data.openingId || solution.data.repertoireSide === "unknown")
    return NextResponse.json(
      { ok: false, error: "opening_access_unavailable" },
      { status: 409 },
    );

  const now = new Date().toISOString();
  const access = accessRepo.get({
    userId: user.userId,
    openingId: solution.data.openingId,
    repertoireSide: solution.data.repertoireSide,
    now,
  });
  if (!access || access.decision !== "active")
    return NextResponse.json({ ok: false, error: "opening_locked" }, { status: 403 });

  const position: PositionIdentity = {
    positionKey: solution.data.positionKey,
    canonicalFen: solution.data.canonicalFen,
    openingId: solution.data.openingId,
    expectedMoveUci: solution.data.expectedMoveUci,
    repertoireSide: solution.data.repertoireSide,
    moveOrderKey: solution.data.playKey,
    runtimePackageVersion: BLUNDR_RUNTIME_VERSION,
  };

  await appendLearningEventV2({
    userId: user.userId,
    sessionId: randomUUID(),
    attemptId: randomUUID(),
    source: "review",
    taxonomy: "cue_revealed",
    position,
    correct: false,
    now,
    access,
    playedMoveUci: null,
    reviewEvidence: { evidenceType: "reveal" },
  }).catch(() => null);

  let expectedMoveSan: string | null = null;
  try {
    const move = uciToMove(solution.data.expectedMoveUci);
    if (move) {
      const game = new Chess(solution.data.canonicalFen);
      const played = game.move(move);
      expectedMoveSan = played?.san ?? null;
    }
  } catch {
    expectedMoveSan = null;
  }

  return NextResponse.json({
    ok: true,
    data: {
      expectedMoveUci: normalizeUci(solution.data.expectedMoveUci),
      expectedMoveSan,
    },
  });
}

