import assert from "node:assert/strict";

import { parseFenBoard } from "../fenBoardParser";

export function testFenBoardParser(): void {
  const board = parseFenBoard("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  assert.equal(board.normalizedFen, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -");
  assert.equal(board.pieces.length, 32);
  assert.equal(board.pieceBySquare.e1?.type, "king");
  assert.equal(board.castlingRights, "KQkq");

  const malformed = parseFenBoard("bad fen");
  assert.equal(malformed.malformed, true);
}
