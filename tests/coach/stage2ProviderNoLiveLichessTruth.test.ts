import assert from "node:assert/strict";

import { resolveStage2ProviderWarnings } from "../../lib/blundr/providers/providerWarningPolicy";
import { healthyLocalRuntimeContext, warningIds } from "./stage2ProviderWarningTestHelpers";

export function testStage2ProviderNoLiveLichessTruth(): void {
  const healthyWarnings = resolveStage2ProviderWarnings(healthyLocalRuntimeContext({ liveLichessCalled: false }));
  const healthyIds = warningIds(healthyWarnings);
  assert.equal(healthyIds.includes("no_live_lichess_required"), true);
  assert.equal(healthyIds.includes("live_lichess_disabled"), true);
  assert.equal(healthyIds.includes("live_lichess_call_blocked"), false);

  const blockedWarnings = resolveStage2ProviderWarnings(healthyLocalRuntimeContext({ liveLichessCalled: true }));
  const blockedIds = warningIds(blockedWarnings);
  assert.equal(blockedIds.includes("live_lichess_call_blocked"), true);
}

testStage2ProviderNoLiveLichessTruth();
console.log("stage2ProviderNoLiveLichessTruth ok");
