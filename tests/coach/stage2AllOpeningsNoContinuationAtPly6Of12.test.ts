import assert from "node:assert/strict";

import { STAGE2_RUNTIME_OPENING_IDS } from "../../lib/blundr/openings/openingIdentity";
import { getStage2RuntimeTrainableRepertoire, selectRuntimeWeightedTrainingLineSelection } from "../../lib/blundr/openings/runtimeTrainableRepertoires";
import { buildStage2RuntimeGraphSnapshot } from "./stage2RuntimeGraphTestHelpers";

export function testStage2AllOpeningsNoContinuationAtPly6Of12(): void {
  for (const openingId of STAGE2_RUNTIME_OPENING_IDS) {
    const repertoire = getStage2RuntimeTrainableRepertoire(openingId);
    assert.ok(repertoire, `runtime_repertoire_missing:${openingId}`);

    const selection = selectRuntimeWeightedTrainingLineSelection({
      openingId,
      repertoire,
      seed: `stage2-no-continuation:${openingId}`,
    });

    assert.ok(selection, `runtime_selection_missing:${openingId}`);

    const snapshot = buildStage2RuntimeGraphSnapshot({
      selectedOpeningId: openingId,
      selectedLineId: selection!.selectedLineId,
      selectedRuntimeLineId: selection!.selectedLineId,
      selectedRuntimeLineKey: selection!.selectedLineKey,
      selectedRuntimeLinePlaySequenceUci: selection!.selectedPlaySequenceUci,
      selectedRuntimeLinePlyLength: 12,
      selectedRuntimeLineCurrentPly: 6,
      selectedRuntimeLineExhausted: false,
      stage2OpeningCurrentPly: 6,
      stage2OpeningDepthReached: false,
      continueFromHereAvailable: false,
      continueFromHereButtonRendered: false,
      selectedLineCompleteConfirmed: false,
      branchTransitionSurfaceRendered: false,
      terminalProofBlockedReason: "runtime_line_not_exhausted",
      runtimeBookBookExhausted: false,
    });

    assert.equal((snapshot.frame as any)?.continueFromHereButtonRendered, false, `continue_from_here_visible_at_ply_6:${openingId}`);
    assert.equal((snapshot.frame as any)?.continueFromHereAvailable, false, `continue_from_here_available_at_ply_6:${openingId}`);
    assert.equal((snapshot.runtime as any)?.selectedLineCompleteConfirmed, false, `line_complete_visible_at_ply_6:${openingId}`);
    assert.equal((snapshot.frame as any)?.terminalProof?.proven, false, `terminal_proof_proven_at_ply_6:${openingId}`);
  }
}

testStage2AllOpeningsNoContinuationAtPly6Of12();
console.log("stage2AllOpeningsNoContinuationAtPly6Of12 ok");
