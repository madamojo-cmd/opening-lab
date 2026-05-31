import assert from "node:assert/strict";
import { Chess } from "chess.js";

import { resolveOpeningFamilyPlanFallback } from "../openingFamilyPlanFallback";

export function testOpeningFamilyPlanFallback(): void {
  const game = new Chess();
  game.move("e4");
  game.move("h6");
  const fallback = resolveOpeningFamilyPlanFallback({
    fen: game.fen(),
    openingId: "generic",
    lineId: "generic:plan",
    userColor: "w",
  });
  assert.equal(Boolean(fallback.continuation?.uci), true);
  assert.equal(Boolean(fallback.planType), true);
  assert.notEqual(fallback.reason, "no_concrete_plan_move");
}
