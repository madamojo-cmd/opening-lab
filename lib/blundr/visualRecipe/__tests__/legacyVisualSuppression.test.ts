import assert from "node:assert/strict";

import { filterLegacyMainUiLines, isLegacyUnsupportedTacticalLine } from "../legacyVisualSuppression";

export function testLegacyVisualSuppression(): void {
  assert.equal(isLegacyUnsupportedTacticalLine({ kind: "attack", label: "queen diagonal pressure" }), true);
  assert.equal(isLegacyUnsupportedTacticalLine({ kind: "plan", label: "develop bishop" }), false);

  const filtered = filterLegacyMainUiLines([
    { from: "d1", to: "h5", kind: "attack", label: "queen diagonal attack" },
    { from: "e2", to: "e4", kind: "plan", label: "answer_move" },
    { from: "f1", to: "e2", kind: "defense", label: "file defense" },
  ]);
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].from, "e2");
}
