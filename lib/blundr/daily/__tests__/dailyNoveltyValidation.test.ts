import assert from "node:assert/strict";

import { makeFormationKey, detectDuplicateFenKeys, detectDuplicateNoveltyKeys, summarizeNoveltyCoverage, validateNoveltyKeys } from "../validation/dailyNoveltyValidation";
import { makeSampleDeckCards, makeValidMiniGameCards, warmMiniGameCacheForContext } from "./dailyValidationFixtures";

export async function testDailyNoveltyValidation(): Promise<void> {
  await warmMiniGameCacheForContext();
  const miniGameCard = makeValidMiniGameCards()[0]!;
  const noveltyKey = miniGameCard.miniGame.noveltyKey;
  const formationHash = miniGameCard.miniGame.formationHash;
  const duplicateItems = [
    {
      id: miniGameCard.id,
      kind: miniGameCard.kind,
      difficulty: miniGameCard.difficulty,
      conceptIds: miniGameCard.conceptIds,
      primaryConceptId: miniGameCard.primaryConceptId,
      noveltyKey,
      formationHash,
      fen: miniGameCard.fen,
    },
    {
      id: `${miniGameCard.id}:copy`,
      kind: miniGameCard.kind,
      difficulty: miniGameCard.difficulty,
      conceptIds: miniGameCard.conceptIds,
      primaryConceptId: miniGameCard.primaryConceptId,
      noveltyKey,
      formationHash,
      fen: miniGameCard.fen,
    },
  ];

  const duplicateFenKeys = detectDuplicateFenKeys(duplicateItems);
  assert.equal(Object.keys(duplicateFenKeys).length, 1);

  const duplicateNoveltyKeys = detectDuplicateNoveltyKeys(duplicateItems);
  assert.equal(Object.keys(duplicateNoveltyKeys).length, 1);

  const missingNovelty = validateNoveltyKeys([
    {
      id: miniGameCard.id,
      kind: miniGameCard.kind,
      difficulty: miniGameCard.difficulty,
      conceptIds: miniGameCard.conceptIds,
      primaryConceptId: miniGameCard.primaryConceptId,
      noveltyKey,
      formationHash,
      fen: miniGameCard.fen,
    },
    {
      id: `${miniGameCard.id}:missing`,
      kind: miniGameCard.kind,
      difficulty: miniGameCard.difficulty,
      conceptIds: miniGameCard.conceptIds,
      primaryConceptId: miniGameCard.primaryConceptId,
      noveltyKey: "",
      formationHash: "",
      fen: miniGameCard.fen,
    },
  ]);
  assert.ok(missingNovelty.issues.some((issue) => issue.code === "missing_novelty_key"));
  assert.ok(missingNovelty.valid);

  const uniqueCoverage = validateNoveltyKeys(makeSampleDeckCards());
  assert.ok(uniqueCoverage.valid);

  const formationKey = makeFormationKey(miniGameCard);
  assert.ok(formationKey.length > 0);

  const summary = summarizeNoveltyCoverage(makeSampleDeckCards());
  assert.ok(summary.some((bucket) => bucket.key === "unique_novelty"));
}

void testDailyNoveltyValidation().then(() => console.log("dailyNoveltyValidation ok"));
