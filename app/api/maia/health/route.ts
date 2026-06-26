import { NextResponse } from "next/server";

import { buildMaiaRuntimeHealth, getRedactedMaiaRuntimeSummary, readMaiaRuntimeConfig } from "@/lib/blundr/maia/maiaRuntimeConfig";

function jsonNoStore(body: unknown, init?: ResponseInit): NextResponse {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function GET(): Promise<Response> {
  const config = readMaiaRuntimeConfig();
  const health = buildMaiaRuntimeHealth(config);
  const summary = getRedactedMaiaRuntimeSummary(config, health);

  return jsonNoStore({
    enabled: config.enabled,
    configured: health.configured,
    status: health.status,
    ready: health.ready,
    providerName: health.providerName,
    providerVersion: health.providerVersion,
    skillLevel: config.skillLevel,
    nodes: config.nodes,
    timeoutMs: config.timeoutMs,
    cacheEnabled: config.cacheEnabled,
    maxConcurrentRequests: config.maxConcurrentRequests,
    lc0Configured: health.lc0Configured,
    weightsConfigured: health.weightsConfigured,
    lc0Exists: health.lc0Exists,
    weightsExists: health.weightsExists,
    lastError: health.lastError,
    summary,
  });
}
