import assert from "node:assert/strict";

import { STAGE2_RUNTIME_OPENING_IDS } from "../../lib/blundr/openings/openingIdentity";
import { getStage2RuntimeTrainableRepertoire, selectRuntimeWeightedTrainingLineSelection } from "../../lib/blundr/openings/runtimeTrainableRepertoires";
import { buildStage2RuntimeGraphSnapshot } from "./stage2RuntimeGraphTestHelpers";

export function testStage2AllOpeningsCompleteAtPly12Of12(): void {
  for (const openingId of STAGE2_RUNTIME_OPENING_IDS) {
    const repertoire = getStage2RuntimeTrainableRepertoire(openingId);
    assert.ok(repertoire, `runtime_repertoire_missing:${openingId}`);

    const selection = selectRuntimeWeightedTrainingLineSelection({
      openingId,
      repertoire,
      seed: `stage2-complete:${openingId}`,
    });

    assert.ok(selection, `runtime_selection_missing:${openingId}`);

    const snapshot = buildStage2RuntimeGraphSnapshot({
      selectedOpeningId: openingId,
      selectedLineId: selection!.selectedLineId,
      selectedRuntimeLineId: selection!.selectedLineId,
      selectedRuntimeLineKey: selection!.selectedLineKey,
      selectedRuntimeLinePlaySequenceUci: selection!.selectedPlaySequenceUci,
      selectedRuntimeLinePlyLength: 12,
      selectedRuntimeLineCurrentPly: 12,
      selectedRuntimeLineExhausted: true,
      stage2OpeningCurrentPly: 12,
      stage2OpeningDepthReached: true,
      continueFromHereAvailable: true,
      continueFromHereButtonRendered: true,
      selectedLineCompleteConfirmed: true,
      branchTransitionSurfaceRendered: true,
      bookCompleteAllowed: true,
      guidedCompleteAllowed: true,
      terminalProofBlockedReason: null,
      runtimeBookBookExhausted: false,
    });

    assert.equal((snapshot.frame as any)?.continueFromHereButtonRendered, true, `continue_from_here_hidden_at_ply_12:${openingId}`);
    assert.equal((snapshot.frame as any)?.continueFromHereAvailable, true, `continue_from_here_unavailable_at_ply_12:${openingId}`);
    assert.equal((snapshot.runtime as any)?.selectedLineCompleteConfirmed, true, `line_complete_hidden_at_ply_12:${openingId}`);
    assert.equal((snapshot.frame as any)?.terminalProof?.proven, true, `terminal_proof_not_proven_at_ply_12:${openingId}`);
  }
}

testStage2AllOpeningsCompleteAtPly12Of12();
console.log("stage2AllOpeningsCompleteAtPly12Of12 ok");
