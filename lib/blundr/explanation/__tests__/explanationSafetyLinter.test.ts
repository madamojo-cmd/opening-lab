import assert from "node:assert/strict";

import { lintCoachExplanation } from "../explanationSafetyLinter";

export function testExplanationSafetyLinter(): void {
  assert.equal(lintCoachExplanation({ text: "Stockfish says this is verified_top2." }).allowed, false);
  assert.equal(lintCoachExplanation({ text: "The bishop develops toward the center." }).allowed, true);
  assert.equal(lintCoachExplanation({ text: "Play {moveSan}." }).allowed, false);
}
