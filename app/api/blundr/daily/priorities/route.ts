import { NextResponse } from "next/server";
import { getServerFeatureFlags } from "@/lib/blundr/contracts/serverFeatureFlags";
import { requireGameDataUser } from "@/lib/blundr/gameData/gameDataService";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await requireGameDataUser(request);
  if (!user) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  if (!getServerFeatureFlags().daily_production_store) return NextResponse.json({ error: "feature_disabled" }, { status: 503 });
  const body = (await request.json().catch(() => null)) as { openingId?: string; positionKey?: string } | null;
  if (!body?.openingId?.trim()) return NextResponse.json({ error: "invalid_priority" }, { status: 400 });
  return NextResponse.json({ status: "queued", openingId: body.openingId.trim(), positionKey: body.positionKey ?? null }, { status: 202 });
}
