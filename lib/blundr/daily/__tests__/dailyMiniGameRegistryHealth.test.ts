import assert from "node:assert/strict";

import { buildDailyMiniGameHealthReport } from "../miniGames/dailyMiniGameHealth";

const report = buildDailyMiniGameHealthReport({
  dateKey: "2026-07-06",
  now: "2026-07-06T12:00:00.000Z",
});

assert.equal(report.registeredCount, 8);
assert.deepEqual(report.registeredIds, [
  "king_race",
  "knight_gymnasium",
  "pawn_wars",
  "tactic_shots",
  "key_square_conquest",
  "structure_builder",
  "imbalance_arena",
  "technique_lab",
]);
assert.equal(report.selectableIds.length, 8);
assert.equal(report.standalonePracticeIds.length, 8);
assert.equal(report.errors.length, 0);
assert.equal(report.deckInsertionViability.every((entry) => entry.generated && entry.sessionCardCount === 1 && entry.errors.length === 0), true);

console.log("dailyMiniGameRegistryHealth.test.ts passed");
