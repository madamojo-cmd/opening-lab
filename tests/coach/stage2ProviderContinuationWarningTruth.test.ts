import assert from "node:assert/strict";

import { resolveStage2ProviderWarnings } from "../../lib/blundr/providers/providerWarningPolicy";
import { continuationFallbackContext, warningIds } from "./stage2ProviderWarningTestHelpers";

export function testStage2ProviderContinuationWarningTruth(): void {
  const warnings = resolveStage2ProviderWarnings(continuationFallbackContext());
  const ids = warningIds(warnings);
  assert.equal(ids.includes("stockfish_unavailable"), true);
  assert.equal(ids.includes("continuation_provider_fallback_used"), true);
  assert.equal(ids.includes("safe_fallback_used"), true);
  assert.equal(warnings.find((warning) => warning.warningId === "continuation_provider_fallback_used")?.fallbackUsed, true);
}

testStage2ProviderContinuationWarningTruth();
console.log("stage2ProviderContinuationWarningTruth ok");
