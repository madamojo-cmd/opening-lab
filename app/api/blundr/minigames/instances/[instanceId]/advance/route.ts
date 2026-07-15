import { NextResponse } from "next/server";
import { requireGameDataUser } from "@/lib/blundr/gameData/gameDataService";
import { getDailyMiniGameDefinition } from "@/lib/blundr/daily/miniGames/dailyMiniGameRegistry";
import { StandaloneMiniGameRepository } from "@/lib/blundr/daily/miniGames/standalone/standaloneMiniGameRepository.server";
import {
  projectStandaloneMiniGame,
  publicFeedback,
} from "@/lib/blundr/daily/miniGames/standalone/standaloneMiniGameProjection";
import type {
  DailyMiniGameAdvanceAttempt,
  DailyBlundrMiniGameCard,
} from "@/lib/blundr/daily/miniGames/dailyMiniGameTypes";

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
  const body = (await request
    .json()
    .catch(() => null)) as Partial<DailyMiniGameAdvanceAttempt> | null;
  if (!body?.uci || !body.from || !body.to)
    return NextResponse.json({ error: "invalid_move" }, { status: 400 });
  const card = record.card as DailyBlundrMiniGameCard;
  const definition = getDailyMiniGameDefinition(card.miniGame.miniGameId);
  if (!definition?.advance)
    return NextResponse.json(
      { error: "activity_unsupported" },
      { status: 422 },
    );
  const attempt: DailyMiniGameAdvanceAttempt = {
    from: String(body.from),
    to: String(body.to),
    uci: String(body.uci),
    san: body.san ? String(body.san) : null,
    legal: true,
  };
  const result = definition.advance(record.state, attempt);
  const next = {
    ...record,
    state: result.state,
    firstAttempt:
      record.firstAttempt ??
      (result.completed ? (result.won ? "correct" : "incorrect") : null),
  } as const;
  await repository.update(next);
  return NextResponse.json({
    instance: {
      ...projectStandaloneMiniGame(next),
      feedback: publicFeedback(next, false),
    },
    result: {
      legal: result.legal,
      completed: result.completed,
      won: result.won,
      reason: result.reason,
    },
  });
}
