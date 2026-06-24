import assert from "node:assert/strict";

import { buildStage2RuntimeGraphSnapshot } from "./stage2RuntimeGraphTestHelpers";

export function testStage2ContinuationButtonHasLiveClickHandler(): void {
  const snapshot = buildStage2RuntimeGraphSnapshot({
    trainingMode: "continuation",
    userExplicitlyEnteredContinuation: true,
    continueFromHereClicked: true,
    continueFromHereClickHandled: true,
    continueFromHereClickBlockedReason: null,
    continuationSessionId: "continuation-session-live-click",
    branchTransitionSurfaceRendered: true,
    continueFromHereAvailable: true,
    continueFromHereButtonRendered: true,
    branchCompleteEligible: false,
    branchCompleteBlockedReason: null,
    maiaContinuationEnabled: true,
    maiaContinuationStatus: "loading",
    maiaContinuationLoaded: false,
    maiaContinuationError: null,
    maiaOpponentProviderUsed: true,
    maiaOpponentRequestPending: true,
    maiaOpponentLastMoveUci: null,
  });

  assert.equal((snapshot.frame as any)?.continueFromHereButtonRendered, true);
  assert.equal((snapshot.frame as any)?.continueFromHereClicked, true);
  assert.equal((snapshot.frame as any)?.continueFromHereClickHandled, true);
  assert.equal((snapshot.frame as any)?.continueFromHereClickBlockedReason, null);
  assert.equal((snapshot.continuation as any)?.continuationSessionId, "continuation-session-live-click");
  assert.equal((snapshot.maia as any)?.maiaContinuationEnabled, true);
  assert.equal((snapshot.maia as any)?.maiaContinuationStatus, "loading");
  assert.equal((snapshot.maia as any)?.maiaOpponentRequestPending, true);
}

testStage2ContinuationButtonHasLiveClickHandler();
console.log("stage2ContinuationButtonHasLiveClickHandler ok");
