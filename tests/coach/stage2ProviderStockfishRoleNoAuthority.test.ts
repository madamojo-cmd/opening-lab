import assert from "node:assert/strict";

import { resolveStage2ProviderWarnings } from "../../lib/blundr/providers/providerWarningPolicy";
import { stockfishAuthorityContext, warningIds } from "./stage2ProviderWarningTestHelpers";

export function testStage2ProviderStockfishRoleNoAuthority(): void {
  const warnings = resolveStage2ProviderWarnings(stockfishAuthorityContext());
  const ids = warningIds(warnings);
  assert.equal(ids.includes("stockfish_not_user_move_authority"), true);
  assert.equal(warnings.some((warning) => warning.authorityImpact === "blocked_frame"), false);
}

testStage2ProviderStockfishRoleNoAuthority();
console.log("stage2ProviderStockfishRoleNoAuthority ok");
