import { NextResponse } from "next/server";
import { getServerFeatureFlags } from "@/lib/blundr/contracts/serverFeatureFlags";
import { requireGameDataUser } from "@/lib/blundr/gameData/gameDataService";
import {
  applyDailyAction,
  applyDailyCompletionReward,
  publicDailySession,
} from "@/lib/blundr/daily/productionDailyService.server";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ sessionId: string }> },
) {
  const user = await requireGameDataUser(request);
  if (!user)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  if (!getServerFeatureFlags().daily_adaptive_v2)
    return NextResponse.json({ error: "feature_disabled" }, { status: 503 });
  const { sessionId } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    cardFingerprint?: string;
    answer?: string;
    expectedVersion?: number;
    actionId?: string;
  } | null;
  if (
    !body?.cardFingerprint ||
    typeof body.actionId !== "string" ||
    !body.actionId ||
    !Number.isInteger(body.expectedVersion)
  )
    return NextResponse.json({ error: "invalid_attempt" }, { status: 400 });
  try {
    const result = await applyDailyAction({
      user,
      sessionId,
      cardFingerprint: body.cardFingerprint,
      answer: body.answer,
      expectedVersion: Number(body.expectedVersion),
      actionId: body.actionId,
      action: "answer",
    });
    await applyDailyCompletionReward({
      userId: user.userId,
      session: result.session,
    });
    return NextResponse.json({
      result: result.result,
      correct: result.correct,
      presentation: result.presentation,
      session: publicDailySession(result.session),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "daily_attempt_failed";
    return NextResponse.json(
      { error: message },
      { status: message === "daily_session_conflict" ? 409 : 422 },
    );
  }
}
