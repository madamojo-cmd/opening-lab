import { NextResponse } from "next/server";
import { getServerFeatureFlags } from "@/lib/blundr/contracts/serverFeatureFlags";
import { requireGameDataUser } from "@/lib/blundr/gameData/gameDataService";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await requireGameDataUser(request);
  if (!user) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  if (!getServerFeatureFlags().daily_production_store) return NextResponse.json({ error: "feature_disabled" }, { status: 503 });
  const dateKey = new Date().toISOString().slice(0, 10);
  return NextResponse.json({ dateKey, session: null, cards: [], status: "ready", explanation: "Your Daily deck is being prepared from unlocked openings and current weakness evidence." });
}
