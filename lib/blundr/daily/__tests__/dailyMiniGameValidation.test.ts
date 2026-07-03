import assert from "node:assert/strict";

import { validateGeneratedMiniGames, validateMiniGameCard, validateMiniGameRegistry } from "../validation/dailyMiniGameValidation";
import { makeMiniGameContext, makeValidMiniGameCards } from "./dailyValidationFixtures";

export function testDailyMiniGameValidation(): void {
  assert.ok(validateMiniGameRegistry().valid);

  const cards = makeValidMiniGameCards();
  assert.equal(cards.length, 3);
  assert.ok(validateMiniGameCard(cards[0]!).valid);
  assert.ok(validateMiniGameCard(cards[1]!).valid);
  assert.ok(validateMiniGameCard(cards[2]!).valid);

  const missingNoveltyKey = validateMiniGameCard({
    ...cards[0]!,
    miniGame: {
      ...cards[0]!.miniGame,
      noveltyKey: "",
    },
  });
  assert.ok(missingNoveltyKey.issues.some((issue) => issue.code === "missing_novelty_key"));
  assert.ok(missingNoveltyKey.valid);

  const invalidFen = validateMiniGameCard({
    ...cards[0]!,
    miniGame: {
      ...cards[0]!.miniGame,
      startFen: "bad fen",
    },
  });
  assert.ok(!invalidFen.valid);
  assert.ok(invalidFen.issues.some((issue) => issue.category === "fen"));

  assert.ok(validateGeneratedMiniGames(makeMiniGameContext()).valid);
}

testDailyMiniGameValidation();
console.log("dailyMiniGameValidation ok");
