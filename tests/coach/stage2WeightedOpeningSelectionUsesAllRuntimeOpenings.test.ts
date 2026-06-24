import assert from "node:assert/strict";

import { STAGE2_OPENING_AVAILABILITY_MATRIX } from "../../lib/blundr/openings/openingAvailability";
import {
  STAGE2_RUNTIME_WEIGHTED_OPENING_SELECTION,
  selectRuntimeWeightedOpeningSelection,
} from "../../lib/blundr/openings/runtimeTrainableRepertoires";

export function testStage2WeightedOpeningSelectionUsesAllRuntimeOpenings(): void {
  const selection = selectRuntimeWeightedOpeningSelection();
  const eligibleIds = selection.eligibleOpeningIds;
  const matrixIds = STAGE2_OPENING_AVAILABILITY_MATRIX.map((opening) => opening.openingId);
  const devIds = STAGE2_OPENING_AVAILABILITY_MATRIX.filter((opening) => opening.stage === "dev").map((opening) => opening.openingId);
  const betaIds = STAGE2_OPENING_AVAILABILITY_MATRIX.filter((opening) => opening.stage === "beta").map((opening) => opening.openingId);

  assert.equal(selection.mode, "runtime_weighted");
  assert.equal(selection.source, "local_runtime_package");
  assert.equal(selection.weighted, true);
  assert.equal(selection.contentGated, false);
  assert.equal(selection.stageGated, false);
  assert.equal(selection.visibilityGated, false);
  assert.equal(selection.eligibleCount, 21);
  assert.equal(eligibleIds.length, 21);
  assert.deepEqual([...eligibleIds].sort(), [...matrixIds].sort());
  assert.equal(eligibleIds.some((openingId) => devIds.includes(openingId)), true);
  assert.equal(eligibleIds.some((openingId) => betaIds.includes(openingId)), true);
  assert.equal(selection.weightsSummary.length, 21);
  assert.equal(selection.selectedOpeningId.length > 0, true);
  assert.equal(eligibleIds.includes(selection.selectedOpeningId), true);
  assert.equal(STAGE2_RUNTIME_WEIGHTED_OPENING_SELECTION.selectedOpeningId.length > 0, true);
}

testStage2WeightedOpeningSelectionUsesAllRuntimeOpenings();
console.log("stage2WeightedOpeningSelectionUsesAllRuntimeOpenings ok");
