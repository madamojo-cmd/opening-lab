import assert from "node:assert/strict";

import { STAGE2_PROVIDER_WARNING_POLICY } from "../../lib/blundr/providers/providerWarningPolicy";

export function testStage2ProviderWarningTaxonomy(): void {
  const providers = Object.fromEntries(STAGE2_PROVIDER_WARNING_POLICY.providers.map((provider) => [provider.providerId, provider]));
  const warnings = Object.fromEntries(STAGE2_PROVIDER_WARNING_POLICY.warnings.map((warning) => [warning.warningId, warning]));

  assert.equal(providers.local_runtime_package.allowedRoles.includes("authoritative_runtime_source"), true);
  assert.equal(providers.maia.allowedRoles.includes("opponent_reply_provider"), true);
  assert.equal(providers.stockfish.allowedRoles.includes("continuation_validator"), true);
  assert.equal(providers.approved_content.allowedRoles.includes("approved_content_enricher"), true);
  assert.equal(providers.safe_fallback.allowedRoles.includes("safe_fallback_renderer"), true);
  assert.equal(providers.debug_snapshot.allowedRoles.includes("debug_report_only"), true);

  assert.equal(warnings.local_runtime_missing.authorityImpact, "blocked_frame");
  assert.equal(warnings.live_lichess_call_blocked.authorityImpact, "blocked_frame");
  assert.equal(warnings.maia_unavailable.authorityImpact, "blocked_non_authority_feature");
  assert.equal(warnings.stockfish_unavailable.authorityImpact, "blocked_non_authority_feature");
  assert.equal(warnings.approved_content_not_matched.authorityImpact, "none");
  assert.equal(warnings.safe_fallback_used.authorityImpact, "none");
  assert.equal(warnings.provider_warning_debug_only.debugOnly, true);
  assert.equal(warnings.provider_warning_user_visible.userVisible, true);
  assert.equal(warnings.provider_no_authority_impact.authorityImpact, "none");
}

testStage2ProviderWarningTaxonomy();
console.log("stage2ProviderWarningTaxonomy ok");
