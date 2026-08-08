import { NextResponse } from "next/server";
import { requireGameDataUser } from "@/lib/blundr/gameData/gameDataService";
import { commitTrainerAction } from "@/lib/blundr/trainerCompletion/trainerCompletionService.server";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const user = await requireGameDataUser(request);
  if (!user)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  const { sessionId } = await params;
  const body = (await request.json().catch(() => null)) as {
    actionId?: unknown;
    expectedVersion?: unknown;
    type?: unknown;
    playedMoveUci?: unknown;
  } | null;
  try {
    const result = await commitTrainerAction({
      user,
      sessionId,
      actionId: body?.actionId,
      expectedVersion: body?.expectedVersion,
      type: body?.type,
      playedMoveUci: body?.playedMoveUci,
    });
    return NextResponse.json({ result });
  } catch (error) {
    const code =
      error instanceof Error
        ? error.message
        : "trainer_action_persistence_unavailable";
    const status = code.includes("forbidden")
      ? 403
      : code.includes("not_found")
        ? 404
        : code.includes("invalid") ||
            code.includes("not_current") ||
            code.includes("stale") ||
            code.includes("conflict")
          ? 409
          : 503;
    return NextResponse.json({ error: code }, { status });
  }
}
