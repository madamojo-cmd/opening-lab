import assert from "node:assert/strict";

import { buildStage2RuntimeGraphSnapshot } from "./stage2RuntimeGraphTestHelpers";

export function testStage2ContinueFromHereClickEntersContinuation(): void {
  const snapshot = buildStage2RuntimeGraphSnapshot({
    trainingMode: "continuation",
    userExplicitlyEnteredContinuation: true,
    continueFromHereClicked: true,
    continueFromHereClickHandled: true,
    continueFromHereClickBlockedReason: null,
    continuationSessionId: "continuation-session-1",
    branchTransitionSurfaceRendered: false,
    continueFromHereAvailable: false,
    continueFromHereButtonRendered: false,
    maiaContinuationEnabled: true,
    maiaContinuationStatus: "loading",
    maiaContinuationLoaded: false,
    maiaOpponentProviderUsed: true,
    maiaOpponentRequestPending: true,
    visibleTitle: "Continuation mode active",
  });

  assert.equal((snapshot.frame as any)?.continueFromHereClicked, true);
  assert.equal((snapshot.frame as any)?.continueFromHereClickHandled, true);
  assert.equal((snapshot.frame as any)?.continueFromHereClickBlockedReason, null);
  assert.equal((snapshot.frame as any)?.branchTransitionSurfaceRendered, false);
  assert.equal((snapshot.continuation as any)?.continuationSessionId, "continuation-session-1");
  assert.equal((snapshot.maia as any)?.maiaContinuationEnabled, true);
}

testStage2ContinueFromHereClickEntersContinuation();
console.log("stage2ContinueFromHereClickEntersContinuation ok");
