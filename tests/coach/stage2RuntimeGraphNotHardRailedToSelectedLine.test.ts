import assert from "node:assert/strict";

import { buildStage2RuntimeGraphSnapshot } from "./stage2RuntimeGraphTestHelpers";

export function testStage2RuntimeGraphNotHardRailedToSelectedLine(): void {
  const snapshot = buildStage2RuntimeGraphSnapshot({
    visibleTitle: "Opening stage",
    branchTransitionSurfaceRendered: false,
    continueFromHereAvailable: false,
    continueFromHereButtonRendered: false,
    selectedRuntimeLineCurrentPly: 0,
    stage2OpeningCurrentPly: 0,
    stage2OpeningDepthReached: false,
    hardRailDetected: false,
    hardRailBlockedReason: null,
    runtimeGraphAuthorityUsed: "local_runtime_package",
    runtimeGraphCurrentPlayKey: "",
    runtimeGraphCandidateCount: 3,
    runtimeGraphSelectedCandidateUci: "f1c4",
    selectedRuntimeLineUsedFor: "opening_stage",
  });

  assert.equal((snapshot.continuation as any)?.runtimeGraphAuthorityUsed, "local_runtime_package");
  assert.equal((snapshot.continuation as any)?.runtimeGraphCandidateCount, 3);
  assert.equal((snapshot.continuation as any)?.runtimeGraphSelectedCandidateUci, "f1c4");
  assert.equal((snapshot.continuation as any)?.hardRailDetected, false);
  assert.equal((snapshot.continuation as any)?.hardRailBlockedReason, null);
  assert.equal((snapshot.continuation as any)?.selectedRuntimeLineUsedFor, "opening_stage");
}

testStage2RuntimeGraphNotHardRailedToSelectedLine();
console.log("stage2RuntimeGraphNotHardRailedToSelectedLine ok");
