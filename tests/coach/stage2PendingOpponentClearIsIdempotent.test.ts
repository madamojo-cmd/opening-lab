import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

export function testStage2PendingOpponentClearIsIdempotent(): void {
  const source = readFileSync(
    new URL("../../app/page.tsx", import.meta.url),
    "utf8",
  );
  const helperStart = source.indexOf(
    "function clearPendingOpponentReplyRequest(options?: {",
  );
  assert.notEqual(helperStart, -1, "clear_pending_helper_present");
  const helperEnd = source.indexOf("function commitRuntimeFrame(", helperStart);
  assert.notEqual(
    helperEnd,
    -1,
    "clear_pending_helper_terminates_before_commit_frame",
  );
  const helper = source.slice(helperStart, helperEnd);

  assert.match(
    helper,
    /const hadPendingRef\s*=\s*pendingOpponentRequestRef\.current\s*!==\s*null;/,
  );
  assert.match(
    helper,
    /const hadPendingState\s*=\s*pendingOpponentRequest\s*!==\s*null;/,
  );
  assert.match(
    helper,
    /const hadTimeout\s*=\s*opponentReplyTimeoutRef\.current\s*!==\s*null;/,
  );
  assert.match(
    helper,
    /if\s*\(\s*!hadPendingRef\s*&&\s*!hadPendingState\s*&&\s*!hadTimeout\s*\)\s*\{\s*return false;\s*\}/,
  );
  assert.match(
    helper,
    /if\s*\(\s*hadPendingRef\s*\)\s*\{\s*pendingOpponentRequestRef\.current\s*=\s*null;\s*\}/,
  );
  assert.match(
    helper,
    /if\s*\(\s*hadPendingState\s*\)\s*\{\s*setPendingOpponentRequest\(null\);\s*\}/,
  );
  assert.match(
    helper,
    /if\s*\(\s*options\?\.clearStaleIssue\s*&&\s*\(\s*hadPendingRef\s*\|\|\s*hadPendingState\s*\)\s*\)\s*clearRuntimeCriticalIssue\("stale_opponent_reply_commit"\);/,
  );
  assert.match(helper, /return true;/);
}

testStage2PendingOpponentClearIsIdempotent();
console.log("stage2PendingOpponentClearIsIdempotent ok");
