import assert from "node:assert/strict";
import { selectBestLiveComment } from "../liveCoachCommentRanker";

export function testLiveCoachCommentRanker(): void {
  const selected = selectBestLiveComment([
    { opportunity: "center_decision", confidenceScore: 0.8, pedagogicalValue: 0.6, totalScore: 0.72 },
    { opportunity: "pattern_transfer", confidenceScore: 0.75, pedagogicalValue: 0.9, totalScore: 0.72 },
  ] as any);
  assert.equal(selected?.opportunity, "pattern_transfer");
}
