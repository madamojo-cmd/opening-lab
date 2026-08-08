import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

export function testStage2BranchCompleteCleanupRequiresTerminalProof(): void {
  const source = readFileSync(
    new URL("../../app/page.tsx", import.meta.url),
    "utf8",
  );

  assert.equal(
    source.includes(
      "const branchCompleteEligibleNow = Boolean(\n    stage2TerminalProof.proven &&\n      !trustedInstructionTargetExists &&\n      !continueFromHereClicked &&\n      !userExplicitlyEnteredContinuation,\n  );",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "const branchCompleteShouldCancelPending =\n    branchCompleteEligibleNow && Boolean(pendingOpponentRequest);",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "if (!branchCompleteEligibleNow || !stage2TerminalProof.proven) return;",
    ),
    true,
  );
  // The current contract retains the terminal-proof gate and also blocks cleanup while an explicit continuation handoff is active.
  assert.equal(source.includes("if (nextBranchCompleteEligible) {"), true);
}

testStage2BranchCompleteCleanupRequiresTerminalProof();
console.log("stage2BranchCompleteCleanupRequiresTerminalProof ok");
