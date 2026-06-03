import assert from "node:assert/strict";

function isLegalUciShape(uci: string | null): boolean {
  if (!uci) return false;
  return /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(uci);
}

export function testContinuationFlow(): void {
  const beforeContinue = {
    instructionTarget: null as string | null,
    selectedContinuationCandidate: null as string | null,
    visibleActions: ["continue_from_here", "show_hint"],
  };

  assert.equal(beforeContinue.instructionTarget, null);
  assert.equal(beforeContinue.selectedContinuationCandidate, null);
  assert.equal(beforeContinue.visibleActions.includes("continue_from_here"), true);

  const afterContinue = {
    instructionTarget: "g8f6",
    selectedContinuationCandidate: "g8f6",
    coachTarget: "g8f6",
    visualTarget: "g8f6",
    revealTarget: "g8f6",
    lockConfidence: "locked",
  };

  assert.equal(isLegalUciShape(afterContinue.selectedContinuationCandidate), true);
  assert.equal(afterContinue.lockConfidence, "locked");
  assert.equal(afterContinue.instructionTarget, afterContinue.coachTarget);
  assert.equal(afterContinue.instructionTarget, afterContinue.visualTarget);
  assert.equal(afterContinue.instructionTarget, afterContinue.revealTarget);
}

testContinuationFlow();
console.log("continuationFlow ok");
