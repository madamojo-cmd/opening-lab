import assert from "node:assert/strict";
import { Chess } from "chess.js";

import {
  isLegalFen,
  validateDailyCardFen,
  validateFen,
  validateFenHasKings,
  validateFenPieceCounts,
  validateFenSideToMove,
} from "../validation/dailyFenValidation";
import { makeValidRecallCard } from "./dailyValidationFixtures";

export function testDailyFenValidation(): void {
  const startingFen = new Chess().fen();

  assert.ok(validateFen(startingFen).valid);
  assert.ok(isLegalFen(startingFen));
  assert.ok(validateFenHasKings(startingFen).valid);
  assert.ok(validateFenPieceCounts(startingFen).valid);

  assert.ok(!validateFen("bad fen").valid);
  assert.ok(!validateFen("8/8/8/8/8/8/8/8 w - - 0 1").valid);

  const sideMismatch = validateFenSideToMove(startingFen, "b");
  assert.ok(!sideMismatch.valid);
  assert.ok(sideMismatch.issues.some((issue) => issue.code === "side_to_move_mismatch"));

  const recallCard = makeValidRecallCard();
  assert.ok(validateDailyCardFen(recallCard).valid);
}

testDailyFenValidation();
console.log("dailyFenValidation ok");

