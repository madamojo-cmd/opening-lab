import assert from "node:assert/strict";

import { selectRuntimeWeightedTrainingLineSelection } from "../../lib/blundr/openings/runtimeTrainableRepertoires";

export function testStage2RuntimeLineSelectionAvoidsLastTwoLines(): void {
  const repertoire = {
    id: "session-variation-open",
    name: "Session Variation Open",
    color: "white",
    description: "Synthetic repertoire for anti-repeat coverage.",
    lines: [
      ["e4", "e5", "Nf3", "Nc6"],
      ["d4", "d5", "c4", "e6"],
      ["c4", "e5", "Nc3", "Nf6"],
    ],
  } as const;

  const baseline = selectRuntimeWeightedTrainingLineSelection({
    openingId: repertoire.id,
    repertoire: repertoire as any,
    recentLineKeys: [],
    seed: "stage2-runtime-line-memory",
  });

  assert.ok(baseline);
  assert.equal(baseline?.eligibleCount, 3);
  assert.equal(baseline?.selectedLineKey.length > 0, true);

  const recentLineKeys = baseline!.lineWeightsSummary
    .map((summary) => summary.lineKey)
    .filter((lineKey) => lineKey !== baseline!.selectedLineKey);

  const rerun = selectRuntimeWeightedTrainingLineSelection({
    openingId: repertoire.id,
    repertoire: repertoire as any,
    recentLineKeys,
    seed: "stage2-runtime-line-memory",
  });

  assert.ok(rerun);
  assert.equal(rerun?.eligibleCount, 1);
  assert.equal(rerun?.blockedRecentLineKeys.length, 2);
  assert.equal(rerun?.selectedLineKey, baseline!.lineWeightsSummary.find((summary) => !recentLineKeys.includes(summary.lineKey))?.lineKey);
  assert.equal(rerun?.selectedLineKey !== undefined, true);
  assert.equal(recentLineKeys.includes(rerun!.selectedLineKey), false);
}

testStage2RuntimeLineSelectionAvoidsLastTwoLines();
console.log("stage2RuntimeLineSelectionAvoidsLastTwoLines ok");
