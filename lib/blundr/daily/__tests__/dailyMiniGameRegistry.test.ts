import assert from "node:assert/strict";

import { DAILY_MINI_GAME_REGISTRY, getDailyMiniGameDefinition } from "../miniGames/dailyMiniGameRegistry";

export function testDailyMiniGameRegistry(): void {
  assert.equal(DAILY_MINI_GAME_REGISTRY.length, 3);
  assert.deepEqual(DAILY_MINI_GAME_REGISTRY.map((definition) => definition.id), ["king_race", "knight_gymnasium", "pawn_wars"]);

  for (const definition of DAILY_MINI_GAME_REGISTRY) {
    const lookup = getDailyMiniGameDefinition(definition.id);
    assert.ok(lookup);
    assert.equal(lookup?.id, definition.id);
    assert.equal(typeof lookup?.generate, "function");
    assert.equal(typeof lookup?.scoreAttempt, "function");
  }

  assert.equal(getDailyMiniGameDefinition("king_race")?.title, "King Race");
}

testDailyMiniGameRegistry();
console.log("dailyMiniGameRegistry ok");

