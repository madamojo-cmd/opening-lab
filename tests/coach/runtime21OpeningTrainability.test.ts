import assert from "node:assert/strict";

import { Chess } from "chess.js";

import { buildOpeningTree } from "../../lib/blundr/openings/openingTree";
import { normalizeVisualFen } from "../../lib/blundr/visual/normalizeVisualFen";
import { STAGE2_OPENING_AVAILABILITY_MATRIX } from "../../lib/blundr/openings/openingAvailability";
import {
  STAGE2_RUNTIME_TRAINABLE_REPERTOIRES,
  getStage2RuntimeTrainableRepertoire,
} from "../../lib/blundr/openings/runtimeTrainableRepertoires";

function buildRepertoireLineInputs(repertoire: {
  id: string;
  name: string;
  color: "white" | "black";
  lines: string[][];
}): Array<{
  openingId: string;
  lineId: string;
  openingName: string;
  sideToTrain: "white" | "black";
  movesSan: string[];
}> {
  return repertoire.lines.map((movesSan, index) => ({
    openingId: repertoire.id,
    lineId: `${repertoire.id}:${index}`,
    openingName: repertoire.name,
    sideToTrain: repertoire.color,
    movesSan,
  }));
}

export function testRuntime21OpeningTrainability(): void {
  assert.equal(STAGE2_RUNTIME_TRAINABLE_REPERTOIRES.length, 21, "runtime_trainable_repertoire_count_must_be_21");
  assert.equal(STAGE2_OPENING_AVAILABILITY_MATRIX.length, 21, "runtime_visibility_matrix_must_remain_21");

  const startFen4 = normalizeVisualFen(new Chess().fen());
  const repertoireIds = new Set(STAGE2_RUNTIME_TRAINABLE_REPERTOIRES.map((repertoire) => repertoire.id));
  const openingIds = STAGE2_OPENING_AVAILABILITY_MATRIX.map((opening) => opening.openingId);
  assert.deepEqual([...repertoireIds].sort(), [...openingIds].sort(), "runtime_trainable_ids_must_match_visibility_matrix");
  assert.equal(STAGE2_OPENING_AVAILABILITY_MATRIX.filter((opening) => opening.contentStatus === "approved").length, 21);
  assert.equal(STAGE2_OPENING_AVAILABILITY_MATRIX.filter((opening) => opening.contentStatus === "sample").length, 0);

  for (const opening of STAGE2_OPENING_AVAILABILITY_MATRIX) {
    const repertoire = getStage2RuntimeTrainableRepertoire(opening.openingId);
    assert.ok(repertoire, `runtime_trainable_repertoire_missing:${opening.openingId}`);
    assert.equal(repertoire?.lines.length ?? 0, 1, `runtime_trainable_line_missing:${opening.openingId}`);

    const openingTree = buildOpeningTree(buildRepertoireLineInputs(repertoire!));
    assert.equal(openingTree.nodeCount > 0, true, `runtime_trainable_tree_empty:${opening.openingId}`);

    const rootNodes = openingTree.nodesByFen4[startFen4] ?? [];
    assert.equal(rootNodes.length > 0, true, `runtime_trainable_root_missing:${opening.openingId}`);
    assert.equal(rootNodes.some((node) => node.continuations.length > 0), true, `runtime_trainable_root_continuation_missing:${opening.openingId}`);

    assert.equal(opening.runtimeAvailable, true, `runtime_opening_not_available:${opening.openingId}`);
    assert.equal(opening.contentStatus, "approved", `runtime_opening_content_status_mismatch:${opening.openingId}`);
  }
}

testRuntime21OpeningTrainability();
console.log("runtime21OpeningTrainability ok");
