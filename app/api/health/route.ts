import { NextResponse } from "next/server";

import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";
import {
  buildMaiaRuntimeHealth,
  readMaiaRuntimeConfig,
  getRedactedMaiaRuntimeSummary,
} from "@/lib/blundr/maia/maiaRuntimeConfig";
import { MaiaRemoteRuntimeAdapter } from "@/lib/blundr/maia/maiaRemoteRuntimeAdapter";
import { readBlundrBuildIdentity } from "@/lib/blundr/release/buildIdentity.server";

export const dynamic = "force-dynamic";

function configured(value: string | undefined): boolean {
  return Boolean(String(value ?? "").trim());
}

export async function GET(): Promise<Response> {
  const build = readBlundrBuildIdentity();
  const admin = createBlundrSupabaseAdminClient();
  const database = admin
    ? await admin
        .from("blundr_accounts")
        .select("user_id", { head: true, count: "exact" })
        .limit(1)
    : { error: new Error("database_not_configured") };
  const databaseReady = !database.error;

  const maiaConfig = readMaiaRuntimeConfig();
  const maiaHealth =
    maiaConfig.transport === "remote"
      ? await new MaiaRemoteRuntimeAdapter(maiaConfig).health()
      : buildMaiaRuntimeHealth(maiaConfig, {
          status: "missing_remote_url",
          lastError: "remote_transport_required",
        });
  const remoteMaiaReady = maiaConfig.transport === "remote" && maiaHealth.ready;
  const workerReady =
    build.configuration.featureFlags.provider_ingestion &&
    configured(
      process.env.CRON_SECRET ?? process.env.BLUNDR_GAME_DATA_CRON_SECRET,
    );
  const telemetryReady = configured(process.env.BLUNDR_TELEMETRY_ENDPOINT);
  const ready =
    build.ready &&
    databaseReady &&
    remoteMaiaReady &&
    workerReady &&
    telemetryReady;

  const response = NextResponse.json(
    {
      ready,
      checkedAt: new Date().toISOString(),
      build: {
        ready: build.ready,
        gitSha: build.gitSha,
        releaseId: build.releaseId,
        featureProfileId: build.featureProfileId,
        migrationHead: build.migrationHead,
        runtimePackageId: build.runtime.packageId,
        issues: build.issues,
      },
      dependencies: {
        database: { ready: databaseReady },
        maia: getRedactedMaiaRuntimeSummary(maiaConfig, maiaHealth),
        worker: { ready: workerReady },
        telemetry: { ready: telemetryReady },
      },
    },
    { status: ready ? 200 : 503 },
  );
  response.headers.set("Cache-Control", "no-store");
  return response;
}
