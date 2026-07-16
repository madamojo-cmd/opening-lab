import { NextResponse } from "next/server";
import { ChessComClient, LichessClient } from "@/lib/blundr/gameData/providers";
import { ImportJobRepository } from "@/lib/blundr/gameData/importJobRepository";
import { ProviderAccountRepository } from "@/lib/blundr/gameData/providerAccountRepository";
import { processGameImportBatch } from "@/lib/blundr/gameData/jobs/processGameImportBatch";
import { loadTrainingRuntimePackage } from "@/lib/blundr/trainingRuntime/trainingRuntimeLoader";
import { loadOpeningAccess } from "@/lib/blundr/gameData/gameDataService";
import { isGameDataWorkerEnabled } from "@/lib/blundr/gameData/featureFlags";

export const dynamic = "force-dynamic";

async function processJobs(request: Request) {
  const expected = String(
    process.env.CRON_SECRET ?? process.env.BLUNDR_GAME_DATA_CRON_SECRET ?? "",
  ).trim();
  const authorization = String(
    request.headers.get("authorization") ?? "",
  ).trim();
  const supplied = authorization.toLowerCase().startsWith("bearer ")
    ? authorization.slice(7).trim()
    : String(request.headers.get("x-blundr-cron-secret") ?? "").trim();
  if (!expected || supplied !== expected)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isGameDataWorkerEnabled())
    return NextResponse.json({ error: "worker_disabled" }, { status: 503 });
  const jobs = new ImportJobRepository();
  const accounts = new ProviderAccountRepository();
  const runtime = await loadTrainingRuntimePackage();
  const results = [];
  for (const pending of await jobs.nextPending(3)) {
    const leased = await jobs.lease(pending.id, `cron-${crypto.randomUUID()}`);
    if (!leased) continue;
    const account = await accounts.get(leased.userId, leased.provider);
    if (!account) {
      await jobs.update(leased.id, {
        status: "permanent_error",
        errorCode: "invalid_username",
      });
      continue;
    }
    const access = await loadOpeningAccess({
      userId: leased.userId,
      isAuthenticated: true,
      mode: "authenticated",
      isAdmin: false,
      accessToken: null,
      email: null,
      provider: null,
    });
    const result = await processGameImportBatch(leased, account, {
      runtime,
      jobs,
      workerId: leased.leaseOwner ?? "cron",
      source:
        leased.provider === "chesscom"
          ? new ChessComClient()
          : new LichessClient(),
      access: (userId, openingId, side) =>
        access.get({ userId, openingId, repertoireSide: side }),
    });
    results.push({
      jobId: leased.id,
      status: result.status,
      counts: result.counts,
    });
  }
  return NextResponse.json({ processed: results.length, results });
}

export async function GET(request: Request) {
  return processJobs(request);
}

export async function POST(request: Request) {
  return processJobs(request);
}
