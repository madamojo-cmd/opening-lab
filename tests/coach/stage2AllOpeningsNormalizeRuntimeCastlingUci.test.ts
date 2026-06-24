import assert from "node:assert/strict";

import { STAGE2_RUNTIME_TRAINABLE_REPERTOIRE_LINES } from "../../lib/blundr/openings/stage2RuntimeTrainableRepertoires.generated";
import { normalizeRuntimeCastlingUci, normalizeRuntimePlayKey, normalizeRuntimePlaySequenceUci } from "../../lib/blundr/runtime/uciNormalization";

export function testStage2AllOpeningsNormalizeRuntimeCastlingUci(): void {
  assert.equal(normalizeRuntimeCastlingUci("e1h1"), "e1g1");
  assert.equal(normalizeRuntimeCastlingUci("e1a1"), "e1c1");
  assert.equal(normalizeRuntimeCastlingUci("e8h8"), "e8g8");
  assert.equal(normalizeRuntimeCastlingUci("e8a8"), "e8c8");

  const dirtyPlayKey = "e2e4,e7e5,e1h1,e8a8";
  assert.equal(normalizeRuntimePlayKey(dirtyPlayKey), "e2e4,e7e5,e1g1,e8c8");
  assert.deepEqual(normalizeRuntimePlaySequenceUci(["e2e4", "e1h1", "e8a8"]), ["e2e4", "e1g1", "e8c8"]);

  for (const [openingId, lines] of Object.entries(STAGE2_RUNTIME_TRAINABLE_REPERTOIRE_LINES)) {
    for (const line of lines) {
      assert.equal(line.playKey.includes("e1h1"), false, `dirty_castling_play_key_exposed:${openingId}`);
      assert.equal(line.playKey.includes("e1a1"), false, `dirty_castling_play_key_exposed:${openingId}`);
      assert.equal(line.playKey.includes("e8h8"), false, `dirty_castling_play_key_exposed:${openingId}`);
      assert.equal(line.playKey.includes("e8a8"), false, `dirty_castling_play_key_exposed:${openingId}`);
      assert.equal(line.playSequenceUci.includes("e1h1"), false, `dirty_castling_sequence_exposed:${openingId}`);
      assert.equal(line.playSequenceUci.includes("e1a1"), false, `dirty_castling_sequence_exposed:${openingId}`);
      assert.equal(line.playSequenceUci.includes("e8h8"), false, `dirty_castling_sequence_exposed:${openingId}`);
      assert.equal(line.playSequenceUci.includes("e8a8"), false, `dirty_castling_sequence_exposed:${openingId}`);
    }
  }
}

testStage2AllOpeningsNormalizeRuntimeCastlingUci();
console.log("stage2AllOpeningsNormalizeRuntimeCastlingUci ok");

