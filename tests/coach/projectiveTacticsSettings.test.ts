import assert from "node:assert/strict";

import { resolveProjectiveTacticDisplay, type ProjectiveTacticVisual } from "../../lib/blundr/projectiveTactics";

const visual: ProjectiveTacticVisual = {
  id: "settings-test",
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
  durationMs: 10000,
  fadeMs: 600,
  revealRisk: "low",
  confidence: "high",
};

const both = resolveProjectiveTacticDisplay({ enabled: true, viewMode: "assisted", visuals: [visual], showLines: true, showLabels: true });
assert.equal(both.shouldRender, true);
assert.equal(both.showLines, true);
assert.equal(both.showLabels, true);

const linesOnly = resolveProjectiveTacticDisplay({ enabled: true, viewMode: "assisted", visuals: [visual], showLines: true, showLabels: false });
assert.equal(linesOnly.shouldRender, true);
assert.equal(linesOnly.showLines, true);
assert.equal(linesOnly.showLabels, false);

const labelsOnly = resolveProjectiveTacticDisplay({ enabled: true, viewMode: "assisted", visuals: [visual], showLines: false, showLabels: true });
assert.equal(labelsOnly.shouldRender, true);
assert.equal(labelsOnly.showLines, false);
assert.equal(labelsOnly.showLabels, true);

const neither = resolveProjectiveTacticDisplay({ enabled: true, viewMode: "assisted", visuals: [visual], showLines: false, showLabels: false });
assert.equal(neither.shouldRender, false);

const flagOff = resolveProjectiveTacticDisplay({ enabled: false, viewMode: "assisted", visuals: [visual], showLines: true, showLabels: true });
assert.equal(flagOff.shouldRender, false);

const plain = resolveProjectiveTacticDisplay({ enabled: true, viewMode: "plain", visuals: [visual], showLines: true, showLabels: true });
assert.equal(plain.shouldRender, false);

console.log("projectiveTacticsSettings ok");
