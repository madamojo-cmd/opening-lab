import assert from "node:assert/strict";

import { buildContinuationRuntimeState } from "../../lib/blundr/runtime/continuationRuntimeState";
import {
  assertLockedInstructionTarget,
  buildCurrentInstructionFrame,
  getFrameTargetSignature,
  getInstructionTargetOrNull,
  isContinuationTeachingFrame,
  isGuidedTeachingFrame,
  isUserTurnTeachingFrame,
} from "../../lib/blundr/runtime/currentInstructionFrame";
import { lockInstructionTarget } from "../../lib/blundr/runtime/instructionFrameLock";

export function testCurrentInstructionFrameRuntimeAuthority(): void {
  const guidedTarget = lockInstructionTarget({
    uci: "f1c4",
    san: "Bc4",
    pieceType: "bishop",
    color: "white",
    source: "opening_tree",
    reason: "guided line",
  });

  const guided = buildCurrentInstructionFrame({
    kind: "guided_move",
    fenBefore: "r1bqk1nr/pppp1ppp/2n5/2b1p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 4 3",
    ply: 6,
    sideToMove: "white",
    target: guidedTarget,
    mode: "guided",
    source: "opening_tree",
  });

  assert.equal(isUserTurnTeachingFrame(guided), true);
  assert.equal(isGuidedTeachingFrame(guided), true);
  assert.equal(assertLockedInstructionTarget(guided).uci, "f1c4");

  const lichess = buildCurrentInstructionFrame({
    kind: "lichess_branch_move",
    fenBefore: guided.fenBefore,
    ply: 6,
    sideToMove: "white",
    target: lockInstructionTarget({
      uci: "g1f3",
      san: "Nf3",
      pieceType: "knight",
      color: "white",
      source: "lichess_branch",
      reason: "branch response",
    }),
    mode: "guided",
    source: "lichess_branch",
  });
  assert.equal(lichess.target?.uci, "g1f3");

  const adaptive = buildCurrentInstructionFrame({
    kind: "adaptive_branch_move",
    fenBefore: guided.fenBefore,
    ply: 6,
    sideToMove: "white",
    target: lockInstructionTarget({
      uci: "d2d4",
      san: "d4",
      pieceType: "pawn",
      color: "white",
      source: "adaptive_branch",
      reason: "plan fallback",
    }),
    mode: "guided",
    source: "adaptive_branch",
  });
  assert.equal(adaptive.target?.uci, "d2d4");

  const continuation = buildCurrentInstructionFrame({
    kind: "continuation_candidate",
    fenBefore: "r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 2 3",
    ply: 5,
    sideToMove: "black",
    target: lockInstructionTarget({
      uci: "g8f6",
      san: "Nf6",
      pieceType: "knight",
      color: "black",
      source: "continuation_policy",
      reason: "candidate pick",
    }),
    mode: "continuation",
    source: "continuation_policy",
    continuation: {
      candidateLocked: true,
      candidateUci: "g8f6",
      reason: "continue clicked",
    },
  });
  assert.equal(isContinuationTeachingFrame(continuation), true);

  const continuationUnlocked = buildCurrentInstructionFrame({
    kind: "continuation_candidate",
    fenBefore: continuation.fenBefore,
    ply: 5,
    sideToMove: "black",
    target: continuation.target,
    mode: "continuation",
    source: "continuation_policy",
    continuation: {
      candidateLocked: false,
      candidateUci: "g8f6",
      reason: "missing lock",
    },
  });
  assert.equal(
    continuationUnlocked.debug.issues.some((issue) => issue.code === "continuation_candidate_unlocked" && issue.severity === "critical"),
    true,
  );

  const opponent = buildCurrentInstructionFrame({
    kind: "opponent_replying",
    fenBefore: continuation.fenBefore,
    ply: 5,
    sideToMove: "black",
    target: null,
    mode: "blocked",
    source: "none",
  });
  assert.equal(opponent.target, null);

  const opponentWithTarget = buildCurrentInstructionFrame({
    kind: "opponent_replying",
    fenBefore: continuation.fenBefore,
    ply: 5,
    sideToMove: "black",
    target: continuation.target,
    mode: "blocked",
    source: "none",
  });
  assert.equal(opponentWithTarget.target, null);
  assert.equal(opponentWithTarget.debug.issues.some((issue) => issue.code === "opponent_turn_has_user_target"), true);

  const branchComplete = buildCurrentInstructionFrame({
    kind: "branch_complete",
    fenBefore: continuation.fenBefore,
    ply: 5,
    sideToMove: "black",
    target: null,
    mode: "blocked",
    source: "none",
    branchComplete: {
      isComplete: true,
      reason: "curated_line_complete",
      continueFromHereAvailable: true,
    },
  });
  assert.equal(branchComplete.target, null);
  assert.equal(branchComplete.branchComplete?.continueFromHereAvailable, true);
  assert.equal(branchComplete.kind, "branch_complete", "opponent_reply_resolution_to_exhausted_line_enters_branch_complete");

  const terminal = buildCurrentInstructionFrame({
    kind: "terminal",
    fenBefore: "7k/6Q1/6K1/8/8/8/8/8 b - - 0 1",
    ply: 77,
    sideToMove: "black",
    target: null,
    mode: "terminal",
    source: "terminal",
  });
  assert.equal(terminal.target, null);

  const terminalWithTarget = buildCurrentInstructionFrame({
    kind: "terminal",
    fenBefore: terminal.fenBefore,
    ply: terminal.ply,
    sideToMove: "black",
    target: continuation.target,
    mode: "terminal",
    source: "terminal",
  });
  assert.equal(terminalWithTarget.target, null);
  assert.equal(terminalWithTarget.debug.issues.some((issue) => issue.code === "terminal_frame_has_target"), true);

  const terminalLegacyNoUserTurn = buildCurrentInstructionFrame({
    frameId: "legacy-terminal-checkmate",
    fen: "7k/6Q1/6K1/8/8/8/8/8 b - - 0 1",
    trainingMode: "continuation",
    trainerPhase: "terminal",
    trainerView: "assisted",
    isUserTurn: false,
    guidedMove: null,
    continuationCandidate: null,
    preferredTargetKind: "continuation_candidate",
  });
  assert.equal(terminalLegacyNoUserTurn.kind, "terminal", "terminal_checkmate_does_not_render_opponent_replying_surface");
  assert.equal(terminalLegacyNoUserTurn.mode, "terminal");
  assert.equal(terminalLegacyNoUserTurn.target, null);

  const continuationAnalyzing = buildCurrentInstructionFrame({
    kind: "transitioning",
    fenBefore: continuation.fenBefore,
    ply: continuation.ply,
    sideToMove: "black",
    target: null,
    mode: "continuation",
    source: "continuation_policy",
  });
  assert.equal(continuationAnalyzing.kind, "transitioning");
  assert.equal(continuationAnalyzing.mode, "continuation");
  assert.equal(continuationAnalyzing.target, null);

  assert.throws(() => assertLockedInstructionTarget(terminal));

  const changedTarget = buildCurrentInstructionFrame({
    kind: "guided_move",
    fenBefore: guided.fenBefore,
    ply: guided.ply,
    sideToMove: "white",
    target: lockInstructionTarget({
      uci: "g1f3",
      san: "Nf3",
      pieceType: "knight",
      color: "white",
      source: "opening_tree",
      reason: "alt target",
    }),
    mode: "guided",
    source: "opening_tree",
  });
  assert.notEqual(guided.frameKey, changedTarget.frameKey);

  const changedFen = buildCurrentInstructionFrame({
    kind: "guided_move",
    fenBefore: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 6 4",
    ply: guided.ply,
    sideToMove: "white",
    target: guidedTarget,
    mode: "guided",
    source: "opening_tree",
  });
  assert.notEqual(guided.frameKey, changedFen.frameKey);

  const s1 = getFrameTargetSignature(guided);
  const s2 = getFrameTargetSignature(guided);
  assert.equal(s1, s2);

  assert.equal(getInstructionTargetOrNull(guided)?.uci, "f1c4");

  const beforeContinue = buildContinuationRuntimeState({
    branchComplete: true,
    continueClicked: false,
  });
  assert.equal(beforeContinue.selectedContinuationCandidate, null);

  const afterContinue = buildContinuationRuntimeState({
    branchComplete: true,
    continueClicked: true,
    candidateUci: "g8f6",
    candidateSan: "Nf6",
    candidateSource: "continuation_policy",
  });
  assert.equal(afterContinue.selectedContinuationCandidate?.uci, "g8f6");
}

testCurrentInstructionFrameRuntimeAuthority();
console.log("currentInstructionFrame ok");
