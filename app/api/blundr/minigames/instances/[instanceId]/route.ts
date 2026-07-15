import { NextResponse } from "next/server";
import { requireGameDataUser } from "@/lib/blundr/gameData/gameDataService";
import { StandaloneMiniGameRepository } from "@/lib/blundr/daily/miniGames/standalone/standaloneMiniGameRepository.server";
import {
  projectStandaloneMiniGame,
  publicFeedback,
} from "@/lib/blundr/daily/miniGames/standalone/standaloneMiniGameProjection";

export const dynamic = "force-dynamic";

export async function GET(
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
  const record = await new StandaloneMiniGameRepository().getOwned(
    instanceId,
    user.userId,
  );
  if (!record)
    return NextResponse.json({ error: "instance_not_found" }, { status: 404 });
  const instance = projectStandaloneMiniGame(record);
  return NextResponse.json({
    instance: {
      ...instance,
      feedback: publicFeedback(record, record.firstAttempt === "reveal"),
    },
  });
}
