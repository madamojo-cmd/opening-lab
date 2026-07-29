import { NextResponse } from "next/server";
import { requireGameDataUser } from "@/lib/blundr/gameData/gameDataService";
import { StandaloneMiniGameRepository } from "@/lib/blundr/daily/miniGames/standalone/standaloneMiniGameRepository.server";
import { projectStandaloneMiniGame } from "@/lib/blundr/daily/miniGames/standalone/standaloneMiniGameProjection";
import { createDeepMiniGameState } from "@/lib/blundr/daily/miniGames/deep";
import { STANDALONE_MINIGAME_REVISION_CONFLICT } from "@/lib/blundr/daily/miniGames/standalone/standaloneMiniGameRepository.server";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ instanceId: string }> },
) {
  const user = await requireGameDataUser(request);
  if (!user)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  const { instanceId } = await context.params;
  const repository = new StandaloneMiniGameRepository();
  const record = await repository.getOwned(instanceId, user.userId);
  if (!record)
    return NextResponse.json({ error: "instance_not_found" }, { status: 404 });
  if (record.expiresAt <= new Date().toISOString())
    return NextResponse.json({ error: "instance_expired" }, { status: 410 });
  const body = (await request.json().catch(() => null)) as {
    revision?: number;
  } | null;
  const revision = body?.revision;
  if (typeof revision !== "number" || !Number.isInteger(revision))
    return NextResponse.json({ error: "revision_required" }, { status: 400 });
  if (revision !== record.revision)
    return NextResponse.json(
      { error: "stale_instance_state", revision: record.revision },
      { status: 409 },
    );
  const next =
    record.kind === "deep" && record.scenario
      ? {
          ...record,
          firstAttempt: null,
          state: createDeepMiniGameState(record.scenario),
        }
      : {
          ...record,
          state: {
            ...record.state,
            completed: false,
            won: false,
            currentFen: (
              record.state as import("@/lib/blundr/daily/miniGames/dailyMiniGameTypes").DailyMiniGameState
            ).startFen,
            plyCount: 0,
            lastMoveUci: null,
            lastMoveSan: null,
          },
        };
  let saved;
  try {
    saved = await repository.update(next, revision);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === STANDALONE_MINIGAME_REVISION_CONFLICT
    )
      return NextResponse.json(
        { error: "stale_instance_state" },
        { status: 409 },
      );
    throw error;
  }
  return NextResponse.json({ instance: projectStandaloneMiniGame(saved) });
}
