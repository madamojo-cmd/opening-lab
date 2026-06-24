import assert from "node:assert/strict";

import { selectRuntimeWeightedOpeningSelection } from "../../lib/blundr/openings/runtimeTrainableRepertoires";

export function testStage2OpeningSelectionRunsPerNewSession(): void {
  const sessionA = selectRuntimeWeightedOpeningSelection("session-1");
  const sessionB = selectRuntimeWeightedOpeningSelection("session-2");
  const sessionARepeat = selectRuntimeWeightedOpeningSelection("session-1");

  assert.equal(sessionA.source, "local_runtime_package");
  assert.equal(sessionB.source, "local_runtime_package");
  assert.equal(sessionA.mode, "runtime_weighted");
  assert.equal(sessionA.weighted, true);
  assert.equal(sessionA.selectedOpeningId, sessionARepeat.selectedOpeningId);
  assert.notEqual(sessionA.selectedOpeningId, sessionB.selectedOpeningId);
  assert.equal(sessionA.eligibleCount, 21);
  assert.equal(sessionB.eligibleCount, 21);
}

testStage2OpeningSelectionRunsPerNewSession();
console.log("stage2OpeningSelectionRunsPerNewSession ok");
