import assert from "node:assert/strict";
import { analyzeSkillGradients } from "../skillGradientAnalyzer";

export function testSkillGradientAnalyzer(): void {
  const gradients = analyzeSkillGradients({
    below: { elo: 1200, moveProbabilities: { a: 0.4, b: 0.05, c: 0.02 }, topMoves: [] },
    current: { elo: 1500, moveProbabilities: { a: 0.3, b: 0.12, c: 0.04 }, topMoves: [] },
    above: { elo: 1800, moveProbabilities: { a: 0.2, b: 0.2, c: 0.06 }, topMoves: [] },
    advanced: { elo: 2200, moveProbabilities: { a: 0.12, b: 0.24, c: 0.18 }, topMoves: [] },
  });
  const a = gradients.find((g) => g.moveUci === "a");
  const b = gradients.find((g) => g.moveUci === "b");
  const c = gradients.find((g) => g.moveUci === "c");
  assert.equal(a?.trend === "beginner_instinct" || a?.trend === "declines_with_skill", true);
  assert.equal(b?.trend === "improver_move" || b?.trend === "advanced_move", true);
  assert.equal(Boolean(c), true);
}
