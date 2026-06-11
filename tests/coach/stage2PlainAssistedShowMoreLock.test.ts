import assert from "node:assert/strict";

import { buildLiveVisibleTeachingSurface } from "../../lib/blundr/presentation/buildLiveVisibleTeachingSurface";
import { adaptVisibleSurfaceToBoardVisuals, adaptVisibleSurfaceToCoachUi } from "../../lib/blundr/presentation/uiSurfaceAdapter";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { lockInstructionTarget } from "../../lib/blundr/runtime/instructionFrameLock";

function leaksTarget(text: string): boolean {
  const lower = text.toLowerCase();
  return ["bc4", "f1c4", "f1", "c4", "bishop", "from f1", "to c4"].some((token) => lower.includes(token));
}

export function testStage2PlainAssistedShowMoreLock(): void {
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
      reason: "plain_assisted_showmore_lock",
    }),
    mode: "guided",
    source: "opening_tree",
  });

  const plainPre = buildLiveVisibleTeachingSurface({
    frame,
    requestedMode: "plain",
    showMoreRevealed: false,
    openingKey: "italian_game",
    openingName: "Italian Game",
  });

  const assisted = buildLiveVisibleTeachingSurface({
    frame,
    requestedMode: "assisted",
    showMoreRevealed: false,
    openingKey: "italian_game",
    openingName: "Italian Game",
  });

  const plainPost = buildLiveVisibleTeachingSurface({
    frame,
    requestedMode: "plain",
    showMoreRevealed: true,
    openingKey: "italian_game",
    openingName: "Italian Game",
  });

  const plainPreCoach = adaptVisibleSurfaceToCoachUi(plainPre);
  const assistedCoach = adaptVisibleSurfaceToCoachUi(assisted);
  const plainPostCoach = adaptVisibleSurfaceToCoachUi(plainPost);

  const plainPreBoard = adaptVisibleSurfaceToBoardVisuals(plainPre);
  const assistedBoard = adaptVisibleSurfaceToBoardVisuals(assisted);
  const plainPostBoard = adaptVisibleSurfaceToBoardVisuals(plainPost);

  // Plain before Show More must not leak target text/visuals.
  assert.equal(leaksTarget(`${plainPreCoach.title} ${plainPreCoach.body} ${(plainPreCoach.bullets ?? []).join(" ")}`), false);
  assert.equal(plainPreBoard.visualRecipes.length, 0);

  // Assisted and Show More must align to same target authority.
  assert.equal(assisted.targetUci, frame.target?.uci ?? null);
  assert.equal(plainPost.targetUci, assisted.targetUci);
  assert.equal(plainPostCoach.targetUci, assistedCoach.targetUci);

  const assistedVisualUci = assistedBoard.visualRecipes.find((recipe) => recipe.targetUci !== null)?.targetUci ?? null;
  const plainPostVisualUci = plainPostBoard.visualRecipes.find((recipe) => recipe.targetUci !== null)?.targetUci ?? null;
  assert.equal(assistedVisualUci, frame.target?.uci ?? null);
  assert.equal(plainPostVisualUci, assistedVisualUci);

  // No stage2 packet-like extra fields may bypass plain no-leak rules.
  const noisyPlainPre = buildLiveVisibleTeachingSurface({
    frame,
    requestedMode: "plain",
    showMoreRevealed: false,
    openingKey: "italian_game",
    openingName: "Italian Game",
    // ignored/noisy extras
    expectedMoveUci: "e2e4",
    selectedCandidateUci: "g1f3",
    maiaSelectedUci: "d2d4",
  } as any);
  const noisyCoach = adaptVisibleSurfaceToCoachUi(noisyPlainPre);
  const noisyBoard = adaptVisibleSurfaceToBoardVisuals(noisyPlainPre);

  assert.equal(leaksTarget(`${noisyCoach.title} ${noisyCoach.body} ${(noisyCoach.bullets ?? []).join(" ")}`), false);
  assert.equal(noisyBoard.visualRecipes.length, 0);
}

testStage2PlainAssistedShowMoreLock();
console.log("stage2PlainAssistedShowMoreLock ok");
