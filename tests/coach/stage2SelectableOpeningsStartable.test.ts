import assert from "node:assert/strict";

import { STAGE2_RUNTIME_OPENING_IDS } from "../../lib/blundr/openings/openingIdentity";
import {
  STAGE2_RUNTIME_TRAINABLE_REPERTOIRES,
  getStage2RuntimeTrainableRepertoire,
  selectRuntimeWeightedOpeningSelection,
  selectRuntimeWeightedTrainingLineSelection,
} from "../../lib/blundr/openings/runtimeTrainableRepertoires";
import { buildStage2RuntimeGraphSnapshot } from "./stage2RuntimeGraphTestHelpers";

export function testStage2SelectableOpeningsStartable(): void {
  assert.equal(
    STAGE2_RUNTIME_TRAINABLE_REPERTOIRES.length,
    STAGE2_RUNTIME_OPENING_IDS.length,
    "runtime_trainable_repertoire_count_mismatch",
  );

  const missingStartableOpenings: string[] = [];

  for (const openingId of STAGE2_RUNTIME_OPENING_IDS) {
    const repertoire = getStage2RuntimeTrainableRepertoire(openingId);
    if (!repertoire) {
      missingStartableOpenings.push(`${openingId}:missing_runtime_repertoire`);
      continue;
    }

    if (!Array.isArray(repertoire.lines) || repertoire.lines.length === 0) {
      missingStartableOpenings.push(`${openingId}:empty_runtime_line_pool`);
      continue;
    }

    const emptyLineIndices = repertoire.lines
      .map((line, lineIndex) => ({ line, lineIndex }))
      .filter(({ line }) => !Array.isArray(line) || line.length === 0)
      .map(({ lineIndex }) => lineIndex);
    if (emptyLineIndices.length > 0) {
      missingStartableOpenings.push(`${openingId}:empty_line_indices=${emptyLineIndices.join(",")}`);
      continue;
    }

    const openingSelection = selectRuntimeWeightedOpeningSelection(`stage2-selectable:${openingId}`);
    assert.ok(openingSelection, `runtime_opening_selection_missing:${openingId}`);

    const lineSelection = selectRuntimeWeightedTrainingLineSelection({
      openingId,
      repertoire,
      seed: `stage2-startable:${openingId}`,
    });

    if (!lineSelection || lineSelection.selectedPlaySequenceUci.length === 0) {
      missingStartableOpenings.push(`${openingId}:missing_playable_start_line`);
      continue;
    }

    const snapshot = buildStage2RuntimeGraphSnapshot({
      selectedOpeningId: openingId,
      selectedLineId: lineSelection.selectedLineId,
      selectedRuntimeLineId: lineSelection.selectedLineId,
      selectedRuntimeLineKey: lineSelection.selectedLineKey,
      selectedRuntimeLinePlayKey: lineSelection.selectedPlayKey,
      selectedRuntimeLinePlaySequenceUci: lineSelection.selectedPlaySequenceUci,
      selectedRuntimeLinePlyLength: lineSelection.selectedPlaySequenceUci.length,
      selectedRuntimeLineCurrentPly: 0,
      selectedRuntimeLineExhausted: false,
      stage2OpeningCurrentPly: 0,
      stage2OpeningDepthReached: false,
      selectedLineCompleteConfirmed: false,
      branchTransitionSurfaceRendered: false,
      continueFromHereAvailable: false,
      continueFromHereButtonRendered: false,
      terminalProofBlockedReason: "runtime_line_not_exhausted",
      runtimeBookBookExhausted: false,
    });

    assert.equal((snapshot.runtime as any)?.selectedOpeningRuntimeAvailable, true, `runtime_opening_not_available:${openingId}`);
    assert.equal((snapshot.runtime as any)?.selectedRuntimeLinePlaySequenceUci?.length > 0, true, `runtime_line_not_playable:${openingId}`);
    assert.equal((snapshot.runtime as any)?.selectedLineCompleteConfirmed, false, `runtime_line_complete_at_start:${openingId}`);
    assert.equal((snapshot.frame as any)?.continueFromHereAvailable, false, `continue_from_here_visible_at_start:${openingId}`);
  }

  assert.equal(missingStartableOpenings.length, 0, `missing_startable_openings:${missingStartableOpenings.join(" | ")}`);
}

testStage2SelectableOpeningsStartable();
console.log("stage2SelectableOpeningsStartable ok");
