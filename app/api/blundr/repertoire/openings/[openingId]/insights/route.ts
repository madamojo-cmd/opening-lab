import { NextResponse } from "next/server";
import { loadOpeningDetailReadModel } from "@/lib/blundr/masteryMap/openingDetailRepository.server";
import {
  loadOpeningAccess,
  requireGameDataUser,
} from "@/lib/blundr/gameData/gameDataService";
import { getServerFeatureFlags } from "@/lib/blundr/contracts/serverFeatureFlags";
import {
  getStage2OpeningAvailability,
} from "@/lib/blundr/openings/openingAvailability";
import { getOpeningSide } from "@/lib/blundr/repertoire/repertoireOpeningPool";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ openingId: string }> },
) {
  const user = await requireGameDataUser(request);
  if (!user)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  if (!getServerFeatureFlags().repertoire_opening_detail)
    return NextResponse.json({ error: "feature_disabled" }, { status: 503 });
  const { openingId } = await context.params;
  const availability = getStage2OpeningAvailability(openingId);
  if (!availability)
    return NextResponse.json({ error: "opening_not_found" }, { status: 404 });
  const access = await loadOpeningAccess(user);
  const side = getOpeningSide(availability.openingId);
  const accessDecision = access.get({
    userId: user.userId,
    openingId: availability.openingId,
    repertoireSide: side === "unknown" ? availability.learnerPerspective : side,
  });
  if (accessDecision.decision !== "active")
    return NextResponse.json({ error: "opening_locked" }, { status: 403 });
  const model = await loadOpeningDetailReadModel({
    request,
    openingId: availability.openingId,
  });
  if (!model)
    return NextResponse.json({ error: "opening_unavailable" }, { status: 503 });
  return NextResponse.json(model);
}
