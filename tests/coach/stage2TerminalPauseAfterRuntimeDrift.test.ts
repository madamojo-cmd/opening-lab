import assert from "node:assert/strict";

import { buildStage2RuntimeGraphSnapshot } from "./stage2RuntimeGraphTestHelpers";

export function testStage2TerminalPauseAfterRuntimeDrift(): void {
  const driftedMoveHistory = [
    "e2e4",
    "e7e5",
    "g1f3",
    "b8c6",
    "f1c4",
    "h7h6",
    "d2d4",
    "e5d4",
    "f3d4",
    "f8c5",
    "c1e3",
    "c6d4",
  ];
  const seedLine = [
    "e2e4",
    "e7e5",
    "g1f3",
    "b8c6",
    "f1c4",
    "f8c5",
    "e1g1",
    "g8f6",
    "c2c3",
    "e8g8",
    "d2d4",
    "e5d4",
  ];
  const snapshot = buildStage2RuntimeGraphSnapshot({
    selectedOpeningId: "italian-white",
    selectedLineId: "italian-white:0",
    selectedRuntimeLineId: "italian-white:0",
    selectedRuntimeLinePlaySequenceUci: seedLine,
    moveHistory: driftedMoveHistory,
    runtimeGraphCurrentPlayKey: driftedMoveHistory.join(","),
    runtimeBookPlayKeyBefore: driftedMoveHistory.join(","),
    runtimeGraphAuthorityUsed: true,
    selectedRuntimeLineUsedFor: "initial_seed",
    selectedRuntimeLineCurrentPly: 12,
    stage2OpeningCurrentPly: 12,
    stage2OpeningDepthReached: true,
    selectedRuntimeLinePlyLength: 12,
    selectedRuntimeLineExhausted: true,
    selectedLineCompleteConfirmed: true,
    bookCompleteAllowed: true,
    guidedCompleteAllowed: true,
    branchTransitionSurfaceRendered: true,
    continueFromHereAvailable: true,
    continueFromHereButtonRendered: true,
    runtimeBookBookExhausted: false,
  });

  assert.equal((snapshot.frame as any)?.currentPly, 12);
  assert.equal((snapshot.frame as any)?.terminalProof?.proven, true);
  assert.equal((snapshot.frame as any)?.terminalProof?.terminalProofLineAuthority, "actual_runtime_branch_or_depth");
  assert.equal((snapshot.frame as any)?.branchTransitionSurfaceRendered, true);
  assert.equal((snapshot.frame as any)?.continueFromHereButtonRendered, true);
  assert.equal((snapshot.frame as any)?.continueFromHereAvailable, true);
  assert.equal((snapshot.frame as any)?.instructionTargetUci, null);
  assert.equal((snapshot.trainerFrameResolution as any)?.openingIdentity?.openingIdentityMatched, true);
  assert.equal((snapshot.trainerFrameResolution as any)?.openingIdentity?.selectedOpeningId, "italian-white");
  assert.equal((snapshot.health.criticalIssues ?? []).includes("instruction_target_missing_on_teaching_frame"), false);
  assert.equal((snapshot.health.criticalIssues ?? []).includes("user_turn_missing_instruction_target"), false);
  assert.equal((snapshot.health.criticalIssues ?? []).includes("ready_for_user_without_target"), false);
}

testStage2TerminalPauseAfterRuntimeDrift();
console.log("stage2TerminalPauseAfterRuntimeDrift ok");
