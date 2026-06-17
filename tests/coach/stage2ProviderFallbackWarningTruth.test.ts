import assert from "node:assert/strict";

import { resolveStage2ProviderWarnings } from "../../lib/blundr/providers/providerWarningPolicy";
import { safeFallbackContext, warningIds } from "./stage2ProviderWarningTestHelpers";

export function testStage2ProviderFallbackWarningTruth(): void {
  const warnings = resolveStage2ProviderWarnings(safeFallbackContext());
  const ids = warningIds(warnings);
  assert.equal(ids.includes("approved_content_not_matched"), true);
  assert.equal(ids.includes("approved_content_fallback_used"), true);
  assert.equal(ids.includes("safe_fallback_used"), true);
  assert.equal(ids.includes("continuation_provider_fallback_used"), true);
  assert.equal(warnings.find((warning) => warning.warningId === "approved_content_not_matched")?.fallbackUsed, true);
}

testStage2ProviderFallbackWarningTruth();
console.log("stage2ProviderFallbackWarningTruth ok");
