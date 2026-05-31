import assert from "node:assert/strict";
import { chooseHintLevel } from "../coachHintEngine";

function ctx(partial: Record<string, unknown> = {}) {
  return {
    revealState: "hidden",
    wrongAttempts: 0,
    hintUsed: false,
    elapsedMs: 5000,
    answerShown: false,
    ...partial,
  } as any;
}

export function testCoachHintEngine(): void {
  assert.equal(chooseHintLevel(ctx(), 0), "soft_hint");
  assert.equal(chooseHintLevel(ctx({ wrongAttempts: 1 }), 0), "strong_hint");
  assert.equal(chooseHintLevel(ctx({ hintUsed: true }), 2), "strong_hint");
  assert.equal(chooseHintLevel(ctx({ answerShown: true }), 0), "answer");
}
