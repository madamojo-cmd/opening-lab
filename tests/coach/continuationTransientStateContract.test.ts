import assert from "node:assert/strict";

import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";

export function testContinuationTransientStateContract(): void {
  const snapshot = buildTrainerDebugSnapshot({
    trainerPhase: "ready_for_user",
    trainingMode: "continuation",
    isUserTurn: true,
    visibleTeachingSurface: { mode: "analyzing", owner: "v28_visible_surface" },
    userTurn: true,
    fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 4 3",
    instructionTargetUci: null,
    continuationRuntimeStatus: "analyzing",
    coachDecision: { shouldRender: false },
    presentationFrame: { coach: { shouldRender: false }, visual: { shouldRender: false } },
  });

  assert.equal(snapshot.health.criticalIssues.includes("instruction_target_missing_on_teaching_frame"), false);
}

testContinuationTransientStateContract();
console.log("continuationTransientStateContract ok");
