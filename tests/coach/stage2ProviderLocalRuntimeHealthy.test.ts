import assert from "node:assert/strict";

import { resolveStage2ProviderWarnings } from "../../lib/blundr/providers/providerWarningPolicy";
import { healthyLocalRuntimeContext, warningIds } from "./stage2ProviderWarningTestHelpers";

export function testStage2ProviderLocalRuntimeHealthy(): void {
  const warnings = resolveStage2ProviderWarnings(healthyLocalRuntimeContext());
  const ids = warningIds(warnings);

  assert.equal(ids.includes("local_runtime_loaded"), true);
  assert.equal(ids.includes("no_live_lichess_required"), true);
  assert.equal(ids.includes("live_lichess_disabled"), true);
  assert.equal(ids.includes("live_lichess_call_blocked"), false);
  assert.equal(ids.includes("local_runtime_missing"), false);
  assert.equal(warnings.every((warning) => warning.authorityImpact !== "blocked_frame"), true);
}

testStage2ProviderLocalRuntimeHealthy();
console.log("stage2ProviderLocalRuntimeHealthy ok");
