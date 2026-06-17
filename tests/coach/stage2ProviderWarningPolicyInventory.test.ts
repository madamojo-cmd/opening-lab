import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { STAGE2_PROVIDER_WARNING_POLICY } from "../../lib/blundr/providers/providerWarningPolicy";

const POLICY_PATH = path.resolve(__dirname, "..", "..", "data/blundr/stage2-provider-warning-policy.json");

export function testStage2ProviderWarningPolicyInventory(): void {
  const parsed = JSON.parse(fs.readFileSync(POLICY_PATH, "utf8"));
  assert.equal(parsed.policyId, STAGE2_PROVIDER_WARNING_POLICY.policyId);
  assert.equal(parsed.version, STAGE2_PROVIDER_WARNING_POLICY.version);
  assert.equal(parsed.providers.length, STAGE2_PROVIDER_WARNING_POLICY.providers.length);
  assert.equal(parsed.warnings.length, STAGE2_PROVIDER_WARNING_POLICY.warnings.length);
  assert.deepEqual(
    parsed.providers.map((entry: any) => entry.providerId),
    STAGE2_PROVIDER_WARNING_POLICY.providers.map((entry) => entry.providerId),
  );
  assert.deepEqual(
    parsed.warnings.map((entry: any) => entry.warningId),
    STAGE2_PROVIDER_WARNING_POLICY.warnings.map((entry) => entry.warningId),
  );
  assert.equal(new Set(parsed.providers.map((entry: any) => entry.providerId)).size, parsed.providers.length);
  assert.equal(new Set(parsed.warnings.map((entry: any) => entry.warningId)).size, parsed.warnings.length);
}

testStage2ProviderWarningPolicyInventory();
console.log("stage2ProviderWarningPolicyInventory ok");
