import assert from "node:assert/strict";

import type { Square } from "chess.js";

import {
  buildKnightLShapePath,
  detectProjectiveTactics,
  isKnightMove,
} from "../../lib/blundr/projectiveTactics";

function segmentLengths(points: Array<{ x: number; y: number }>): number[] {
  return [
    Math.abs(points[0].x - points[1].x) + Math.abs(points[0].y - points[1].y),
    Math.abs(points[1].x - points[2].x) + Math.abs(points[1].y - points[2].y),
  ].map((value) => value / 12.5);
}

function assertOrthogonal(points: Array<{ x: number; y: number }>): void {
  assert.equal(points.length, 3);
  assert.equal(points[0].x === points[1].x || points[0].y === points[1].y, true);
  assert.equal(points[1].x === points[2].x || points[1].y === points[2].y, true);
}

function assertKnightPath(from: Square, to: Square, orientation: "white" | "black"): void {
  const points = buildKnightLShapePath({ from, to, orientation });
  assert.ok(points);
  assertOrthogonal(points);
  assert.deepEqual(segmentLengths(points).sort((a, b) => a - b), [1, 2]);
}

assert.equal(isKnightMove("g1", "f3"), true);
assert.equal(isKnightMove("g1", "g3"), false);
assertKnightPath("g1", "f3", "white");
assertKnightPath("b1", "c3", "white");
assertKnightPath("f3", "g1", "black");
assert.equal(buildKnightLShapePath({ from: "g1", to: "g3", orientation: "white" }), null);

const detected = detectProjectiveTactics({
  fen: "3rk2q/5N2/8/8/8/8/8/K7 b - - 0 1",
  lastMoveUci: "h6f7",
  learnerColor: "w",
  movedColor: "w",
});

assert.equal(detected.visuals.length, 1);
assert.equal(detected.visuals[0].kind, "knight_fork");
assert.equal(detected.visuals[0].label, "Knight fork");
assert.equal(detected.visuals[0].targetSquares.length >= 2, true);
assert.equal(detected.visuals[0].confidence, "high");
assert.equal(detected.visuals[0].lineSegments.every((segment) => segment.shape === "knight_l"), true);
assert.equal(detected.visuals[0].lineSegments.some((segment) => segment.shape === "straight"), false);

console.log("projectiveTacticsKnightLShape ok");
