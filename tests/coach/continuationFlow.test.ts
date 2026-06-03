import assert from "node:assert/strict";
import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
import { compileCoachFrame } from "../../lib/blundr/coachCompiler/compileCoachFrame";
import { buildVisibleTeachingSurface } from "../../lib/blundr/presentation/buildVisibleTeachingSurface";
import { buildContinuationRuntimeState } from "../../lib/blundr/runtime/continuationRuntimeState";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { runCoachSafetyGate } from "../../lib/blundr/safety/coachSafetyGate";

function isLegalUciShape(uci: string | null): boolean {
  if (!uci) return false;
  return /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(uci);
}

export function testContinuationFlow(): void {
  const beforeContinue = buildContinuationRuntimeState({
    branchComplete: true,
    continueClicked: false,
  });

  assert.equal(beforeContinue.phase, "branch_complete_waiting_for_continue");
  assert.equal(beforeContinue.selectedContinuationCandidate, null);
  assert.equal(beforeContinue.continueFromHereAvailable, true);

  const afterContinue = buildContinuationRuntimeState({
    branchComplete: true,
    continueClicked: true,
    candidateUci: "g8f6",
    candidateSan: "Nf6",
    candidateSource: "continuation_policy",
  });

  const alignment = {
    instructionTarget: afterContinue.selectedContinuationCandidate?.uci ?? null,
    selectedContinuationCandidate: afterContinue.selectedContinuationCandidate?.uci ?? null,
    coachTarget: "g8f6",
    visualTarget: "g8f6",
    revealTarget: "g8f6",
    lockConfidence: "locked",
  };

  assert.equal(afterContinue.phase, "candidate_locked");
  assert.equal(isLegalUciShape(alignment.selectedContinuationCandidate), true);
  assert.equal(alignment.lockConfidence, "locked");
  assert.equal(alignment.instructionTarget, alignment.coachTarget);
  assert.equal(alignment.instructionTarget, alignment.visualTarget);
  assert.equal(alignment.instructionTarget, alignment.revealTarget);

  const stockfishCannotLock = buildContinuationRuntimeState({
    branchComplete: true,
    continueClicked: true,
    candidateUci: "g8f6",
    candidateSource: "stockfish",
  });
  assert.equal(stockfishCannotLock.phase, "blocked");

  const maiaCannotLock = buildContinuationRuntimeState({
    branchComplete: true,
    continueClicked: true,
    candidateUci: "g8f6",
    candidateSource: "maia",
  });
  assert.equal(maiaCannotLock.phase, "blocked");

  const branchFrame = buildCurrentInstructionFrame({
    kind: "branch_complete",
    fenBefore: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 6 4",
    ply: 9,
    sideToMove: "black",
    target: null,
    mode: "blocked",
    source: "none",
    branchComplete: { isComplete: true, continueFromHereAvailable: true },
  });
  const branchGraph = buildEvidenceGraph({ frame: branchFrame });
  const branchCompiled = compileCoachFrame({ frame: branchFrame, graph: branchGraph, activatedConcepts: [] });
  const branchGate = runCoachSafetyGate({ frame: branchFrame, graph: branchGraph, compiled: branchCompiled });
  const branchSurface = buildVisibleTeachingSurface({
    frame: branchFrame,
    graph: branchGraph,
    safetyOutput: branchGate,
    requestedMode: "assisted",
    showMoreRevealed: false,
  });
  assert.equal(branchSurface.mode, "branch_complete");
  assert.equal(branchSurface.targetUci, null);
  assert.equal(branchSurface.actions.some((action) => action.kind === "continue_from_here"), true);
}

testContinuationFlow();
console.log("continuationFlow ok");
