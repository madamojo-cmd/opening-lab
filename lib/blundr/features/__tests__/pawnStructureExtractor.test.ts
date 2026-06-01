import assert from "node:assert/strict";

import { parseFenBoard } from "../../geometry/fenBoardParser";
import { extractPawnStructure } from "../pawnStructureExtractor";

export function testPawnStructureExtractor(): void {
  const features = extractPawnStructure(parseFenBoard("8/8/8/8/3P4/2P5/8/4K3 w - - 0 1"));
  assert.equal(features.pawnLevers.some((lever) => lever.supportsBreak === "d4"), true);
  assert.equal(features.pawnIslands.white.length >= 1, true);

  const doubled = extractPawnStructure(parseFenBoard("8/8/8/8/8/2P5/2P5/4K3 w - - 0 1"));
  assert.equal(doubled.doubledPawnFiles.includes("c"), true);
  assert.equal(doubled.isolatedPawns.includes("c2"), true);
}
