import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import { BLUNDR_RUNTIME_VERSION, type PositionIdentity } from "@/lib/blundr/contracts";
import { requireGameDataUser, loadOpeningAccess } from "@/lib/blundr/gameData/gameDataService";
import { appendLearningEventV2 } from "@/lib/blundr/learning/core/learningEventService.server";
import { loadReviewMistakeSolution, loadReviewMistakeSnapshot } from "@/lib/blundr/reviewQueue/reviewMistakeRepository.server";

export const dynamic = "force-dynamic";

type AttemptBody = {
  uci?: unknown;
  retry?: unknown;
  elapsedMs?: unknown;
  hinted?: unknown;
};

function normalizeUci(value: string): string {
  return String(value ?? "").trim().toLowerCase();
}

function isUci(value: string): boolean {
  return /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(normalizeUci(value));
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

  const body = (await request.json().catch(() => null)) as AttemptBody | null;
  const rawUci = normalizeUci(String(body?.uci ?? ""));
  if (!isUci(rawUci))
    return NextResponse.json(
      { ok: false, error: "invalid_request" },
      { status: 400 },
    );

  const { mistakeId } = await context.params;
  const solution = await loadReviewMistakeSolution({
    userId: user.userId,
    mistakeId,
  });
  if (solution.ok === false) {
    const error = solution.error;
    const status =
      error === "invalid_request"
        ? 400
        : error === "not_found"
          ? 404
          : 503;
    return NextResponse.json({ ok: false, error }, { status });
  }

  const expected = normalizeUci(solution.data.expectedMoveUci);
  const correct = rawUci === expected;

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

  const commit = await appendLearningEventV2({
    userId: user.userId,
    sessionId: randomUUID(),
    attemptId: randomUUID(),
    source: "review",
    taxonomy: correct ? "move_correct" : "move_incorrect",
    position,
    correct,
    now,
    access,
    playedMoveUci: rawUci,
    reviewEvidence: {
      evidenceType: "answer",
      retry: body?.retry === true,
      hinted: body?.hinted === true,
      elapsedMs:
        typeof body?.elapsedMs === "number" && Number.isFinite(body.elapsedMs)
          ? body.elapsedMs
          : null,
    },
  }).catch((error: unknown) => {
    throw new Error(
      String((error as { message?: unknown })?.message ?? "append_failed"),
    );
  });

  const refreshed = await loadReviewMistakeSnapshot({
    userId: user.userId,
    mistakeId,
  });
  const resolved =
    refreshed.ok && refreshed.data.lifecycleState === "resolved";

  return NextResponse.json({
    ok: true,
    data: {
      correct,
      resolved,
      lifecycleState: refreshed.ok ? refreshed.data.lifecycleState : null,
      reviewRating: commit.reviewRating ?? null,
      dueAt: commit.dueAt ?? null,
    },
  });
}

