import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

export function testStage2BranchCompleteCleanupRunsOncePerFrame(): void {
  const source = readFileSync(
    new URL("../../app/page.tsx", import.meta.url),
    "utf8",
  );
  const effectStart = source.search(
    /useEffect\(\(\)\s*=>\s*\{\s*if\s*\(!branchCompleteShouldCancelPending\)\s*return;/,
  );
  assert.notEqual(effectStart, -1, "branch_complete_cleanup_effect_present");
  const effectEnd = source.indexOf(
    "useEffect(() => {\n    if (!pendingOpponentRequest) return;",
    effectStart,
  );
  assert.notEqual(
    effectEnd,
    -1,
    "branch_complete_cleanup_effect_terminates_before_pending_guard",
  );
  const effect = source.slice(effectStart, effectEnd);

  assert.match(
    effect,
    /const pendingId\s*=\s*pendingOpponentRequestRef\.current\?\.requestId\s*\?\?\s*null;/,
  );
  assert.equal(effect.includes("if (hasPendingRef) {"), true);
  assert.equal(
    effect.includes(
      "if (branchCompleteBlockedOpponentRequestIdRef.current === pendingId) {",
    ),
    true,
  );
  assert.equal(effect.includes("return;"), true);
  assert.match(
    effect,
    /branchCompleteBlockedOpponentRequestIdRef\.current\s*=\s*pendingId;/,
  );
  assert.equal(
    effect.includes("if (hasPendingState || hasPendingRef) {"),
    true,
  );
  assert.equal(
    effect.includes(
      "clearPendingOpponentReplyRequest({ clearStaleIssue: true });",
    ),
    true,
  );
  assert.equal(
    effect.includes(
      'setTrainerPhase((current) =>\n        current === "opponent_replying" || current === "opponent_selecting"\n          ? "ready_for_user"\n          : current,',
    ),
    true,
  );
}

testStage2BranchCompleteCleanupRunsOncePerFrame();
console.log("stage2BranchCompleteCleanupRunsOncePerFrame ok");
