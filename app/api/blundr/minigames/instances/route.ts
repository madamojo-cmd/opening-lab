import { NextResponse } from "next/server";
import { requireGameDataUser } from "@/lib/blundr/gameData/gameDataService";
import { getDailyMiniGameDefinition } from "@/lib/blundr/daily/miniGames/dailyMiniGameRegistry";
import { StandaloneMiniGameRepository } from "@/lib/blundr/daily/miniGames/standalone/standaloneMiniGameRepository.server";
import { projectStandaloneMiniGame } from "@/lib/blundr/daily/miniGames/standalone/standaloneMiniGameProjection";
import type { DailyMiniGameId } from "@/lib/blundr/daily/miniGames/dailyMiniGameTypes";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await requireGameDataUser(request);
  if (!user)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  const body = (await request.json().catch(() => null)) as {
    miniGameId?: string;
  } | null;
  const definition = body?.miniGameId
    ? getDailyMiniGameDefinition(body.miniGameId as DailyMiniGameId)
    : null;
  if (!definition || definition.canAppearInStandalonePractice === false)
    return NextResponse.json(
      { error: "practice_unavailable" },
      { status: 404 },
    );
  const now = new Date();
  const card = definition.generate({
    dateKey: `standalone:${now.toISOString().slice(0, 10)}`,
    now: now.toISOString(),
    mastery: null,
    difficulty: definition.recommendedFor[0] ?? "beginner",
    currentMastery: 0.25,
    confidence: 0.25,
    dueReviewCount: 0,
    selectedReviewCount: 0,
    recentMiniGameIds: [],
    recentFenKeys: [],
    sessionMiniGameIds: [],
    source: "standalone_review",
    seed: `${definition.id}|${user.userId}|${now.toISOString()}`,
    userIdOrLocalId: user.userId,
    recentScenarioKeys: [],
    boardPreferences: null,
    deckId: `standalone:${definition.id}`,
    miniGameId: definition.id,
  });
  if (!card || card.kind !== "mini_game" || !card.miniGame.scenario)
    return NextResponse.json(
      { error: "verified_content_unavailable" },
      { status: 422 },
    );
  const instanceId = `mgi_${crypto.randomUUID().replaceAll("-", "")}`;
  const record = {
    instanceId,
    userId: user.userId,
    card,
    state: card.miniGame,
    firstAttempt: null,
    retryCount: 0,
    expiresAt: new Date(now.valueOf() + 30 * 60_000).toISOString(),
  } as const;
  const repository = new StandaloneMiniGameRepository();
  await repository.create(record);
  return NextResponse.json({ instance: projectStandaloneMiniGame(record) });
}
