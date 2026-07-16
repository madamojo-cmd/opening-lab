import { NextResponse } from "next/server";
import {
  readGameDataStatus,
  requireGameDataUser,
} from "@/lib/blundr/gameData/gameDataService";
import { getServerFeatureFlags } from "@/lib/blundr/contracts/serverFeatureFlags";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await requireGameDataUser(request);
  if (!user)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  const flags = getServerFeatureFlags();
  if (!flags.game_data_connections)
    return NextResponse.json({ error: "feature_disabled" }, { status: 503 });
  return NextResponse.json(await readGameDataStatus(user.userId));
}
