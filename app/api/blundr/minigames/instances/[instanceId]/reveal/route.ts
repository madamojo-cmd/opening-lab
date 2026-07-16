import { NextResponse } from "next/server";
import { requireGameDataUser } from "@/lib/blundr/gameData/gameDataService";
import { StandaloneMiniGameRepository } from "@/lib/blundr/daily/miniGames/standalone/standaloneMiniGameRepository.server";
import {
  projectStandaloneMiniGame,
  publicFeedback,
} from "@/lib/blundr/daily/miniGames/standalone/standaloneMiniGameProjection";
import { reduceDeepMiniGame } from "@/lib/blundr/daily/miniGames/deep";

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
          state: reduceDeepMiniGame(record.state as never, record.scenario, {
            type: "reveal",
            now: new Date().toISOString(),
          }).state,
          firstAttempt: record.firstAttempt ?? "reveal",
        }
      : {
          ...record,
          firstAttempt: record.firstAttempt ?? "reveal",
          state: { ...record.state, completed: true, won: false },
        };
  await repository.update(next);
  return NextResponse.json({
    instance: {
      ...projectStandaloneMiniGame(next),
      feedback: publicFeedback(next, true),
    },
  });
}
