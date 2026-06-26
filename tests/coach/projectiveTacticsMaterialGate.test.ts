import assert from "node:assert/strict";

import { Chess } from "chess.js";

import {
  detectProjectiveTactics,
  evaluateCaptureProfitability,
  evaluateProjectiveTacticMaterialGate,
  filterProjectiveTacticVisualForMaterialGate,
  getAttackersToSquare,
  getPieceValue,
  isSquareDefendedBy,
  type ProjectiveTacticVisual,
} from "../../lib/blundr/projectiveTactics";

function visual(input: {
  kind: "fork" | "knight_fork" | "pin";
  sourceSquare: ProjectiveTacticVisual["sourceSquare"];
  sourcePiece: string;
  targetPieces: ProjectiveTacticVisual["targetPieces"];
  lineShape?: "straight" | "knight_l";
  lineSegments?: ProjectiveTacticVisual["lineSegments"];
}): ProjectiveTacticVisual {
  const lineShape = input.lineShape ?? (input.kind === "knight_fork" ? "knight_l" : "straight");
  return {
    id: `test:${input.kind}:${input.sourceSquare}`,
    kind: input.kind,
    label: input.kind,
    owner: "learner",
    sourceSquare: input.sourceSquare,
    sourcePiece: input.sourcePiece,
    targetSquares: input.targetPieces.map((target) => target.square),
    targetPieces: input.targetPieces,
    lineSegments: input.lineSegments ?? input.targetPieces.map((target, index) => ({
      from: input.sourceSquare,
      to: target.square,
      shape: lineShape,
      bendPreference: lineShape === "knight_l"
        ? (index % 2 === 0 ? "vertical_first" : "horizontal_first")
        : undefined,
    })),
    tagSquare: input.sourceSquare,
    createdByMoveUci: "d1d4",
    createdAfterFen: "test",
    durationMs: 10000,
    fadeMs: 600,
    revealRisk: "low",
    confidence: "high",
  };
}

assert.equal(getPieceValue("p"), 1);
assert.equal(getPieceValue("q"), 9);

const protectedPawnFen = "k7/8/5p2/4p2Q/8/8/8/7K b - - 0 1";
const protectedPawnCapture = evaluateCaptureProfitability({
  fen: protectedPawnFen,
  sourceSquare: "h5",
  target: { square: "e5", piece: "p", color: "b" },
  movedColor: "w",
});
assert.equal(protectedPawnCapture.allowed, false);
assert.equal(protectedPawnCapture.reason, "target_protected_bad_trade");
assert.equal(protectedPawnCapture.netGain, -8);

const protectedPawnGame = new Chess(protectedPawnFen);
assert.equal(isSquareDefendedBy(protectedPawnGame, "e5", "b"), true);
assert.deepEqual(getAttackersToSquare(protectedPawnGame, "e5", "b").map((attacker) => attacker.square), ["f6"]);
assert.equal(evaluateProjectiveTacticMaterialGate({
  fen: protectedPawnFen,
  movedColor: "w",
  visual: visual({
    kind: "fork",
    sourceSquare: "h5",
    sourcePiece: "q",
    targetPieces: [{ square: "e5", piece: "p", color: "b" }],
  }),
}).allowed, false);

const queenRookProtectedPawnFen = "k2r4/8/8/7p/3Q2p1/8/8/7K b - - 0 1";
const queenFork = visual({
  kind: "fork",
  sourceSquare: "d4",
  sourcePiece: "q",
  targetPieces: [
    { square: "d8", piece: "r", color: "b" },
    { square: "g4", piece: "p", color: "b" },
  ],
});
const queenForkGate = filterProjectiveTacticVisualForMaterialGate({
  fen: queenRookProtectedPawnFen,
  movedColor: "w",
  visual: queenFork,
});
assert.equal(queenForkGate.visual, null);
assert.equal(queenForkGate.decision.allowed, false);
assert.equal(detectProjectiveTactics({
  fen: queenRookProtectedPawnFen,
  lastMoveUci: "d1d4",
  learnerColor: "w",
  movedColor: "w",
}).visuals.length, 0);

const knightFork = detectProjectiveTactics({
  fen: "3rk2q/5N2/8/8/8/8/8/K7 b - - 0 1",
  lastMoveUci: "h6f7",
  learnerColor: "w",
  movedColor: "w",
});
assert.equal(knightFork.visuals.length, 1);
assert.equal(knightFork.visuals[0].kind, "knight_fork");
assert.deepEqual(new Set(knightFork.visuals[0].targetPieces.map((target) => target.piece)), new Set(["r", "q"]));
assert.equal(knightFork.visuals[0].lineSegments.every((segment) => segment.shape === "knight_l"), true);

const checkFork = detectProjectiveTactics({
  fen: "3r3k/5N2/8/8/8/8/8/K7 b - - 0 1",
  lastMoveUci: "h6f7",
  learnerColor: "w",
  movedColor: "w",
});
assert.equal(checkFork.visuals.length, 1);
assert.equal(checkFork.visuals[0].kind, "knight_fork");
assert.deepEqual(checkFork.visuals[0].targetPieces.map((target) => target.piece).sort(), ["k", "r"]);

const badCheckFork = detectProjectiveTactics({
  fen: "7k/5Npp/8/8/8/8/8/K7 b - - 0 1",
  lastMoveUci: "h6f7",
  learnerColor: "w",
  movedColor: "w",
});
assert.equal(badCheckFork.visuals.length, 0);

const materialPin = detectProjectiveTactics({
  fen: "7k/3q4/2n5/1B6/8/8/8/4K3 b - - 0 1",
  lastMoveUci: "a4b5",
  learnerColor: "w",
  movedColor: "w",
});
assert.equal(materialPin.visuals.length, 1);
assert.equal(materialPin.visuals[0].kind, "pin");
assert.equal(materialPin.visuals[0].targetPieces[0].piece, "n");

const pawnPin = detectProjectiveTactics({
  fen: "7k/3q4/2p5/1B6/8/8/8/4K3 b - - 0 1",
  lastMoveUci: "a4b5",
  learnerColor: "w",
  movedColor: "w",
});
assert.equal(pawnPin.visuals.length, 0);

const immutabilityGame = new Chess("3rk2q/5N2/8/8/8/8/8/K7 b - - 0 1");
const beforeFen = immutabilityGame.fen();
const beforeLegalMoves = immutabilityGame.moves().sort();
detectProjectiveTactics({
  fen: beforeFen,
  lastMoveUci: "h6f7",
  learnerColor: "w",
  movedColor: "w",
});
assert.equal(immutabilityGame.fen(), beforeFen);
assert.deepEqual(immutabilityGame.moves().sort(), beforeLegalMoves);

console.log("projectiveTacticsMaterialGate ok");
