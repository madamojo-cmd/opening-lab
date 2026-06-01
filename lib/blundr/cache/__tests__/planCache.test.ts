import assert from "node:assert/strict";

import { getCachedStrategicPlans, planCacheStats, resetPlanCache } from "../planCache";

export function testPlanCache(): void {
  resetPlanCache();
  const input = { fen: "8/8/8/8/8/8/8/4K3 w - - 0 1" };
  getCachedStrategicPlans(input);
  getCachedStrategicPlans(input);
  assert.equal(planCacheStats().hits >= 1, true);
}
