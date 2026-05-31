import assert from "node:assert/strict";

import { parseFenBoard } from "../../geometry/fenBoardParser";
import { extractImbalances } from "../imbalanceExtractor";
import { extractKingSafety } from "../kingSafetyExtractor";
import { extractPawnStructure } from "../pawnStructureExtractor";
import { extractPieceQuality } from "../pieceQualityExtractor";

export function testImbalanceExtractor(): void {
  const board = parseFenBoard("8/8/8/8/2B5/8/8/4K3 w - - 0 1");
  const pawnStructure = extractPawnStructure(board);
  const kingSafety = extractKingSafety(board);
  const pieceQuality = extractPieceQuality(board);
  const imbalances = extractImbalances({ board, pawnStructure, kingSafety, pieceQuality });
  assert.equal(imbalances.materialBalance > 0, true);
  assert.equal(Array.isArray(imbalances.centralControl.white), true);
}
