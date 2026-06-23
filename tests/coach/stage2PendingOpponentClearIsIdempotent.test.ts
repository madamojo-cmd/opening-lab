import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

export function testStage2PendingOpponentClearIsIdempotent(): void {
  const source = readFileSync(new URL("../../app/page.tsx", import.meta.url), "utf8");
  const helperStart = source.indexOf("function clearPendingOpponentReplyRequest(options?:{clearStaleIssue?:boolean}){");
  assert.notEqual(helperStart, -1, "clear_pending_helper_present");
  const helperEnd = source.indexOf("function commitRuntimeFrame(", helperStart);
  assert.notEqual(helperEnd, -1, "clear_pending_helper_terminates_before_commit_frame");
  const helper = source.slice(helperStart, helperEnd);

  assert.match(helper, /const hadPendingRef=pendingOpponentRequestRef\.current!==null;/);
  assert.match(helper, /const hadPendingState=pendingOpponentRequest!==null;/);
  assert.match(helper, /const hadTimeout=opponentReplyTimeoutRef\.current!==null;/);
  assert.match(helper, /if\(!hadPendingRef&&!hadPendingState&&!hadTimeout\)\{\s*return;\s*\}/);
  assert.match(helper, /if\(hadPendingRef\)\{\s*pendingOpponentRequestRef\.current=null;\s*\}/);
  assert.match(helper, /if\(hadPendingState\)\{\s*setPendingOpponentRequest\(null\);\s*\}/);
  assert.match(helper, /if\(options\?\.clearStaleIssue&&\(hadPendingRef\|\|hadPendingState\)\)clearRuntimeCriticalIssue\("stale_opponent_reply_commit"\);/);
}

testStage2PendingOpponentClearIsIdempotent();
console.log("stage2PendingOpponentClearIsIdempotent ok");
