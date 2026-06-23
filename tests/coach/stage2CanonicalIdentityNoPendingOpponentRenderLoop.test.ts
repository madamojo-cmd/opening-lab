import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

export function testStage2CanonicalIdentityNoPendingOpponentRenderLoop(): void {
  const source = readFileSync(new URL("../../app/page.tsx", import.meta.url), "utf8");
  const effectStart = source.indexOf("useEffect(()=>{\n    if(!branchCompleteShouldCancelPending)return;");
  assert.notEqual(effectStart, -1, "branch_complete_cancel_effect_present");
  const effectEnd = source.indexOf("useEffect(()=>{\n    if(!pendingOpponentRequest)return;", effectStart);
  assert.notEqual(effectEnd, -1, "branch_complete_cancel_effect_terminates_before_pending_guard");
  const effect = source.slice(effectStart, effectEnd);

  assert.match(effect, /const pendingId=pendingOpponentRequestRef\.current\?\.requestId\?\?null;/);
  assert.match(effect, /const hasPendingState=pendingOpponentRequest!==null;/);
  assert.match(effect, /const hasPendingRef=pendingId!==null;/);
  assert.match(effect, /const isOpponentTransitionPhase=\s*trainerPhase==="opponent_replying"\|\|\s*trainerPhase==="opponent_selecting";/);
  assert.match(effect, /if\(!hasPendingState&&!hasPendingRef&&!isOpponentTransitionPhase\)\{\s*return;\s*\}/);
  assert.match(effect, /if\(hasPendingState\|\|hasPendingRef\)\{\s*clearPendingOpponentReplyRequest\(\{clearStaleIssue:true\}\);\s*\}/);
  assert.match(effect, /setTrainerPhase\(\(current\)=>\(\s*current==="opponent_replying"\|\|current==="opponent_selecting"\s*\?\s*"ready_for_user"\s*:\s*current\s*\)\);/);
  assert.match(effect, /pendingOpponentRequest\?\.requestId/);
}

testStage2CanonicalIdentityNoPendingOpponentRenderLoop();
console.log("stage2CanonicalIdentityNoPendingOpponentRenderLoop ok");
