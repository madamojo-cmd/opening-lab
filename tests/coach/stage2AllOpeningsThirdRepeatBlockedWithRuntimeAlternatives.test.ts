import assert from "node:assert/strict";

import { STAGE2_RUNTIME_OPENING_IDS } from "../../lib/blundr/openings/openingIdentity";
import { getStage2RuntimeTrainableRepertoire, selectRuntimeWeightedTrainingLineSelection } from "../../lib/blundr/openings/runtimeTrainableRepertoires";

export function testStage2AllOpeningsThirdRepeatBlockedWithRuntimeAlternatives(): void {
  for (const openingId of STAGE2_RUNTIME_OPENING_IDS) {
    const repertoire = getStage2RuntimeTrainableRepertoire(openingId);
    assert.ok(repertoire, `runtime_repertoire_missing:${openingId}`);

    const baseline = selectRuntimeWeightedTrainingLineSelection({
      openingId,
      repertoire,
      seed: `stage2-repeat-baseline:${openingId}`,
    });

    assert.ok(baseline);
    assert.equal(baseline?.eligibleCount > 1, true, `runtime_repeat_pool_too_small:${openingId}`);

    const blockedRepeat = selectRuntimeWeightedTrainingLineSelection({
      openingId,
      repertoire,
      seed: `stage2-repeat-blocked:${openingId}`,
      recentLineKeys: [baseline!.selectedLineKey, baseline!.selectedLineKey],
    });

    assert.ok(blockedRepeat, `runtime_repeat_selection_missing:${openingId}`);
    assert.equal(blockedRepeat?.repeatUnavoidable, false, `runtime_repeat_unavoidable_with_alternatives:${openingId}`);
    assert.equal(blockedRepeat?.variationReason, "third_consecutive_repeat_excluded", `runtime_repeat_reason_mismatch:${openingId}`);
    assert.equal(blockedRepeat?.blockedThirdRepeatLineKeys.includes(baseline!.selectedLineKey), true, `runtime_repeat_block_missing:${openingId}`);
    assert.notEqual(blockedRepeat?.selectedLineKey, baseline!.selectedLineKey, `runtime_repeat_allowed_same_line:${openingId}`);
  }
}

testStage2AllOpeningsThirdRepeatBlockedWithRuntimeAlternatives();
console.log("stage2AllOpeningsThirdRepeatBlockedWithRuntimeAlternatives ok");

