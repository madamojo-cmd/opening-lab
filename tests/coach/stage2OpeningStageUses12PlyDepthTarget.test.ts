import assert from "node:assert/strict";

import { selectRuntimeWeightedTrainingLineSelection } from "../../lib/blundr/openings/runtimeTrainableRepertoires";
import { buildStage2RuntimeGraphSnapshot } from "./stage2RuntimeGraphTestHelpers";

export function testStage2OpeningStageUses12PlyDepthTarget(): void {
  const selection = selectRuntimeWeightedTrainingLineSelection({
    openingId: "italian-white",
    seed: "stage2-opening-depth-target",
  });

  assert.ok(selection);
  assert.equal(selection?.selectedPlaySequenceUci.length, 12);

  const sixOfTwelve = buildStage2RuntimeGraphSnapshot({
    selectedRuntimeLinePlaySequenceUci: selection!.selectedPlaySequenceUci,
    selectedRuntimeLinePlyLength: 12,
    selectedRuntimeLineCurrentPly: 6,
    selectedRuntimeLineExhausted: false,
    stage2OpeningCurrentPly: 6,
    stage2OpeningDepthReached: false,
    branchTransitionSurfaceRendered: false,
    continueFromHereAvailable: false,
    continueFromHereButtonRendered: false,
    selectedLineCompleteConfirmed: false,
    terminalProofBlockedReason: "runtime_line_not_exhausted",
    visibleTitle: "Book progress",
  });

  assert.equal((sixOfTwelve.continuation as any)?.stage2OpeningDepthTargetPly, 12);
  assert.equal((sixOfTwelve.continuation as any)?.stage2OpeningCurrentPly, 6);
  assert.equal((sixOfTwelve.continuation as any)?.stage2OpeningDepthReached, false);
  assert.equal((sixOfTwelve.frame as any)?.terminalProof?.proven, false);
  assert.equal((sixOfTwelve.frame as any)?.continueFromHereButtonRendered, false);

  const twelveOfTwelve = buildStage2RuntimeGraphSnapshot({
    selectedRuntimeLinePlaySequenceUci: selection!.selectedPlaySequenceUci,
    selectedRuntimeLinePlyLength: 12,
    selectedRuntimeLineCurrentPly: 12,
    selectedRuntimeLineExhausted: true,
    stage2OpeningCurrentPly: 12,
    stage2OpeningDepthReached: true,
    branchTransitionSurfaceRendered: true,
      continueFromHereAvailable: true,
      continueFromHereButtonRendered: true,
      selectedLineCompleteConfirmed: true,
      terminalProofBlockedReason: null,
      bookCompleteAllowed: true,
      guidedCompleteAllowed: true,
      visibleTitle: "Line complete",
    });

  assert.equal((twelveOfTwelve.continuation as any)?.stage2OpeningDepthTargetPly, 12);
  assert.equal((twelveOfTwelve.continuation as any)?.stage2OpeningCurrentPly, 12);
  assert.equal((twelveOfTwelve.continuation as any)?.stage2OpeningDepthReached, true);
  assert.equal((twelveOfTwelve.frame as any)?.terminalProof?.proven, true);
  assert.equal((twelveOfTwelve.frame as any)?.continueFromHereButtonRendered, true);
}

testStage2OpeningStageUses12PlyDepthTarget();
console.log("stage2OpeningStageUses12PlyDepthTarget ok");
