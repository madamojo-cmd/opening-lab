import { NextResponse } from "next/server";
import { ImportJobRepository } from "@/lib/blundr/gameData/importJobRepository";
import { requireGameDataUser } from "@/lib/blundr/gameData/gameDataService";
import { ProviderAccountRepository } from "@/lib/blundr/gameData/providerAccountRepository";

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
  const provider =
    body?.provider === "chesscom" || body?.provider === "lichess"
      ? body.provider
      : null;
  if (!provider)
    return NextResponse.json({ error: "invalid_provider" }, { status: 400 });
  const account = await new ProviderAccountRepository().get(
    user.userId,
    provider,
  );
  if (!account || account.verificationState !== "verified")
    return NextResponse.json({ error: "connection_required" }, { status: 409 });
  const now = new Date();
  const job = await new ImportJobRepository().enqueue({
    userId: user.userId,
    provider,
    cursor: {
      provider,
      cursor: null,
      requestedFrom: new Date(now.valueOf() - 90 * 86_400_000).toISOString(),
      requestedTo: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    correlationId: crypto.randomUUID(),
  });
  return NextResponse.json({ jobId: job.id, status: job.status });
}
