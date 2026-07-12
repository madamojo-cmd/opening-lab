import assert from "node:assert/strict";
import test from "node:test";
import {
  MINIGAME_CONTENT_COUNTS,
  loadProductionScenarios,
  selectProductionScenario,
  type ProductionMiniGameId,
} from "../minigameContentLoader";

const ids = Object.keys(MINIGAME_CONTENT_COUNTS) as ProductionMiniGameId[];

test("lazy runtime loader exposes all eight exact pools", async () => {
  for (const id of ids) {
    const pool = await loadProductionScenarios(id);
    assert.equal(pool.length, MINIGAME_CONTENT_COUNTS[id]);
    assert.equal(new Set(pool.map((scenario) => scenario.id)).size, pool.length);
    for (const scenario of pool) {
      assert.equal(scenario.lockedOrientation, true);
      assert.equal(scenario.quality.runtimeReady, true);
      assert.equal("raw" in scenario, false);
    }
  }
});

test("selection is deterministic, difficulty-aware, and avoids recent ids", async () => {
  const first = await selectProductionScenario({ miniGameId: "tactic_shots", selectionKey: "user:session:1" });
  const again = await selectProductionScenario({ miniGameId: "tactic_shots", selectionKey: "user:session:1" });
  assert.equal(first.id, again.id);
  const next = await selectProductionScenario({
    miniGameId: "tactic_shots",
    selectionKey: "user:session:1",
    recentlyPlayedIds: [first.id],
  });
  assert.notEqual(next.id, first.id);
  assert.equal(next.lockedOrientation, true);
});

test("concurrent requests share one resolved pool", async () => {
  const [left, right] = await Promise.all([
    loadProductionScenarios("king_race"),
    loadProductionScenarios("king_race"),
  ]);
  assert.equal(left, right);
});
