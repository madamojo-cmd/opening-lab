import assert from "node:assert/strict";

import {
  STAGE2_RUNTIME_TRAINABLE_REPERTOIRES as MONOLITH_RUNTIME_TRAINABLE_REPERTOIRES,
  getStage2RuntimeOpeningIdentityLines as getMonolithRuntimeOpeningIdentityLines,
  selectRuntimeWeightedOpeningSelection as selectMonolithRuntimeWeightedOpeningSelection,
  selectRuntimeWeightedTrainingLineSelection as selectMonolithRuntimeWeightedTrainingLineSelection,
} from "../../lib/blundr/openings/runtimeTrainableRepertoires";
import { STAGE2_RUNTIME_OPENING_IDS } from "../../lib/blundr/openings/openingIdentity";
import {
  buildRuntimeOpeningIdentityLines,
  loadStage2RuntimeTrainableRepertoires,
  selectRuntimeWeightedOpeningSelection as selectSplitRuntimeWeightedOpeningSelection,
  selectRuntimeWeightedTrainingLineSelection as selectSplitRuntimeWeightedTrainingLineSelection,
} from "../../lib/blundr/openings/runtimeLineBodyLoader";

function summarizeSelectionsBySeed(seed: string) {
  return {
    monolith: selectMonolithRuntimeWeightedOpeningSelection(seed),
    split: selectSplitRuntimeWeightedOpeningSelection(seed),
  };
}

void (async () => {
  const splitRuntimeRepertoires = await loadStage2RuntimeTrainableRepertoires();

  assert.equal(
    splitRuntimeRepertoires.length,
    MONOLITH_RUNTIME_TRAINABLE_REPERTOIRES.length,
    "runtime_repertoire_count_mismatch",
  );
  assert.deepEqual(
    splitRuntimeRepertoires.map((entry) => entry.id),
    MONOLITH_RUNTIME_TRAINABLE_REPERTOIRES.map((entry) => entry.id),
    "runtime_repertoire_order_mismatch",
  );
  assert.deepEqual(
    splitRuntimeRepertoires.map((entry) => entry.id),
    STAGE2_RUNTIME_OPENING_IDS,
    "runtime_opening_id_list_mismatch",
  );

  for (const openingId of STAGE2_RUNTIME_OPENING_IDS) {
    const monolithRepertoire = MONOLITH_RUNTIME_TRAINABLE_REPERTOIRES.find((entry) => entry.id === openingId);
    const splitRepertoire = splitRuntimeRepertoires.find((entry) => entry.id === openingId);

    assert.ok(monolithRepertoire, `missing_monolith_repertoire:${openingId}`);
    assert.ok(splitRepertoire, `missing_split_repertoire:${openingId}`);

    assert.deepEqual(splitRepertoire, monolithRepertoire, `runtime_repertoire_mismatch:${openingId}`);

    const monolithIdentityLines = getMonolithRuntimeOpeningIdentityLines(openingId);
    const splitIdentityLines = buildRuntimeOpeningIdentityLines(splitRepertoire);
    assert.deepEqual(splitIdentityLines, monolithIdentityLines, `runtime_identity_line_mismatch:${openingId}`);

    const lineSelectionSeeds = [`stage2-parity:${openingId}`, `stage2-parity:${openingId}:alt`];
    for (const seed of lineSelectionSeeds) {
      const monolithSelection = selectMonolithRuntimeWeightedTrainingLineSelection({
        openingId,
        recentLineKeys: seed.endsWith(":alt") ? ["repeat-a", "repeat-a"] : [],
        seed,
        repertoire: monolithRepertoire,
      });
      const splitSelection = selectSplitRuntimeWeightedTrainingLineSelection({
        openingId,
        recentLineKeys: seed.endsWith(":alt") ? ["repeat-a", "repeat-a"] : [],
        seed,
        repertoire: splitRepertoire,
      });

      assert.deepEqual(splitSelection, monolithSelection, `runtime_line_selection_mismatch:${openingId}:${seed}`);
    }
  }

  for (const seed of ["stage2-runtime-weighted-opening-selection-v1", "stage2-parity:opening-a", "stage2-parity:opening-b"]) {
    const selections = summarizeSelectionsBySeed(seed);
    assert.deepEqual(selections.split, selections.monolith, `runtime_opening_selection_mismatch:${seed}`);
  }

  console.log("stage2RuntimeLineBodyLoaderParity ok");
})();
