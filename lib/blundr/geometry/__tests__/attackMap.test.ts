import assert from "node:assert/strict";

import { attackersTo, getAttackedSquares, getPieceAttacks, getXrayAttackersTo } from "../attackMap";
import { parseFenBoard } from "../fenBoardParser";

export function testAttackMap(): void {
  const italian = "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3";
  const board = parseFenBoard(italian);
  assert.equal(getPieceAttacks(board, "c4", { directOnly: true }).includes("f7"), true);
  assert.equal(attackersTo(board, "f7", "white").some((piece) => piece.square === "c4"), true);
  assert.equal(getAttackedSquares(board, "white").includes("f7"), true);

  const blocked = parseFenBoard("rnbqkbnr/pppppppp/4P3/8/2B5/8/PPPPPPPP/RNBQK1NR w KQkq - 0 1");
  assert.equal(getPieceAttacks(blocked, "c4", { directOnly: true }).includes("f7"), false);
  assert.equal(Array.isArray(getXrayAttackersTo(blocked, "f7", "white")), true);
}
