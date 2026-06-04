import assert from "node:assert/strict";

import { buildCoachExplanationPipeline, buildVerifiedUserFacingFallback, renderCoachExplanation } from "../../lib/blundr/coachBrain/coachExplanationPipeline";
import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { lockInstructionTarget } from "../../lib/blundr/runtime/instructionFrameLock";

export function testCoachTitlesAndStockfishWarnings(): void {
  const fen = "r1bqk2r/pppp1ppp/2n2n2/2b1p3/4P3/2N2N2/PPPP1PPP/R1BQ1RK1 w kq - 0 1";
  const frame = buildCurrentInstructionFrame({
    kind: "guided_move",
    fenBefore: fen,
    ply: 0,
    sideToMove: "white",
    target: lockInstructionTarget({
      uci: "g1f3",
      san: "Nf3",
      pieceType: "n",
      color: "white",
      source: "opening_tree",
      reason: "test",
    }),
    mode: "guided",
    source: "opening_tree",
  });

  const pipeline = buildCoachExplanationPipeline({
    fenBefore: fen,
    target: frame.target,
    trainerMode: "continuation",
    trainerPhase: "ready_for_user",
    isContinuation: true,
    openingId: "test_opening",
    lineId: "test_line",
    activeLineName: "Test Line",
    recentCoachBodies: [],
    recentCoachThemes: [],
    brainAnalysis: null,
  });

  const rendered = renderCoachExplanation(pipeline.moveFactPacket, pipeline.opportunityPacket.selected);
  assert.equal(rendered.title.startsWith("Nf3 —"), true, "coach title should include SAN prefix for assisted copy");
  assert.equal(/Improve the position|Finish the attack|Use the forcing move|Win material cleanly/i.test(rendered.title), false, "coach title should avoid legacy generic labels");

  const fallback = buildVerifiedUserFacingFallback(pipeline.moveFactPacket);
  assert.equal(fallback.title.startsWith("Nf3 —"), true, "fallback title should preserve SAN");
  assert.equal(fallback.title.includes("Continue the position") || fallback.title.includes("Develop the knight") || fallback.title.includes("Give check") || fallback.title.includes("Castle to safety") || fallback.title.includes("Capture in the center"), true, "fallback title should use a safe SAN-based label");

  const snapshotNotWarned = buildTrainerDebugSnapshot({
    trainingMode: "continuation",
    trainerPhase: "ready_for_user",
    isUserTurn: false,
    fen,
    stockfishProviderStatus: "unavailable",
    visibleTeachingSurface: { mode: "assisted", owner: "v28_visible_surface" },
  });
  assert.equal(snapshotNotWarned.health.warnings.includes("stockfish_provider_unavailable"), false, "stockfish warning should not fire when not on user turn");

  const snapshotWarned = buildTrainerDebugSnapshot({
    trainingMode: "continuation",
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    fen,
    instructionTargetUci: "g1f3",
    stockfishProviderStatus: "unavailable",
    visibleTeachingSurface: { mode: "assisted", owner: "v28_visible_surface" },
  });
  assert.equal(snapshotWarned.health.warnings.includes("stockfish_provider_unavailable"), true, "stockfish warning should fire for user-turn assisted continuation targets when provider is unavailable");

  const unsafeTemplateSnapshot = buildTrainerDebugSnapshot({
    trainingMode: "continuation",
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    instructionTargetUci: "g1f3",
    visibleTeachingSurface: { mode: "assisted", owner: "v28_visible_surface" },
    coachDecision: {
      shouldRender: true,
      title: "Nf3 — Develop the knight",
      body: "Develop the knight to g5.",
      debug: {
        verifiedFallbackUsed: true,
        fallbackReason: "claim_validation_failed",
        unverifiedClaims: ["unverified_center_tension_claim"],
      },
    },
    presentationFrame: { coach: { shouldRender: false }, visual: { shouldRender: false } },
  });
  assert.equal(unsafeTemplateSnapshot.health.criticalIssues.includes("unsafe_template_rendered"), false, "safe verified fallback should not trigger unsafe_template_rendered");
}

testCoachTitlesAndStockfishWarnings();
console.log("coachTitlesAndStockfishWarnings ok");
