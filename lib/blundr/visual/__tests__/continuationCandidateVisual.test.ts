import assert from "node:assert/strict";

import { buildContinuationCandidateVisual } from "../continuationCandidateVisual";

export function testContinuationCandidateVisual(): void {
  const visual = buildContinuationCandidateVisual({
    boardFen: "rnbqkbnr/pp2pppp/8/2pp4/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
    candidateUci: "e4d5",
    candidateSan: "exd5",
  });
  assert.equal(visual.shouldRender, true);
  assert.equal(visual.lines.length, 1);
  assert.equal(visual.lines[0].from, "e4");
  assert.equal(visual.lines[0].to, "d5");

  const blocked = buildContinuationCandidateVisual({
    boardFen: "rnbqkbnr/pp2pppp/8/2pp4/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
    candidateUci: "a2a5",
    candidateSan: "exd5",
  });
  assert.equal(blocked.shouldRender, false);
  assert.equal(blocked.blockedReason, "candidate_not_legal");
}
