import assert from "node:assert/strict";
import { validateLiveCoachCopy } from "../liveCoachSafety";

export function testLiveCoachSafety(): void {
  assert.equal(validateLiveCoachCopy("The center is tense, improve the bishop.").allowed, true);
  assert.equal(validateLiveCoachCopy("Stockfish says +120 centipawn").allowed, false);
}
