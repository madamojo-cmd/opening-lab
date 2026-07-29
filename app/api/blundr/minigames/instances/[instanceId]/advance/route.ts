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
import { reduceDeepMiniGame } from "@/lib/blundr/daily/miniGames/deep";
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
  const body = (await request.json().catch(() => null)) as
    | (Partial<DailyMiniGameAdvanceAttempt> & { revision?: number })
    | null;
  if (!body?.uci || !body.from || !body.to)
    return NextResponse.json({ error: "invalid_move" }, { status: 400 });
  const revision = body.revision;
  if (typeof revision !== "number" || !Number.isInteger(revision))
    return NextResponse.json({ error: "revision_required" }, { status: 400 });
  if (revision !== record.revision)
    return NextResponse.json(
      { error: "stale_instance_state", revision: record.revision },
      { status: 409 },
    );
  if (record.kind === "deep" && record.scenario) {
    const result = reduceDeepMiniGame(record.state as never, record.scenario, {
      type: "move",
      uci: String(body.uci),
      now: new Date().toISOString(),
    });
    const next = {
      ...record,
      state: result.state,
      firstAttempt:
        record.firstAttempt ??
        (result.state.firstAttempt === "correct"
          ? "correct"
          : result.state.firstAttempt === "incorrect"
            ? "incorrect"
            : null),
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
    return NextResponse.json({
      instance: {
        ...projectStandaloneMiniGame(saved),
        feedback: publicFeedback(saved, false),
      },
      result: {
        legal: result.kind !== "invalid",
        completed: result.state.state === "completed",
        won: result.state.firstAttempt === "correct",
        reason: result.message,
      },
    });
  }
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
  const result = definition.advance(
    record.state as import("@/lib/blundr/daily/miniGames/dailyMiniGameTypes").DailyMiniGameState,
    attempt,
  );
  const next = {
    ...record,
    state: result.state,
    firstAttempt:
      record.firstAttempt ??
      (result.completed ? (result.won ? "correct" : "incorrect") : null),
  } as const;
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
  return NextResponse.json({
    instance: {
      ...projectStandaloneMiniGame(saved),
      feedback: publicFeedback(saved, false),
    },
    result: {
      legal: result.legal,
      completed: result.completed,
      won: result.won,
      reason: result.reason,
    },
  });
}
