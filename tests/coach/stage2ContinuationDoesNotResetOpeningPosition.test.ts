import assert from "node:assert/strict";

import { buildStage2RuntimeGraphSnapshot } from "./stage2RuntimeGraphTestHelpers";

export function testStage2ContinuationDoesNotResetOpeningPosition(): void {
  const snapshot = buildStage2RuntimeGraphSnapshot({
    trainingMode: "continuation",
    userExplicitlyEnteredContinuation: true,
    continueFromHereClicked: true,
    continueFromHereClickHandled: true,
    continuationSessionId: "continuation-session-reset-check",
    selectedRuntimeLineCurrentPly: 12,
    stage2OpeningCurrentPly: 12,
    stage2OpeningDepthReached: true,
    selectedRuntimeLineExhausted: true,
    branchTransitionSurfaceRendered: true,
    continueFromHereAvailable: true,
    continueFromHereButtonRendered: true,
    visibleTitle: "Continue from here",
    moveHistory: ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "g8f6", "f3g5", "d7d5", "e4d5", "c6a5", "c4b5", "c7c6"],
  });

  assert.equal((snapshot.frame as any)?.currentPly, 12);
  assert.equal((snapshot.frame as any)?.terminalProof?.proven, true);
  assert.equal((snapshot.continuation as any)?.continuationSessionId, "continuation-session-reset-check");
  assert.equal((snapshot.runtime as any)?.selectedRuntimeLineCurrentPly, 12);
  assert.equal((snapshot.runtime as any)?.selectedRuntimeLineExhausted, true);
  assert.equal((snapshot.continuation as any)?.stage2OpeningCurrentPly, 12);
  assert.equal((snapshot.continuation as any)?.stage2OpeningDepthReached, true);
}

testStage2ContinuationDoesNotResetOpeningPosition();
console.log("stage2ContinuationDoesNotResetOpeningPosition ok");
