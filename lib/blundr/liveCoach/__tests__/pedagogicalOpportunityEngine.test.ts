import assert from "node:assert/strict";
import { rankPedagogicalOpportunities } from "../pedagogicalOpportunityEngine";

export function testPedagogicalOpportunityEngine(): void {
  const scored = rankPedagogicalOpportunities({
    stale: false,
    positionFeatures: { centerState: "tense", kingSafety: "watch_center", leastActivePieces: ["wn@b1"] },
    patternSignals: { transferOpportunity: true },
  } as any, [
    { moveClass: "predictable_human_mistake", moveUci: "a2a4", moveSan: "a4", exactRecommendationAllowed: false, explanationConfidence: 0.8 },
    { moveClass: "hard_to_find_good_move", moveUci: "e2e4", moveSan: "e4", exactRecommendationAllowed: true, explanationConfidence: 0.85 },
  ] as any);
  assert.equal(scored.length > 0, true);
  assert.equal(scored[0]?.opportunity !== undefined, true);
}
