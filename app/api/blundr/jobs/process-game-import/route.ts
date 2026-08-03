import { NextResponse } from "next/server";
import { ChessComClient, LichessClient } from "@/lib/blundr/gameData/providers";
import {
  ImportJobRepository,
  MAX_IMPORT_ATTEMPTS,
} from "@/lib/blundr/gameData/importJobRepository";
import type { ProviderErrorCode } from "@/lib/blundr/gameData/gameDataTypes";
import { ProviderAccountRepository } from "@/lib/blundr/gameData/providerAccountRepository";
import { processGameImportBatch } from "@/lib/blundr/gameData/jobs/processGameImportBatch";
import { loadTrainingRuntimePackage } from "@/lib/blundr/trainingRuntime/trainingRuntimeLoader";
import { loadOpeningAccessForWorker } from "@/lib/blundr/gameData/gameDataService";
import { isGameDataWorkerEnabled } from "@/lib/blundr/gameData/featureFlags";
import { buildSuccessfulProviderSyncAccount } from "@/lib/blundr/gameData/providerAccountSync";

export const dynamic = "force-dynamic";

function sanitizedImportError(error: unknown): ProviderErrorCode {
  const message = error instanceof Error ? error.message : "";
  const code = message.trim().toLowerCase();
  return [
    "account_not_found",
    "rate_limited",
    "provider_unavailable",
    "network_timeout",
    "malformed_provider_payload",
    "invalid_game",
    "lease_lost",
  ].includes(code)
    ? (code as ProviderErrorCode)
    : "unknown";
}

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
        leaseOwner: null,
        leaseExpiresAt: null,
      });
      results.push({
        jobId: leased.id,
        status: "permanent_error",
        errorCode: "invalid_username",
      });
      continue;
    }
    try {
      const access = await loadOpeningAccessForWorker(leased.userId);
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
      await accounts.upsert(
        buildSuccessfulProviderSyncAccount(account, new Date().toISOString()),
      );
      results.push({
        jobId: leased.id,
        status: result.status,
        counts: result.counts,
      });
    } catch (error) {
      const status =
        leased.attemptCount >= MAX_IMPORT_ATTEMPTS
          ? "dead_letter"
          : "retryable_error";
      const errorCode = sanitizedImportError(error);
      await jobs.update(leased.id, {
        status,
        errorCode,
        leaseOwner: null,
        leaseExpiresAt: null,
      });
      results.push({ jobId: leased.id, status, errorCode });
    }
  }
  return NextResponse.json({ processed: results.length, results });
}

export async function GET(request: Request) {
  return processJobs(request);
}

export async function POST(request: Request) {
  return processJobs(request);
}
