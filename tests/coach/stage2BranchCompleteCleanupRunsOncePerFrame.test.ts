import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

export function testStage2BranchCompleteCleanupRunsOncePerFrame(): void {
  const source = readFileSync(new URL("../../app/page.tsx", import.meta.url), "utf8");
  const effectStart = source.indexOf("useEffect(()=>{\n    if(!branchCompleteShouldCancelPending)return;");
  assert.notEqual(effectStart, -1, "branch_complete_cleanup_effect_present");
  const effectEnd = source.indexOf("useEffect(()=>{\n    if(!pendingOpponentRequest)return;", effectStart);
  assert.notEqual(effectEnd, -1, "branch_complete_cleanup_effect_terminates_before_pending_guard");
  const effect = source.slice(effectStart, effectEnd);

  assert.match(effect, /const pendingId=pendingOpponentRequestRef\.current\?\.requestId\?\?null;/);
  assert.match(effect, /if\(hasPendingRef\)\{\s*if\(branchCompleteBlockedOpponentRequestIdRef\.current===pendingId\)\{\s*return;\s*\}/);
  assert.match(effect, /branchCompleteBlockedOpponentRequestIdRef\.current=pendingId;/);
  assert.match(effect, /if\(hasPendingState\|\|hasPendingRef\)\{\s*clearPendingOpponentReplyRequest\(\{clearStaleIssue:true\}\);\s*\}/);
  assert.match(effect, /setTrainerPhase\(\(current\)=>\(\s*current==="opponent_replying"\|\|current==="opponent_selecting"\s*\?\s*"ready_for_user"\s*:\s*current\s*\)\);/);
}

testStage2BranchCompleteCleanupRunsOncePerFrame();
console.log("stage2BranchCompleteCleanupRunsOncePerFrame ok");
