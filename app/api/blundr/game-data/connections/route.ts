import { NextResponse } from "next/server";
import { ChessComClient } from "@/lib/blundr/gameData/providers/chessCom";
import { LichessClient } from "@/lib/blundr/gameData/providers/lichess";
import { ImportJobRepository } from "@/lib/blundr/gameData/importJobRepository";
import { ProviderAccountRepository } from "@/lib/blundr/gameData/providerAccountRepository";
import { isGameDataEnabled } from "@/lib/blundr/gameData/featureFlags";
import { normalizeProviderUsername } from "@/lib/blundr/gameData/gameFingerprint";
import { requireGameDataUser } from "@/lib/blundr/gameData/gameDataService";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await requireGameDataUser(request);
  if (!user)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  if (!isGameDataEnabled())
    return NextResponse.json({ error: "feature_disabled" }, { status: 503 });
  const body = (await request.json().catch(() => null)) as {
    provider?: string;
    username?: string;
    days?: number;
  } | null;
  const provider =
    body?.provider === "chesscom" || body?.provider === "lichess"
      ? body.provider
      : null;
  const username = normalizeProviderUsername(body?.username ?? "");
  if (!provider || !username || username.length > 80)
    return NextResponse.json({ error: "invalid_connection" }, { status: 400 });
  const verification =
    provider === "chesscom"
      ? await new ChessComClient().verifyUsername(username)
      : await new LichessClient().verifyUsername(username);
  if ("code" in verification) {
    const code = verification.code;
    return NextResponse.json(
      { error: code },
      { status: code === "account_not_found" ? 404 : 502 },
    );
  }
  const now = new Date();
  const days = Math.min(Math.max(Number(body?.days ?? 90), 1), 365);
  const account = await new ProviderAccountRepository().upsert({
    id: crypto.randomUUID(),
    userId: user.userId,
    provider,
    username,
    externalPlayerId: verification.id,
    verificationState: "verified",
    connectedAt: now.toISOString(),
    lastSuccessfulSyncAt: null,
    nextEligibleSyncAt: null,
    sanitizedErrorCode: null,
  });
  const job = await new ImportJobRepository().enqueue({
    userId: user.userId,
    provider,
    cursor: {
      provider,
      cursor: null,
      requestedFrom: new Date(now.valueOf() - days * 86_400_000).toISOString(),
      requestedTo: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    correlationId: crypto.randomUUID(),
  });
  return NextResponse.json({
    provider: account.provider,
    username: account.username,
    verificationState: account.verificationState,
    jobId: job.id,
    status: job.status,
  });
}
