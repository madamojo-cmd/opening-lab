import { NextResponse } from "next/server";
import { requireGameDataUser } from "@/lib/blundr/gameData/gameDataService";
import { StandaloneMiniGameRepository } from "@/lib/blundr/daily/miniGames/standalone/standaloneMiniGameRepository.server";
import { projectStandaloneMiniGame } from "@/lib/blundr/daily/miniGames/standalone/standaloneMiniGameProjection";
import { createDeepMiniGameState } from "@/lib/blundr/daily/miniGames/deep";

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
  const next =
    record.kind === "deep" && record.scenario
      ? {
          ...record,
          retryCount: record.retryCount + 1,
          state: createDeepMiniGameState(record.scenario),
        }
      : {
          ...record,
          retryCount: record.retryCount + 1,
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
  await repository.update(next);
  return NextResponse.json({ instance: projectStandaloneMiniGame(next) });
}
