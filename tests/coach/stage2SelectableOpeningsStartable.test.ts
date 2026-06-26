import assert from "node:assert/strict";

import { Chess } from "chess.js";

import { STAGE2_OPENING_AVAILABILITY_MATRIX } from "../../lib/blundr/openings/openingAvailability";
import { STAGE2_RUNTIME_OPENING_IDS } from "../../lib/blundr/openings/openingIdentity";
import {
  loadStage2RuntimeTrainableRepertoire,
  selectRuntimeWeightedOpeningSelection,
  selectRuntimeWeightedTrainingLineSelection,
} from "../../lib/blundr/openings/runtimeLineBodyLoader";
import { applyRuntimeUciMove } from "../../lib/blundr/runtime/uciReplay";
import { buildStage2RuntimeGraphSnapshot } from "./stage2RuntimeGraphTestHelpers";

function replayRuntimeLine(uciSequence: readonly string[]): boolean {
  const game = new Chess();
  for (const uci of uciSequence) {
    const move = applyRuntimeUciMove(game, uci);
    if (!move) return false;
  }
  return true;
}

export async function testStage2SelectableOpeningsStartable(): Promise<void> {
  const runtimeAvailableOpeningIds = STAGE2_OPENING_AVAILABILITY_MATRIX
    .filter((opening) => opening.runtimeAvailable)
    .map((opening) => opening.openingId);

  assert.deepEqual(
    [...runtimeAvailableOpeningIds].sort(),
    [...STAGE2_RUNTIME_OPENING_IDS].sort(),
    "runtime_available_openings_must_match_split_loader_ids",
  );

  const missingStartableOpenings: string[] = [];

  for (const openingId of runtimeAvailableOpeningIds) {
    const repertoire = await loadStage2RuntimeTrainableRepertoire(openingId);
    if (!repertoire) {
      missingStartableOpenings.push(`${openingId}:missing_split_runtime_repertoire`);
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
    assert.equal(
      openingSelection.eligibleOpeningIds.includes(openingId),
      true,
      `runtime_opening_not_selectable_through_split_catalog:${openingId}`,
    );

    const lineSelection = selectRuntimeWeightedTrainingLineSelection({
      openingId,
      repertoire,
      seed: `stage2-startable:${openingId}`,
      ratingBandId: "club",
    });

    if (!lineSelection || lineSelection.selectedPlaySequenceUci.length === 0) {
      missingStartableOpenings.push(`${openingId}:missing_playable_start_line`);
      continue;
    }
    if (!replayRuntimeLine(lineSelection.selectedPlaySequenceUci)) {
      missingStartableOpenings.push(`${openingId}:illegal_split_runtime_start_line`);
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

void testStage2SelectableOpeningsStartable().then(() => {
  console.log("stage2SelectableOpeningsStartable ok");
});
