import assert from "node:assert/strict";
import { adaptMaiaSignals } from "../maiaSignalAdapter";

export function testMaiaSignalAdapter(): void {
  const adapted = adaptMaiaSignals({
    raw: { move_probs: { e2e4: 20, d2d4: 10, g1f3: 5 }, win_prob: 0.54 },
    userElo: 1500,
    opponentElo: 1500,
  });
  assert.equal(adapted.status, "available");
  assert.equal(Math.round(Object.values(adapted.moveProbabilities).reduce((s, v) => s + v, 0) * 1000), 1000);
  assert.equal(adapted.topMoves[0]?.moveUci, "e2e4");
  assert.equal(adapted.entropy > 0, true);

  const unavailable = adaptMaiaSignals({ raw: null, userElo: 1500, opponentElo: 1500 });
  assert.equal(unavailable.status, "unavailable");
}
