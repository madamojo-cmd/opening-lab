import assert from "node:assert/strict";

import { resolveStage2ProviderWarnings, summarizeStage2ProviderWarnings } from "../../lib/blundr/providers/providerWarningPolicy";
import { healthyLocalRuntimeContext } from "./stage2ProviderWarningTestHelpers";

export function testStage2ProviderNoNoiseOnHealthyFrame(): void {
  const warnings = resolveStage2ProviderWarnings(healthyLocalRuntimeContext());
  const summary = summarizeStage2ProviderWarnings(warnings);
  assert.equal(summary.blockedFrameCount, 0);
  assert.equal(summary.blockedNonAuthorityFeatureCount, 0);
  assert.equal(summary.userVisibleCount, 0);
  assert.equal(warnings.every((warning) => warning.userVisible === false), true);
}

testStage2ProviderNoNoiseOnHealthyFrame();
console.log("stage2ProviderNoNoiseOnHealthyFrame ok");
