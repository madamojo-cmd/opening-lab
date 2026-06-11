import assert from "node:assert/strict";

import { buildLiveVisibleTeachingSurface } from "../../lib/blundr/presentation/buildLiveVisibleTeachingSurface";
import { adaptVisibleSurfaceToBoardVisuals, adaptVisibleSurfaceToCoachUi } from "../../lib/blundr/presentation/uiSurfaceAdapter";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { lockInstructionTarget } from "../../lib/blundr/runtime/instructionFrameLock";

export function testStage2FrameAuthorityLock(): void {
  const frame = buildCurrentInstructionFrame({
    kind: "guided_move",
    fenBefore: "r1bqk1nr/pppp1ppp/2n5/2b1p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 4 3",
    ply: 6,
    sideToMove: "white",
    target: lockInstructionTarget({
      uci: "f1c4",
      san: "Bc4",
      pieceType: "bishop",
      color: "white",
      source: "opening_tree",
      reason: "stage2_lock",
    }),
    mode: "guided",
    source: "opening_tree",
  });

  // Include non-authority fields; they must not override frame.target in visible outputs.
  const noisyInput = {
    frame,
    requestedMode: "assisted" as const,
    showMoreRevealed: false,
    openingKey: "italian_game",
    openingName: "Italian Game",
    expectedMoveUci: "e2e4",
    expectedMoveSan: "e4",
    selectedCandidateUci: "g1f3",
    enginePreviewUci: "d2d4",
    maiaSelectedUci: "b1c3",
    continuationCandidateUci: "h2h4",
  } as any;

  const assisted = buildLiveVisibleTeachingSurface(noisyInput);
  const assistedCoach = adaptVisibleSurfaceToCoachUi(assisted);
  const assistedBoard = adaptVisibleSurfaceToBoardVisuals(assisted);

  const instructionTargetUci = frame.target?.uci ?? null;
  const instructionTargetPiece = frame.target?.pieceType ?? null;
  const coachMoveUci = assistedCoach.targetUci;
  const visualMoveUci = assistedBoard.visualRecipes.find((recipe) => recipe.targetUci !== null)?.targetUci ?? null;
  const revealTargetUci = assisted.actions.find((action) => action.kind === "reveal_target")?.targetUci ?? instructionTargetUci;

  assert.equal(instructionTargetUci, "f1c4");
  assert.equal(coachMoveUci, instructionTargetUci);
  assert.equal(visualMoveUci, instructionTargetUci);
  assert.equal(revealTargetUci, instructionTargetUci);
  assert.equal(assisted.pieceType, instructionTargetPiece);

  const plainPost = buildLiveVisibleTeachingSurface({
    ...noisyInput,
    requestedMode: "plain",
    showMoreRevealed: true,
  });
  const plainPostCoach = adaptVisibleSurfaceToCoachUi(plainPost);
  const plainPostBoard = adaptVisibleSurfaceToBoardVisuals(plainPost);
  const plainRevealTargetUci = plainPost.actions.find((action) => action.kind === "reveal_target")?.targetUci ?? instructionTargetUci;
  const plainVisualUci = plainPostBoard.visualRecipes.find((recipe) => recipe.targetUci !== null)?.targetUci ?? null;

  assert.equal(plainPostCoach.targetUci, instructionTargetUci);
  assert.equal(plainVisualUci, instructionTargetUci);
  assert.equal(plainRevealTargetUci, instructionTargetUci);
  assert.equal(plainPost.pieceType, instructionTargetPiece);
}

testStage2FrameAuthorityLock();
console.log("stage2FrameAuthorityLock ok");
