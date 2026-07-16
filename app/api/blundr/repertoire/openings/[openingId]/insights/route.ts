import { NextResponse } from "next/server";
import { loadOpeningDetailReadModel } from "@/lib/blundr/masteryMap/openingDetailRepository.server";
import { requireGameDataUser } from "@/lib/blundr/gameData/gameDataService";
import { getServerFeatureFlags } from "@/lib/blundr/contracts/serverFeatureFlags";

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
  const model = await loadOpeningDetailReadModel({ request, openingId });
  if (!model)
    return NextResponse.json({ error: "opening_unavailable" }, { status: 404 });
  return NextResponse.json(model);
}
