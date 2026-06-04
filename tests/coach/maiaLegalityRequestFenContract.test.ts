import assert from "node:assert/strict";

import { applyMaiaMoveOnRequestFen } from "../../lib/blundr/maia/maiaLegalityRequestFenContract";
import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";

export function testMaiaLegalityRequestFenContract(): void {
  const requestFen = "r1bqr1k1/bpp2ppp/p1np1n2/4p3/4P3/1BPP1N1P/PP1N1PP1/R1BQR1K1 b - - 0 11";

  const legalResult = applyMaiaMoveOnRequestFen({
    requestFen,
    selectedUci: "c8e6",
    legalMovesUci: ["c8e6", "a7a6", "d6d5"],
  });

  assert.equal(legalResult.legalOnRequestFen, true);
  assert.equal(legalResult.applied, true);
  assert.equal(legalResult.appliedToFen4, "r2qr1k1/bpp2ppp/p1npbn2/4p3/4P3/1BPP1N1P/PP1N1PP1/R1BQR1K1 w - -");

  const legalSnapshot = buildTrainerDebugSnapshot({
    trainingMode: "continuation",
    trainerPhase: "ready_for_user",
    isUserTurn: false,
    fen: legalResult.appliedFen,
    maiaRequestFen4: legalResult.requestFen4,
    maiaSelectedUci: "c8e6",
    maiaSelectedSan: "Be6",
    maiaSelectedLegal: true,
    maiaRuntimeCandidateLegal: true,
    maiaAppliedMoveUci: legalResult.appliedMoveUci,
    maiaAppliedMoveSan: legalResult.appliedMoveSan,
    maiaAppliedFromFen4: legalResult.appliedFromFen4,
    maiaAppliedToFen4: legalResult.appliedToFen4,
    visibleTeachingSurface: { mode: "opponent_replying", owner: "v28_visible_surface", coach: { title: "Opponent is replying", body: "Wait" }, actions: [] },
    presentationFrame: { coach: { shouldRender: false }, visual: { shouldRender: false } },
  });

  assert.equal(legalSnapshot.health.criticalIssues.includes("maia_selected_illegal_move"), false);
  assert.equal(legalSnapshot.health.criticalIssues.includes("maia_runtime_applied_illegal_move"), false);

  const illegalResult = applyMaiaMoveOnRequestFen({
    requestFen,
    selectedUci: "c8a6",
    legalMovesUci: ["c8e6", "a7a6", "d6d5"],
  });

  assert.equal(illegalResult.legalOnRequestFen, false);
  assert.equal(illegalResult.applied, false);
  assert.equal(illegalResult.appliedFen, null);

  const illegalSnapshot = buildTrainerDebugSnapshot({
    trainingMode: "continuation",
    trainerPhase: "ready_for_user",
    isUserTurn: false,
    fen: requestFen,
    maiaRequestFen4: illegalResult.requestFen4,
    maiaSelectedUci: "c8a6",
    maiaSelectedLegal: false,
    maiaRuntimeCandidateLegal: false,
    maiaIllegalCandidateRejected: true,
    maiaAppliedMoveUci: null,
    visibleTeachingSurface: { mode: "opponent_replying", owner: "v28_visible_surface", coach: { title: "Opponent is replying", body: "Wait" }, actions: [] },
    presentationFrame: { coach: { shouldRender: false }, visual: { shouldRender: false } },
  });

  assert.equal(illegalSnapshot.health.warnings.includes("maia_illegal_candidate_rejected"), true);
  assert.equal(illegalSnapshot.health.criticalIssues.includes("maia_runtime_applied_illegal_move"), false);
}

testMaiaLegalityRequestFenContract();
