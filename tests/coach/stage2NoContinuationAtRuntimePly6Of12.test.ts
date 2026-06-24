import assert from "node:assert/strict";

import { buildStage2RuntimeGraphSnapshot } from "./stage2RuntimeGraphTestHelpers";

export function testStage2NoContinuationAtRuntimePly6Of12(): void {
  const snapshot = buildStage2RuntimeGraphSnapshot({
    selectedRuntimeLineCurrentPly: 6,
    selectedRuntimeLinePlyLength: 12,
    selectedRuntimeLineExhausted: false,
    stage2OpeningCurrentPly: 6,
    stage2OpeningDepthReached: false,
    selectedLineCompleteConfirmed: false,
    branchTransitionSurfaceRendered: false,
    continueFromHereAvailable: false,
    continueFromHereButtonRendered: false,
    visibleTitle: "Book progress",
    terminalProofBlockedReason: "runtime_line_not_exhausted",
  });

  assert.equal((snapshot.frame as any)?.terminalProof?.proven, false);
  assert.equal((snapshot.frame as any)?.branchTransitionSurfaceRendered, false);
  assert.equal((snapshot.frame as any)?.continueFromHereButtonRendered, false);
  assert.equal((snapshot.frame as any)?.continueFromHereAvailable, false);
  assert.equal((snapshot.runtime as any)?.selectedRuntimeLinePlyLength, 12);
  assert.equal((snapshot.runtime as any)?.selectedRuntimeLineCurrentPly, 6);
  assert.equal((snapshot.runtime as any)?.selectedRuntimeLineExhausted, false);
  assert.equal((snapshot.continuation as any)?.stage2OpeningDepthTargetPly, 12);
  assert.equal((snapshot.continuation as any)?.stage2OpeningDepthReached, false);
}

testStage2NoContinuationAtRuntimePly6Of12();
console.log("stage2NoContinuationAtRuntimePly6Of12 ok");
