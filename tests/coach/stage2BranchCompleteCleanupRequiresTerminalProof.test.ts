import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

export function testStage2BranchCompleteCleanupRequiresTerminalProof(): void {
  const source = readFileSync(new URL("../../app/page.tsx", import.meta.url), "utf8");

  assert.match(source, /const branchCompleteShouldCancelPending=branchCompleteEligibleNow&&Boolean\(pendingOpponentRequest\);/);
  assert.match(source, /if\(!branchCompleteEligibleNow\|\|!stage2TerminalProof\.proven\)return;/);
  // The current contract retains the terminal-proof gate and also blocks cleanup while an explicit continuation handoff is active.
  assert.match(source, /const branchCompleteEligibleNow=Boolean\(stage2TerminalProof\.proven&&!trustedInstructionTargetExists&&!continueFromHereClicked&&!userExplicitlyEnteredContinuation\);/);
  assert.match(source, /if\(nextBranchCompleteEligible\)\{/);
}

testStage2BranchCompleteCleanupRequiresTerminalProof();
console.log("stage2BranchCompleteCleanupRequiresTerminalProof ok");
