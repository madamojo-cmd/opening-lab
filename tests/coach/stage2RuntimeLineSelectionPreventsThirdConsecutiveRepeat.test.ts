import assert from "node:assert/strict";

import { selectRuntimeWeightedTrainingLineSelection } from "../../lib/blundr/openings/runtimeTrainableRepertoires";

export function testStage2RuntimeLineSelectionPreventsThirdConsecutiveRepeat(): void {
  const repertoire = {
    id: "session-variation-open",
    name: "Session Variation Open",
    color: "white",
    description: "Synthetic repertoire for third-repeat coverage.",
    lines: [
      ["e4", "e5", "Nf3", "Nc6"],
      ["d4", "d5", "c4", "e6"],
      ["c4", "e5", "Nc3", "Nf6"],
    ],
  } as const;

  const firstRun = selectRuntimeWeightedTrainingLineSelection({
    openingId: repertoire.id,
    repertoire: repertoire as any,
    recentLineKeys: [],
    seed: "stage2-runtime-line-memory",
  });

  assert.ok(firstRun);
  assert.equal(firstRun?.eligibleCount, 3);

  const lineA = firstRun!.lineWeightsSummary.find((summary) => summary.lineIndex === 0)?.lineKey ?? null;
  const lineB = firstRun!.lineWeightsSummary.find((summary) => summary.lineIndex === 1)?.lineKey ?? null;
  assert.ok(lineA && lineB);

  const allowedRepeat = selectRuntimeWeightedTrainingLineSelection({
    openingId: repertoire.id,
    repertoire: repertoire as any,
    recentLineKeys: [lineA, lineB],
    seed: "H",
  });

  assert.ok(allowedRepeat);
  assert.equal(allowedRepeat?.recentLineKeys.length, 2);
  assert.equal(allowedRepeat?.lineWeightsSummary.length, 3);
  assert.equal(allowedRepeat?.selectedLineKey, lineA);
  assert.equal(allowedRepeat?.blockedThirdRepeatLineKeys.length, 0);
  assert.equal(allowedRepeat?.variationReason, "fresh_line_selection");
  assert.equal(allowedRepeat?.repeatUnavoidable, false);

  const blockedThirdRepeat = selectRuntimeWeightedTrainingLineSelection({
    openingId: repertoire.id,
    repertoire: repertoire as any,
    recentLineKeys: [lineA, lineA],
    seed: "A",
  });

  assert.ok(blockedThirdRepeat);
  assert.equal(blockedThirdRepeat?.selectedLineKey, lineB);
  assert.equal(blockedThirdRepeat?.blockedThirdRepeatLineKeys.length, 1);
  assert.equal(blockedThirdRepeat?.blockedThirdRepeatLineKeys[0], lineA);
  assert.equal(blockedThirdRepeat?.variationReason, "third_consecutive_repeat_excluded");
  assert.equal(blockedThirdRepeat?.repeatUnavoidable, false);

  const onlyLineRepertoire = {
    ...repertoire,
    id: "session-variation-single-open",
    lines: [["e4", "e5", "Nf3", "Nc6"]],
  } as const;
  const onlyLineKey = `${onlyLineRepertoire.id}:0:e2e4,e7e5,g1f3,b8c6`;

  const unavoidableRepeat = selectRuntimeWeightedTrainingLineSelection({
    openingId: onlyLineRepertoire.id,
    repertoire: onlyLineRepertoire as any,
    recentLineKeys: [onlyLineKey, onlyLineKey],
    seed: "3",
  });

  assert.ok(unavoidableRepeat);
  assert.equal(unavoidableRepeat?.selectedLineKey, onlyLineKey);
  assert.equal(unavoidableRepeat?.blockedThirdRepeatLineKeys.length, 1);
  assert.equal(unavoidableRepeat?.variationReason, "repeat_unavoidable_no_alternative");
  assert.equal(unavoidableRepeat?.repeatUnavoidable, true);

  const approvedContentDoesNotAffectEligibility = selectRuntimeWeightedTrainingLineSelection({
    openingId: repertoire.id,
    repertoire: repertoire as any,
    recentLineKeys: [lineA, lineA],
    seed: "A",
  });

  assert.equal(approvedContentDoesNotAffectEligibility?.selectedLineKey, lineB);

  const stagePublicBetaDoesNotAffectEligibility = selectRuntimeWeightedTrainingLineSelection({
    openingId: repertoire.id,
    repertoire: repertoire as any,
    recentLineKeys: [lineA, lineA],
    seed: "A",
    approvedContentAvailable: true,
    openingAvailabilityStatus: "public_ready",
    openingSelectionStage: "public",
  } as any);

  assert.equal(stagePublicBetaDoesNotAffectEligibility?.selectedLineKey, lineB);
}

testStage2RuntimeLineSelectionPreventsThirdConsecutiveRepeat();
console.log("stage2RuntimeLineSelectionPreventsThirdConsecutiveRepeat ok");
