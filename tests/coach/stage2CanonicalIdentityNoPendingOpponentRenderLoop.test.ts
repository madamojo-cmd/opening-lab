import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

export function testStage2CanonicalIdentityNoPendingOpponentRenderLoop(): void {
  const source = readFileSync(
    new URL("../../app/page.tsx", import.meta.url),
    "utf8",
  );
  const effectStart = source.search(
    /useEffect\(\(\)\s*=>\s*\{\s*if\s*\(!branchCompleteShouldCancelPending\)\s*return;/,
  );
  assert.notEqual(effectStart, -1, "branch_complete_cancel_effect_present");
  const effectEnd = source.search(
    /useEffect\(\(\)\s*=>\s*\{\s*if\s*\(!pendingOpponentRequest\)\s*return;/,
  );
  assert.notEqual(
    effectEnd,
    -1,
    "branch_complete_cancel_effect_terminates_before_pending_guard",
  );
  const effect = source.slice(effectStart, effectEnd);

  assert.equal(
    effect.includes(
      "const pendingId = pendingOpponentRequestRef.current?.requestId ?? null;",
    ),
    true,
  );
  assert.equal(
    effect.includes("const hasPendingState = pendingOpponentRequest !== null;"),
    true,
  );
  assert.equal(
    effect.includes("const hasPendingRef = pendingId !== null;"),
    true,
  );
  assert.equal(
    effect.includes(
      'const isOpponentTransitionPhase =\n      trainerPhase === "opponent_replying" ||\n      trainerPhase === "opponent_selecting";',
    ),
    true,
  );
  assert.equal(
    effect.includes(
      "if (!hasPendingState && !hasPendingRef && !isOpponentTransitionPhase) {",
    ),
    true,
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
  assert.equal(effect.includes("pendingOpponentRequest?.requestId"), true);
}

testStage2CanonicalIdentityNoPendingOpponentRenderLoop();
console.log("stage2CanonicalIdentityNoPendingOpponentRenderLoop ok");
