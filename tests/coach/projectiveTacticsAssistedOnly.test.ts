import assert from "node:assert/strict";

import { filterProjectiveTacticsForViewMode, type ProjectiveTacticVisual } from "../../lib/blundr/projectiveTactics";

const baseVisual: ProjectiveTacticVisual = {
  id: "test",
  kind: "fork",
  label: "Fork",
  owner: "learner",
  sourceSquare: "d4",
  sourcePiece: "r",
  targetSquares: ["d8", "h4"],
  targetPieces: [
    { square: "d8", piece: "q", color: "b" },
    { square: "h4", piece: "b", color: "b" },
  ],
  lineSegments: [
    { from: "d4", to: "d8", shape: "straight" },
    { from: "d4", to: "h4", shape: "straight" },
  ],
  tagSquare: "d4",
  durationMs: 5000,
  fadeMs: 600,
  revealRisk: "low",
  confidence: "high",
};

assert.deepEqual(filterProjectiveTacticsForViewMode({ enabled: false, viewMode: "assisted", visuals: [baseVisual] }), []);
assert.equal(filterProjectiveTacticsForViewMode({ enabled: true, viewMode: "assisted", visuals: [baseVisual] }).length, 1);
assert.deepEqual(filterProjectiveTacticsForViewMode({ enabled: true, viewMode: "plain", visuals: [baseVisual] }), []);
assert.deepEqual(filterProjectiveTacticsForViewMode({ enabled: true, viewMode: "freeplay", visuals: [baseVisual] }), []);
assert.deepEqual(filterProjectiveTacticsForViewMode({
  enabled: true,
  viewMode: "assisted",
  visuals: [{ ...baseVisual, confidence: "medium" }],
}), []);

console.log("projectiveTacticsAssistedOnly ok");
