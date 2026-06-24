import assert from "node:assert/strict";

import { STAGE2_RUNTIME_OPENING_IDS } from "../../lib/blundr/openings/openingIdentity";
import { getStage2RuntimeTrainableRepertoire, selectRuntimeWeightedTrainingLineSelection } from "../../lib/blundr/openings/runtimeTrainableRepertoires";

export function testStage2AllOpeningsRuntimeSelectorUses12PlyRuntimePool(): void {
  assert.equal(STAGE2_RUNTIME_OPENING_IDS.length, 21, "runtime_opening_count_must_remain_21");

  for (const openingId of STAGE2_RUNTIME_OPENING_IDS) {
    const repertoire = getStage2RuntimeTrainableRepertoire(openingId);
    assert.ok(repertoire, `runtime_repertoire_missing:${openingId}`);

    const selection = selectRuntimeWeightedTrainingLineSelection({
      openingId,
      repertoire,
      seed: `stage2-runtime-pool:${openingId}`,
      recentLineKeys: [],
    });

    assert.ok(selection, `runtime_selection_missing:${openingId}`);
    assert.equal(selection?.eligibleCount, repertoire?.lines.length ?? 0, `runtime_selection_pool_size_mismatch:${openingId}`);
    assert.equal(selection?.selectedPlaySequenceUci.length, 12, `runtime_selected_line_not_12_ply:${openingId}`);
    assert.equal(selection?.lineWeightsSummary.every((entry) => entry.moveCount === 12), true, `runtime_weight_summary_not_12_ply:${openingId}`);
    assert.equal(selection?.lineWeightsSummary.length, repertoire?.lines.length ?? 0, `runtime_weight_summary_count_mismatch:${openingId}`);
  }
}

testStage2AllOpeningsRuntimeSelectorUses12PlyRuntimePool();
console.log("stage2AllOpeningsRuntimeSelectorUses12PlyRuntimePool ok");

