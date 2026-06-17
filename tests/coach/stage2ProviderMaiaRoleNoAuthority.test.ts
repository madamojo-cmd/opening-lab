import assert from "node:assert/strict";

import { resolveStage2ProviderWarnings } from "../../lib/blundr/providers/providerWarningPolicy";
import { maiaAuthorityContext, warningIds } from "./stage2ProviderWarningTestHelpers";

export function testStage2ProviderMaiaRoleNoAuthority(): void {
  const warnings = resolveStage2ProviderWarnings(maiaAuthorityContext());
  const ids = warningIds(warnings);
  assert.equal(ids.includes("maia_opponent_reply_only"), true);
  assert.equal(ids.includes("maia_not_user_move_authority"), true);
  assert.equal(warnings.some((warning) => warning.authorityImpact === "blocked_frame"), false);
}

testStage2ProviderMaiaRoleNoAuthority();
console.log("stage2ProviderMaiaRoleNoAuthority ok");
