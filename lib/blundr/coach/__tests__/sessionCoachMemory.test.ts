import assert from "node:assert/strict";

import { createSessionCoachMemory, hashCoachBody } from "../sessionCoachMemory";

export function testSessionCoachMemory(): void {
  const memory = createSessionCoachMemory();
  assert.deepEqual(memory.selectedOpportunityHistory, []);
  assert.equal(hashCoachBody("abc"), hashCoachBody("abc"));
}
