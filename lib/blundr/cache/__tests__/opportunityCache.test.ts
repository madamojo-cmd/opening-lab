import assert from "node:assert/strict";

import { getCachedOpportunity, opportunityCacheKey, opportunityCacheStats, resetOpportunityCache, setCachedOpportunity } from "../opportunityCache";

export function testOpportunityCache(): void {
  resetOpportunityCache();
  const key = opportunityCacheKey({ fen: "8/8/8/8/8/8/8/4K3 w - - 0 1", trainerView: "assisted", interaction: "none", trainingMode: "restricted" });
  setCachedOpportunity(key, null);
  assert.equal(getCachedOpportunity(key), null);
  assert.equal(opportunityCacheStats().hits >= 1, true);
}
