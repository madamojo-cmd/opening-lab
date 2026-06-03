import { NextResponse } from "next/server";

import { MaiaLc0RuntimeAdapter } from "@/lib/blundr/maia/maiaLc0RuntimeAdapter";
import { buildMaiaRuntimeHealth, getRedactedMaiaRuntimeSummary, readMaiaRuntimeConfig } from "@/lib/blundr/maia/maiaRuntimeConfig";

function jsonNoStore(body: unknown, init?: ResponseInit): NextResponse {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function GET(): Promise<Response> {
  const config = readMaiaRuntimeConfig();
  const adapter = new MaiaLc0RuntimeAdapter(config);
  let health = buildMaiaRuntimeHealth(config);
  if (config.enabled) {
    health = await adapter.health();
  }
  const summary = getRedactedMaiaRuntimeSummary(config, health);

  return jsonNoStore({
    status: health.status,
    ready: health.ready,
    providerName: health.providerName,
    providerVersion: health.providerVersion,
    skillLevel: config.skillLevel,
    nodes: config.nodes,
    timeoutMs: config.timeoutMs,
    weightsConfigured: Boolean(config.weightsPath),
    lc0Configured: Boolean(config.lc0Path),
    weightsExists: health.weightsExists,
    lastError: health.lastError,
    summary,
  });
}
