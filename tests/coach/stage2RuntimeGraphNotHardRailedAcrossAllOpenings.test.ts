import assert from "node:assert/strict";

import { STAGE2_RUNTIME_OPENING_IDS } from "../../lib/blundr/openings/openingIdentity";
import { getStage2RuntimeTrainableRepertoire, selectRuntimeWeightedTrainingLineSelection } from "../../lib/blundr/openings/runtimeTrainableRepertoires";
import { buildStage2RuntimeGraphSnapshot } from "./stage2RuntimeGraphTestHelpers";

export function testStage2RuntimeGraphNotHardRailedAcrossAllOpenings(): void {
  for (const openingId of STAGE2_RUNTIME_OPENING_IDS) {
    const repertoire = getStage2RuntimeTrainableRepertoire(openingId);
    assert.ok(repertoire, `runtime_repertoire_missing:${openingId}`);

    const selection = selectRuntimeWeightedTrainingLineSelection({
      openingId,
      repertoire,
      seed: `stage2-graph:${openingId}`,
    });

    assert.ok(selection, `runtime_selection_missing:${openingId}`);

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
      runtimeGraphCurrentPlayKey: selection!.selectedPlaySequenceUci.slice(0, 6).join(","),
      runtimeGraphCandidateCount: 3,
      hardRailDetected: false,
      hardRailBlockedReason: null,
      continueFromHereAvailable: false,
      continueFromHereButtonRendered: false,
      selectedLineCompleteConfirmed: false,
      stage2OpeningCurrentPly: 6,
      stage2OpeningDepthReached: false,
      branchTransitionSurfaceRendered: false,
      terminalProofBlockedReason: "runtime_line_not_exhausted",
    });

    assert.equal((snapshot.runtime as any)?.selectedRuntimeLineKey, selection!.selectedLineKey, `runtime_graph_selected_key_mismatch:${openingId}`);
    assert.equal((snapshot.continuation as any)?.runtimeGraphCurrentPlayKey, selection!.selectedPlaySequenceUci.slice(0, 6).join(","), `runtime_graph_current_play_key_mismatch:${openingId}`);
    assert.notEqual((snapshot.runtime as any)?.selectedRuntimeLineKey, (snapshot.continuation as any)?.runtimeGraphCurrentPlayKey, `runtime_graph_hard_railed:${openingId}`);
    assert.equal((snapshot.continuation as any)?.hardRailDetected, false, `runtime_graph_hard_rail_detected:${openingId}`);
  }
}

testStage2RuntimeGraphNotHardRailedAcrossAllOpenings();
console.log("stage2RuntimeGraphNotHardRailedAcrossAllOpenings ok");
