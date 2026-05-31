import assert from "node:assert/strict";

import { parseFenBoard } from "../../geometry/fenBoardParser";
import { extractTacticalMotifs } from "../tacticalMotifExtractor";

export function testTacticalMotifExtractor(): void {
  const motifs = extractTacticalMotifs(parseFenBoard("8/8/8/8/8/8/8/4K3 w - - 0 1"));
  assert.deepEqual(motifs.verifiedForks, []);
  assert.equal(motifs.blockedMotifs.some((motif) => motif.type === "fork"), true);
}
