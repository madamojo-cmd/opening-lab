import { NextResponse } from "next/server";
import { getServerFeatureFlags } from "@/lib/blundr/contracts/serverFeatureFlags";
import { isProductionDailyAvailable } from "@/lib/blundr/daily/productionDailyCapability";
import { requireGameDataUser } from "@/lib/blundr/gameData/gameDataService";
import {
  applyDailyAction,
  applyDailyCompletionReward,
  publicDailySession,
} from "@/lib/blundr/daily/productionDailyService.server";
import { classifyDailyActionHttpFailure } from "@/lib/blundr/daily/dailyActionHttp.server";
import { emitBlundrOperationalEvent } from "@/lib/blundr/telemetry/operationalTelemetry.server";

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
    return NextResponse.json({ error: "invalid_retry" }, { status: 400 });
  try {
    const result = await applyDailyAction({
      user,
      sessionId,
      cardFingerprint: body.cardFingerprint,
      expectedVersion: Number(body.expectedVersion),
      actionId: body.actionId,
      action: "retry",
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
    const failure = classifyDailyActionHttpFailure(error);
    await emitBlundrOperationalEvent("daily_action_rejected", {
      action: "retry",
      code: failure.code,
      status: failure.status,
    });
    return NextResponse.json(
      { error: failure.code, message: failure.message },
      { status: failure.status },
    );
  }
}
