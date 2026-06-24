import assert from "node:assert/strict";

import { STAGE2_RUNTIME_OPENING_IDS } from "../../lib/blundr/openings/openingIdentity";
import { getStage2RuntimeTrainableRepertoire, selectRuntimeWeightedTrainingLineSelection } from "../../lib/blundr/openings/runtimeTrainableRepertoires";

export function testStage2AllOpeningsRuntimeSelectorNotHardcodedToOneLine(): void {
  let colleCount = 0;

  for (const openingId of STAGE2_RUNTIME_OPENING_IDS) {
    const repertoire = getStage2RuntimeTrainableRepertoire(openingId);
    assert.ok(repertoire, `runtime_repertoire_missing:${openingId}`);
    assert.equal((repertoire?.lines.length ?? 0) > 1, true, `runtime_repertoire_collapsed_to_one_line:${openingId}`);

    const selection = selectRuntimeWeightedTrainingLineSelection({
      openingId,
      repertoire,
      seed: `stage2-runtime-selector:${openingId}`,
      recentLineKeys: [],
    });

    assert.ok(selection, `runtime_selection_missing:${openingId}`);
    assert.equal(selection?.eligibleCount > 1, true, `runtime_selection_collapsed_to_one_line:${openingId}`);

    if (openingId === "colle-white") {
      colleCount = selection?.eligibleCount ?? 0;
    }
  }

  assert.equal(colleCount, 5024, "colle_white_must_expose_full_runtime_pool");
}

testStage2AllOpeningsRuntimeSelectorNotHardcodedToOneLine();
console.log("stage2AllOpeningsRuntimeSelectorNotHardcodedToOneLine ok");

