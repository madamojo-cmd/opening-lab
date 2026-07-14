import { NextResponse } from "next/server";
import {
  deleteGameData,
  requireGameDataUser,
} from "@/lib/blundr/gameData/gameDataService";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await requireGameDataUser(request);
  if (!user)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  const body = (await request.json().catch(() => null)) as {
    provider?: string;
  } | null;
  if (
    body?.provider &&
    body.provider !== "chesscom" &&
    body.provider !== "lichess"
  )
    return NextResponse.json({ error: "invalid_provider" }, { status: 400 });
  await deleteGameData(user.userId, body?.provider);
  return NextResponse.json({ ok: true, status: "deleted" });
}
