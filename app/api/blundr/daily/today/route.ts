import { NextResponse } from "next/server";
import { getServerFeatureFlags } from "@/lib/blundr/contracts/serverFeatureFlags";
import { isProductionDailyAvailable } from "@/lib/blundr/daily/productionDailyCapability";
import { requireGameDataUser } from "@/lib/blundr/gameData/gameDataService";
import {
  getOrReserveDaily,
  publicDailySession,
} from "@/lib/blundr/daily/productionDailyService.server";
import { ProductionDailyRepository } from "@/lib/blundr/daily/productionDailyRepository.server";
import { emitBlundrOperationalEvent } from "@/lib/blundr/telemetry/operationalTelemetry.server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await requireGameDataUser(request);
  if (!user)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  if (!isProductionDailyAvailable(getServerFeatureFlags()))
    return NextResponse.json({ error: "feature_disabled" }, { status: 503 });
  const dateKey = new Date().toISOString().slice(0, 10);
  try {
    const session = await getOrReserveDaily(user, dateKey);
    const cardsCompletedToday = await new ProductionDailyRepository().countUniqueCompletedCardsForDate(
      user.userId,
      dateKey,
    );
    await emitBlundrOperationalEvent("daily_composed", {
      status: session.publicCards.length ? "ready" : "empty",
      cardCount: session.publicCards.length,
      sessionVersion: session.version,
    });
    return NextResponse.json({
      dateKey,
      status: session.publicCards.length ? "ready" : "empty",
      explanation:
        "Selected from unlocked openings and current learning evidence.",
      session: publicDailySession(session, { cardsCompletedToday }),
    });
  } catch (error) {
    const code =
      error instanceof Error ? error.message : "persistence_unavailable";
    return NextResponse.json(
      {
        error: code,
      },
      { status: code === "daily_opening_selection_required" ? 409 : 503 },
    );
  }
}
