import { NextResponse } from "next/server";
import {
  readGameDataStatus,
  requireGameDataUser,
} from "@/lib/blundr/gameData/gameDataService";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await requireGameDataUser(request);
  if (!user)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  return NextResponse.json(await readGameDataStatus(user.userId));
}
