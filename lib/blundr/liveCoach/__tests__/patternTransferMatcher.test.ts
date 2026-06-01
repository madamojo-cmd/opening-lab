import assert from "node:assert/strict";
import { matchPatternTransfer } from "../patternTransferMatcher";

export function testPatternTransferMatcher(): void {
  const result = matchPatternTransfer({
    weakConcepts: ["prepare_center_break"],
    centerState: "tense",
    kingSafety: "watch_center",
    openFiles: ["e"],
    plausiblePawnBreaks: ["d4"],
  });
  assert.equal(result.transferOpportunity, true);
  assert.equal(result.connectedConcepts.some((c) => c.conceptId === "prepare_center_break"), true);
}
