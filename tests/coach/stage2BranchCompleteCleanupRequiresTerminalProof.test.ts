import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

export function testStage2BranchCompleteCleanupRequiresTerminalProof(): void {
  const source = readFileSync(new URL("../../app/page.tsx", import.meta.url), "utf8");

  assert.match(source, /const branchCompleteShouldCancelPending=branchCompleteEligibleNow&&Boolean\(pendingOpponentRequest\);/);
  assert.match(source, /if\(!branchCompleteEligibleNow\|\|!stage2TerminalProof\.proven\)return;/);
  assert.match(source, /const branchCompleteEligibleNow=Boolean\(stage2TerminalProof\.proven&&!trustedInstructionTargetExists\);/);
  assert.match(source, /if\(nextBranchCompleteEligible\)\{/);
}

testStage2BranchCompleteCleanupRequiresTerminalProof();
console.log("stage2BranchCompleteCleanupRequiresTerminalProof ok");
