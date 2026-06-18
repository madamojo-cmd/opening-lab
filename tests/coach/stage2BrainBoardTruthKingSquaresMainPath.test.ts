import assert from "node:assert/strict";

import { analyzeBlundrPosition } from "../../lib/blundr/brain/analyzeBlundrPosition";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";

export function testStage2BrainBoardTruthKingSquaresMainPath(): void {
  const frame = buildCurrentInstructionFrame({
    kind: "guided_move",
    fenBefore: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    ply: 2,
    sideToMove: "white",
    target: {
      uci: "g1f3",
      san: "Nf3",
      pieceType: "n",
      from: "g1",
      to: "f3",
      flags: {
        isCapture: false,
        isCheck: false,
        isCheckmate: false,
        isCastle: false,
        isPromotion: false,
        isEnPassant: false,
      },
    } as any,
    mode: "guided",
    source: "lesson_line",
  });

  const analysis = analyzeBlundrPosition({
    fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    currentInstructionFrame: frame,
    frameKey: "test-frame",
    trainingMode: "restricted",
    isUserTurn: true,
    debugEnabled: true,
  } as any);

  assert.equal((analysis.boardTruth as any)?.kingSquares?.white, "e1");
  assert.equal((analysis.boardTruth as any)?.kingSquares?.black, "e8");
}

testStage2BrainBoardTruthKingSquaresMainPath();
console.log("stage2BrainBoardTruthKingSquaresMainPath ok");
