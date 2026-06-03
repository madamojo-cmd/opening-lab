import assert from "node:assert/strict";

const STRONG_TERMS = [
  "best",
  "strongest",
  "wins",
  "winning",
  "forced",
  "only move",
  "mate",
  "checkmate",
  "blunder",
  "refutes",
  "trap",
];

function containsStrongTerm(text: string): boolean {
  const lower = text.toLowerCase();
  return STRONG_TERMS.some((term) => lower.includes(term));
}

function mayUseCopy(text: string, approvedClaimIds: string[]): boolean {
  if (!containsStrongTerm(text)) return true;
  return approvedClaimIds.length > 0;
}

export function testAntiHallucination(): void {
  const unsupported = "This is the best and only move, it refutes everything.";
  assert.equal(mayUseCopy(unsupported, []), false);

  const supported = "This is the best move in the current engine line.";
  assert.equal(mayUseCopy(supported, ["engine_claim_top1"]), true);

  const safeFallback = "This move improves piece activity and keeps your position solid.";
  assert.equal(mayUseCopy(safeFallback, []), true);
}

testAntiHallucination();
console.log("antiHallucination ok");
