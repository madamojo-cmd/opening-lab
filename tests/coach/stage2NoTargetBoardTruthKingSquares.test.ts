import assert from "node:assert/strict";

import { buildBoardTruth } from "../../lib/blundr/brain/providers/boardTruthProvider";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";

export function testStage2NoTargetBoardTruthKingSquares(): void {
  const frame = buildCurrentInstructionFrame({
    kind: "opponent_replying",
    fenBefore: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    ply: 2,
    sideToMove: "white",
    target: null,
    mode: "blocked",
    source: "none",
  });
  const boardTruth = buildBoardTruth({ frame });
  assert.equal(boardTruth.kingSquares.white, "e1");
  assert.equal(boardTruth.kingSquares.black, "e8");
  assert.equal(boardTruth.targetLegal, "not_applicable");
}

testStage2NoTargetBoardTruthKingSquares();
console.log("stage2NoTargetBoardTruthKingSquares ok");
