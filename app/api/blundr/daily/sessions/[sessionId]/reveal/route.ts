import { NextResponse } from "next/server";
import { getServerFeatureFlags } from "@/lib/blundr/contracts/serverFeatureFlags";
import { isProductionDailyAvailable } from "@/lib/blundr/daily/productionDailyCapability";
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
  if (!isProductionDailyAvailable(getServerFeatureFlags()))
    return NextResponse.json({ error: "feature_disabled" }, { status: 503 });
  const { sessionId } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    cardFingerprint?: string;
    expectedVersion?: number;
    actionId?: string;
  } | null;
  if (
    !body?.cardFingerprint ||
    typeof body.actionId !== "string" ||
    !body.actionId ||
    !Number.isInteger(body.expectedVersion)
  )
    return NextResponse.json({ error: "invalid_reveal" }, { status: 400 });
  try {
    const result = await applyDailyAction({
      user,
      sessionId,
      cardFingerprint: body.cardFingerprint,
      expectedVersion: Number(body.expectedVersion),
      actionId: body.actionId,
      action: "reveal",
    });
    await applyDailyCompletionReward({
      userId: user.userId,
      session: result.session,
    });
    return NextResponse.json({
      result: result.result,
      presentation: result.presentation,
      session: publicDailySession(result.session),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "daily_reveal_failed";
    return NextResponse.json(
      { error: message },
      { status: message === "daily_session_conflict" ? 409 : 422 },
    );
  }
}
