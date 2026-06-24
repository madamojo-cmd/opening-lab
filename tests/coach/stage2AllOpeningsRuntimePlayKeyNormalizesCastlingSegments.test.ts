import assert from "node:assert/strict";

import { STAGE2_RUNTIME_TRAINABLE_REPERTOIRE_LINES } from "../../lib/blundr/openings/stage2RuntimeTrainableRepertoires.generated";
import { normalizeRuntimePlayKey } from "../../lib/blundr/runtime/uciNormalization";

export function testStage2AllOpeningsRuntimePlayKeyNormalizesCastlingSegments(): void {
  assert.equal(normalizeRuntimePlayKey("e2e4,e7e5,e1h1"), "e2e4,e7e5,e1g1");
  assert.equal(normalizeRuntimePlayKey("e2e4,e7e5,e1a1"), "e2e4,e7e5,e1c1");
  assert.equal(normalizeRuntimePlayKey("d2d4,d7d5,e8h8"), "d2d4,d7d5,e8g8");
  assert.equal(normalizeRuntimePlayKey("d2d4,d7d5,e8a8"), "d2d4,d7d5,e8c8");

  for (const [openingId, lines] of Object.entries(STAGE2_RUNTIME_TRAINABLE_REPERTOIRE_LINES)) {
    for (const line of lines) {
      assert.equal(line.playKey, line.playSequenceUci.join(","), `runtime_play_key_sequence_mismatch:${openingId}`);
      assert.equal(normalizeRuntimePlayKey(line.playKey), line.playKey, `runtime_play_key_not_normalized:${openingId}`);
    }
  }
}

testStage2AllOpeningsRuntimePlayKeyNormalizesCastlingSegments();
console.log("stage2AllOpeningsRuntimePlayKeyNormalizesCastlingSegments ok");

