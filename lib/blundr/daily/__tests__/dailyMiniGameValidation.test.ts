import assert from "node:assert/strict";

import { validateGeneratedMiniGames, validateMiniGameCard, validateMiniGameRegistry } from "../validation/dailyMiniGameValidation";
import { makeMiniGameContext, makeValidMiniGameCards, warmMiniGameCacheForContext } from "./dailyValidationFixtures";

export async function testDailyMiniGameValidation(): Promise<void> {
  await warmMiniGameCacheForContext();
  assert.ok(validateMiniGameRegistry().valid);

  const cards = makeValidMiniGameCards();
  assert.equal(cards.length, 8);
  for (const card of cards) {
    assert.ok(validateMiniGameCard(card).valid);
  }

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

void testDailyMiniGameValidation().then(() => console.log("dailyMiniGameValidation ok"));
