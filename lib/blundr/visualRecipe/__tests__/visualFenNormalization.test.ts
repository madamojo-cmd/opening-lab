import assert from "node:assert/strict";

import { normalizeVisualFen, visualFenMatches } from "../../visual/normalizeVisualFen";

export function testVisualFenNormalization(): void {
  assert.equal(normalizeVisualFen("8/8/8/8/8/8/8/4K3 w - - 0 1"), "8/8/8/8/8/8/8/4K3 w - -");
  assert.equal(visualFenMatches("8/8/8/8/8/8/8/4K3 w - - 0 1", "8/8/8/8/8/8/8/4K3 w - - 5 9"), true);
  assert.equal(visualFenMatches("8/8/8/8/8/8/8/4K3 w - -", "8/8/8/8/8/8/8/4K3 b - -"), false);
}
