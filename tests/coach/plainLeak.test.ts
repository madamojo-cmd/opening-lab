import assert from "node:assert/strict";

function containsForbiddenLeak(text: string, forbiddenTerms: string[]): boolean {
  const lower = text.toLowerCase();
  return forbiddenTerms.some((term) => lower.includes(term.toLowerCase()));
}

export function testPlainLeak(): void {
  const forbidden = ["Bc4", "f1c4", "f1", "c4", "bishop", "show answer"];

  const safeHint = "Find a move that develops a piece and improves pressure.";
  assert.equal(containsForbiddenLeak(safeHint, forbidden), false);

  const leakingHint = "Play Bc4 now, moving the bishop from f1 to c4.";
  assert.equal(containsForbiddenLeak(leakingHint, forbidden), true);

  const forbiddenProviderTerms = ["best", "strongest", "forced", "only move", "checkmate"];
  const safeProviderHint = "This move supports your position and keeps options flexible.";
  assert.equal(containsForbiddenLeak(safeProviderHint, forbiddenProviderTerms), false);
}

testPlainLeak();
console.log("plainLeak ok");
