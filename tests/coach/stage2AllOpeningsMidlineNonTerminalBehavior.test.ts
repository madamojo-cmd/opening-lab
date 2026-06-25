import assert from "node:assert/strict";

import { STAGE2_RUNTIME_OPENING_IDS } from "../../lib/blundr/openings/openingIdentity";
import {
  getStage2RuntimeTrainableRepertoire,
  selectRuntimeWeightedTrainingLineSelection,
} from "../../lib/blundr/openings/runtimeTrainableRepertoires";
import { buildStage2RuntimeGraphSnapshot } from "./stage2RuntimeGraphTestHelpers";

export function testStage2AllOpeningsMidlineNonTerminalBehavior(): void {
  for (const openingId of STAGE2_RUNTIME_OPENING_IDS) {
    const repertoire = getStage2RuntimeTrainableRepertoire(openingId);
    assert.ok(repertoire, `runtime_repertoire_missing:${openingId}`);

    const selection = selectRuntimeWeightedTrainingLineSelection({
      openingId,
      repertoire,
      seed: `stage2-midline:${openingId}`,
    });

    assert.ok(selection, `runtime_selection_missing:${openingId}`);
    assert.ok(selection!.selectedPlaySequenceUci.length >= 6, `runtime_line_too_short_for_midline:${openingId}`);

    const snapshot = buildStage2RuntimeGraphSnapshot({
      selectedOpeningId: openingId,
      selectedLineId: selection!.selectedLineId,
      selectedRuntimeLineId: selection!.selectedLineId,
      selectedRuntimeLineKey: selection!.selectedLineKey,
      selectedRuntimeLinePlayKey: selection!.selectedPlayKey,
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

    assert.equal((snapshot.runtime as any)?.selectedRuntimeLineCurrentPly, 6, `midline_current_ply_mismatch:${openingId}`);
    assert.equal((snapshot.runtime as any)?.selectedRuntimeLineExhausted, false, `midline_exhausted_at_ply_6:${openingId}`);
    assert.equal((snapshot.runtime as any)?.selectedLineCompleteConfirmed, false, `midline_line_complete_visible:${openingId}`);
    assert.equal((snapshot.frame as any)?.continueFromHereAvailable, false, `midline_continue_from_here_visible:${openingId}`);
    assert.equal((snapshot.frame as any)?.continueFromHereButtonRendered, false, `midline_continue_from_here_button_visible:${openingId}`);
    assert.equal((snapshot.frame as any)?.branchTransitionSurfaceRendered, false, `midline_branch_transition_visible:${openingId}`);
    assert.equal((snapshot.frame as any)?.terminalProof?.proven, false, `midline_terminal_proof_proven:${openingId}`);
  }
}

testStage2AllOpeningsMidlineNonTerminalBehavior();
console.log("stage2AllOpeningsMidlineNonTerminalBehavior ok");
