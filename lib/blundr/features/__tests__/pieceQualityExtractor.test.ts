import assert from "node:assert/strict";

import { parseFenBoard } from "../../geometry/fenBoardParser";
import { extractPieceQuality } from "../pieceQualityExtractor";

export function testPieceQualityExtractor(): void {
  const italian = extractPieceQuality(parseFenBoard("r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3"));
  assert.equal(italian.activeBishops.some((bishop) => bishop.square === "c4" && bishop.targets.includes("f7")), true);
  const start = extractPieceQuality(parseFenBoard("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"));
  assert.equal(start.undevelopedPieces.length >= 8, true);
}
