import assert from "node:assert/strict";

import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";

export function testDebugHealthFrameRelevance(): void {
  const snapshot = buildTrainerDebugSnapshot({
    trainerPhase: "branch_complete",
    trainingMode: "restricted",
    isUserTurn: false,
    visibleTeachingSurface: { mode: "branch_complete", owner: "v28_visible_surface" },
    userTurn: false,
    fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 4 3",
    instructionTargetUci: null,
    continuationRuntimeStatus: "idle",
    coachDecision: { shouldRender: false },
    presentationFrame: { coach: { shouldRender: false }, visual: { shouldRender: false } },
  });

  assert.equal(snapshot.health.criticalIssues.includes("instruction_target_missing_on_teaching_frame"), false);
  assert.equal(snapshot.health.warnings.includes("stockfish_provider_unavailable"), false);
}

testDebugHealthFrameRelevance();
console.log("debugHealthFrameRelevance ok");
