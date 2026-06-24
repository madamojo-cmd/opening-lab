import assert from "node:assert/strict";

import { buildStage2RuntimeGraphSnapshot } from "./stage2RuntimeGraphTestHelpers";

export function testStage2ContinueFromHereInitializesMaia(): void {
  const snapshot = buildStage2RuntimeGraphSnapshot({
    trainingMode: "continuation",
    userExplicitlyEnteredContinuation: true,
    continueFromHereClicked: true,
    continueFromHereClickHandled: true,
    continuationSessionId: "continuation-session-2",
    maiaOpponentProviderStatus: "loading",
    maiaRuntimeErrorReason: null,
    maiaContinuationEnabled: true,
    maiaContinuationStatus: "loading",
    maiaContinuationLoaded: false,
    maiaContinuationError: null,
    maiaOpponentProviderUsed: true,
    maiaOpponentRequestPending: true,
    maiaOpponentLastMoveUci: null,
  });

  assert.equal((snapshot.maia as any)?.maiaContinuationEnabled, true);
  assert.equal((snapshot.maia as any)?.maiaContinuationStatus, "loading");
  assert.equal((snapshot.maia as any)?.maiaContinuationLoaded, false);
  assert.equal((snapshot.maia as any)?.maiaContinuationError, "");
  assert.equal((snapshot.maia as any)?.maiaOpponentProviderUsed, true);
}

testStage2ContinueFromHereInitializesMaia();
console.log("stage2ContinueFromHereInitializesMaia ok");
