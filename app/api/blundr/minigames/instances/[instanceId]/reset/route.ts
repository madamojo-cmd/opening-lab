import { NextResponse } from "next/server";
import { requireGameDataUser } from "@/lib/blundr/gameData/gameDataService";
import { StandaloneMiniGameRepository } from "@/lib/blundr/daily/miniGames/standalone/standaloneMiniGameRepository.server";
import { projectStandaloneMiniGame } from "@/lib/blundr/daily/miniGames/standalone/standaloneMiniGameProjection";

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
  const next = {
    ...record,
    state: {
      ...record.state,
      completed: false,
      won: false,
      currentFen: record.state.startFen,
      plyCount: 0,
      lastMoveUci: null,
      lastMoveSan: null,
    },
  };
  await repository.update(next);
  return NextResponse.json({ instance: projectStandaloneMiniGame(next) });
}
