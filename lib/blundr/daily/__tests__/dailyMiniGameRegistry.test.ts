import assert from "node:assert/strict";

import { DAILY_MINI_GAME_REGISTRY, getDailyMiniGameDefinition } from "../miniGames/dailyMiniGameRegistry";

export function testDailyMiniGameRegistry(): void {
  assert.deepEqual(DAILY_MINI_GAME_REGISTRY.map((definition) => definition.id), [
    "tactic_shots_deep",
    "knight_gymnasium_deep",
    "king_pawn_lab",
  ]);

  for (const definition of DAILY_MINI_GAME_REGISTRY) {
    const lookup = getDailyMiniGameDefinition(definition.id);
    assert.ok(lookup);
    assert.equal(lookup?.id, definition.id);
    assert.equal(typeof lookup?.generate, "function");
    assert.equal(typeof lookup?.scoreAttempt, "function");
  }

  assert.equal(getDailyMiniGameDefinition("tactic_shots_deep")?.title, "Deep Tactic Shots");
}

testDailyMiniGameRegistry();
console.log("dailyMiniGameRegistry ok");
