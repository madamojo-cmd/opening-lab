import assert from "node:assert/strict";

import { applyMove, getLegalMoves, isCastlingMove, isLegalMove, sanToUci } from "../legalMoveUtils";

export function testLegalMoveUtils(): void {
  const start = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  assert.equal(isLegalMove(start, "e2e4"), true);
  assert.equal(isLegalMove(start, "e2e5"), false);
  assert.equal(Boolean(applyMove(start, "e2e4")), true);
  assert.equal(sanToUci(start, "e4"), "e2e4");
  assert.equal(getLegalMoves(start).some((move) => move.san === "Nf3"), true);
  assert.equal(isCastlingMove("O-O"), true);
  assert.equal(isCastlingMove("e1g1"), true);
}
