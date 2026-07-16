import { NextResponse } from "next/server";
import { getServerFeatureFlags } from "@/lib/blundr/contracts/serverFeatureFlags";
import { requireGameDataUser } from "@/lib/blundr/gameData/gameDataService";
import {
  getOrReserveDaily,
  publicDailySession,
} from "@/lib/blundr/daily/productionDailyService.server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await requireGameDataUser(request);
  if (!user)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  if (!getServerFeatureFlags().daily_production_store)
    return NextResponse.json({ error: "feature_disabled" }, { status: 503 });
  const dateKey = new Date().toISOString().slice(0, 10);
  try {
    const session = await getOrReserveDaily(user, dateKey);
    return NextResponse.json({
      dateKey,
      status: session.publicCards.length ? "ready" : "empty",
      explanation:
        "Selected from unlocked openings and current learning evidence.",
      session: publicDailySession(session),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "persistence_unavailable",
      },
      { status: 503 },
    );
  }
}
