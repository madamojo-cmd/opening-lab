import { NextResponse } from "next/server";
import { ProviderAccountRepository } from "@/lib/blundr/gameData/providerAccountRepository";
import {
  deleteGameData,
  requireGameDataUser,
} from "@/lib/blundr/gameData/gameDataService";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  const user = await requireGameDataUser(request);
  if (!user)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  const { provider } = await context.params;
  if (provider !== "chesscom" && provider !== "lichess")
    return NextResponse.json({ error: "invalid_provider" }, { status: 400 });
  const url = new URL(request.url);
  const deleteSource = url.searchParams.get("delete") === "true";
  if (deleteSource) await deleteGameData(user.userId, provider);
  await new ProviderAccountRepository().disconnect(
    user.userId,
    provider,
    deleteSource,
  );
  return NextResponse.json({ ok: true, deleted: deleteSource });
}
