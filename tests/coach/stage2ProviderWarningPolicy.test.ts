import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  resolveStage2ProviderWarnings,
  type Stage2ProviderWarning,
} from "../../lib/blundr/providers/providerWarningPolicy";

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const POLICY_PATH = path.join(REPO_ROOT, "data/blundr/stage2-provider-warning-policy.json");

function loadPolicy(): any {
  const parsed = JSON.parse(fs.readFileSync(POLICY_PATH, "utf8"));
  assert.equal(typeof parsed, "object");
  return parsed;
}

function warningsById(warnings: Stage2ProviderWarning[]): Record<string, Stage2ProviderWarning> {
  return Object.fromEntries(warnings.map((warning) => [warning.warningId, warning]));
}

export function testStage2ProviderWarningPolicy(): void {
  const policy = loadPolicy();
  assert.equal(policy.policyId, "stage2-provider-warning-policy");
  assert.equal(policy.version, "v1");
  assert.equal(Array.isArray(policy.providers), true);
  assert.equal(Array.isArray(policy.warnings), true);

  const providerIds = new Set(policy.providers.map((entry: any) => entry.providerId));
  for (const providerId of [
    "local_runtime_package",
    "historical_lichess_source",
    "maia",
    "stockfish",
    "approved_content",
    "safe_fallback",
    "debug_snapshot",
  ]) {
    assert.equal(providerIds.has(providerId), true, `missing_provider:${providerId}`);
  }

  const warningIds = new Set(policy.warnings.map((entry: any) => entry.warningId));
  for (const warningId of [
    "local_runtime_loaded",
    "local_runtime_missing",
    "no_live_lichess_required",
    "live_lichess_disabled",
    "live_lichess_call_blocked",
    "maia_unavailable",
    "maia_not_required_for_restricted_frame",
    "maia_opponent_reply_only",
    "maia_not_user_move_authority",
    "stockfish_unavailable",
    "stockfish_validation_unavailable",
    "stockfish_not_user_move_authority",
    "continuation_provider_fallback_used",
    "approved_content_not_matched",
    "approved_content_fallback_used",
    "safe_fallback_used",
    "provider_warning_debug_only",
    "provider_warning_user_visible",
    "provider_no_authority_impact",
  ]) {
    assert.equal(warningIds.has(warningId), true, `missing_warning:${warningId}`);
  }

  for (const provider of policy.providers) {
    assert.equal(Array.isArray(provider.allowedRoles), true, `allowed_roles_array:${provider.providerId}`);
    assert.equal(Array.isArray(provider.disallowedRoles), true, `disallowed_roles_array:${provider.providerId}`);
    assert.equal(Array.isArray(provider.warningIds), true, `warning_ids_array:${provider.providerId}`);
  }

  for (const warning of policy.warnings) {
    assert.equal(typeof warning.severity, "string", `warning_severity:${warning.warningId}`);
    assert.equal(typeof warning.userVisible, "boolean", `warning_user_visible:${warning.warningId}`);
    assert.equal(typeof warning.debugOnly, "boolean", `warning_debug_only:${warning.warningId}`);
    assert.equal(typeof warning.fallbackBehavior, "string", `warning_fallback_behavior:${warning.warningId}`);
    assert.equal(typeof warning.authorityImpact, "string", `warning_authority_impact:${warning.warningId}`);
    assert.equal(Array.isArray(warning.tests), true, `warning_tests:${warning.warningId}`);
    assert.equal(warning.tests.length > 0, true, `warning_tests_empty:${warning.warningId}`);
  }

  const localWarnings = resolveStage2ProviderWarnings({
    runtimeDataSource: "local_crawled_package",
    liveLichessCalled: false,
    runtimeAvailable: true,
    selectedOpeningRuntimeAvailable: true,
    trainingMode: "restricted",
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    visibleSurfaceMode: "assisted",
    stockfishProviderStatus: "ready",
    maiaProviderStatus: "disabled",
    approvedContentMatched: true,
    stage2ApprovedContentEnabled: true,
  });
  const localWarningsById = warningsById(localWarnings);
  assert.equal(Boolean(localWarningsById.local_runtime_loaded), true);
  assert.equal(Boolean(localWarningsById.no_live_lichess_required), true);
  assert.equal(Boolean(localWarningsById.live_lichess_disabled), true);
  assert.equal(localWarnings.some((warning) => warning.authorityImpact === "blocked_frame"), false);

  const fallbackWarnings = resolveStage2ProviderWarnings({
    runtimeDataSource: "local_crawled_package",
    liveLichessCalled: false,
    runtimeAvailable: true,
    selectedOpeningRuntimeAvailable: true,
    trainingMode: "continuation",
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    visibleSurfaceMode: "assisted",
    stockfishProviderStatus: "unavailable",
    approvedContentMatched: false,
    approvedPacketKind: "safe_fallback",
    runtimeSafeFallbackUsed: true,
    runtimeSafeFallbackReason: "stockfish_provider_unavailable",
    stage2ApprovedContentEnabled: true,
    stage2SafeFallbackEnabled: true,
  });
  const fallbackWarningsById = warningsById(fallbackWarnings);
  assert.equal(Boolean(fallbackWarningsById.stockfish_unavailable), true);
  assert.equal(Boolean(fallbackWarningsById.approved_content_not_matched), true);
  assert.equal(Boolean(fallbackWarningsById.approved_content_fallback_used), true);
  assert.equal(Boolean(fallbackWarningsById.safe_fallback_used), true);
  assert.equal(Boolean(fallbackWarningsById.continuation_provider_fallback_used), true);
  assert.equal(fallbackWarningsById.stockfish_unavailable.severity, "degraded");
  assert.equal(fallbackWarningsById.approved_content_not_matched.fallbackUsed, true);
  assert.equal(fallbackWarningsById.safe_fallback_used.authorityImpact, "none");
}

testStage2ProviderWarningPolicy();
console.log("stage2ProviderWarningPolicy ok");
