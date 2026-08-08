import { NextResponse } from "next/server";
import { requireGameDataUser } from "@/lib/blundr/gameData/gameDataService";
import { reserveTrainerSession } from "@/lib/blundr/trainerCompletion/trainerCompletionService.server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await requireGameDataUser(request);
  if (!user)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  const body = (await request.json().catch(() => null)) as {
    openingId?: unknown;
    lineId?: unknown;
    resumeSessionId?: unknown;
  } | null;
  try {
    const session = await reserveTrainerSession({
      user,
      openingId: body?.openingId,
      lineId: body?.lineId,
      resumeSessionId: body?.resumeSessionId,
    });
    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    const code =
      error instanceof Error
        ? error.message
        : "trainer_session_persistence_unavailable";
    const status =
      code === "opening_locked"
        ? 403
        : code === "trainer_line_unverified"
          ? 422
          : 503;
    return NextResponse.json({ error: code }, { status });
  }
}
