import assert from "node:assert/strict";

import { buildLiveVisibleTeachingSurface } from "../../lib/blundr/presentation/buildLiveVisibleTeachingSurface";
import { adaptVisibleSurfaceToBoardVisuals, adaptVisibleSurfaceToCoachUi } from "../../lib/blundr/presentation/uiSurfaceAdapter";
import { buildVisibleTeachingSurface } from "../../lib/blundr/presentation/buildVisibleTeachingSurface";
import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
import { activateTeachingConcepts } from "../../lib/blundr/concepts/dynamicConceptActivator";
import { compileCoachFrame } from "../../lib/blundr/coachCompiler/compileCoachFrame";
import { runCoachSafetyGate } from "../../lib/blundr/safety/coachSafetyGate";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { lockInstructionTarget } from "../../lib/blundr/runtime/instructionFrameLock";

function makeGuidedFrame(input: {
  fen: string;
  uci: string;
  san: string;
  pieceType: "pawn" | "knight" | "bishop" | "rook" | "queen" | "king" | "p" | "n" | "b" | "r" | "q" | "k";
}) {
  return buildCurrentInstructionFrame({
    kind: "guided_move",
    fenBefore: input.fen,
    ply: 0,
    sideToMove: input.fen.split(" ")[1] === "b" ? "black" : "white",
    target: lockInstructionTarget({
      uci: input.uci,
      san: input.san,
      pieceType: input.pieceType,
      color: input.fen.split(" ")[1] === "b" ? "black" : "white",
      source: "opening_tree",
      reason: "test",
    }),
    mode: "guided",
    source: "opening_tree",
  });
}

function hasLeak(text: string, tokens: string[]): boolean {
  const lower = text.toLowerCase();
  return tokens.some((token) => lower.includes(token.toLowerCase()));
}

export function testUiSurfaceAdapter(): void {
  const bc4Frame = makeGuidedFrame({
    fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 4 3",
    uci: "f1c4",
    san: "Bc4",
    pieceType: "bishop",
  });

  const assistedSurface = buildLiveVisibleTeachingSurface({
    frame: bc4Frame,
    requestedMode: "assisted",
    showMoreRevealed: false,
    openingKey: "italian_game",
    openingName: "Italian Game",
  });

  const assistedCoach = adaptVisibleSurfaceToCoachUi(assistedSurface);
  const assistedBoard = adaptVisibleSurfaceToBoardVisuals(assistedSurface);
  assert.equal(assistedCoach.targetUci, "f1c4");
  assert.equal(assistedBoard.visualRecipes.every((visual) => visual.targetUci === "f1c4"), true);
  assert.equal(assistedCoach.debug.source, "VisibleTeachingSurface");
  assert.equal(assistedBoard.debug.source, "VisibleTeachingSurface");

  const plainPreSurface = buildLiveVisibleTeachingSurface({
    frame: bc4Frame,
    requestedMode: "plain",
    showMoreRevealed: false,
    openingKey: "italian_game",
    openingName: "Italian Game",
  });
  const plainPreCoach = adaptVisibleSurfaceToCoachUi(plainPreSurface);
  const plainPreBoard = adaptVisibleSurfaceToBoardVisuals(plainPreSurface);

  assert.equal(hasLeak(`${plainPreCoach.title} ${plainPreCoach.body} ${plainPreCoach.bullets.join(" ")}`, ["Bc4", "f1c4", "f1", "c4", "bishop"]), false);
  assert.equal(
    plainPreBoard.visualRecipes.some((visual) => visual.type === "move_arrow" || visual.type === "source_highlight" || visual.type === "destination_highlight"),
    false,
  );
  assert.equal(plainPreCoach.actions.some((action) => action.kind === "show_more"), true);
  assert.equal(plainPreCoach.actions.some((action) => action.kind === "reveal_target"), false);

  const plainPostSurface = buildLiveVisibleTeachingSurface({
    frame: bc4Frame,
    requestedMode: "plain",
    showMoreRevealed: true,
    openingKey: "italian_game",
    openingName: "Italian Game",
  });
  const plainPostCoach = adaptVisibleSurfaceToCoachUi(plainPostSurface);
  const plainPostBoard = adaptVisibleSurfaceToBoardVisuals(plainPostSurface);
  assert.equal(plainPostCoach.targetUci, assistedCoach.targetUci);
  assert.deepEqual(
    plainPostBoard.visualRecipes.map((visual) => `${visual.id}:${visual.type}:${visual.targetUci}`),
    assistedBoard.visualRecipes.map((visual) => `${visual.id}:${visual.type}:${visual.targetUci}`),
  );

  const branchFrame = buildCurrentInstructionFrame({
    kind: "branch_complete",
    fenBefore: bc4Frame.fenBefore,
    ply: 1,
    sideToMove: "black",
    target: null,
    mode: "blocked",
    source: "none",
    branchComplete: { isComplete: true, continueFromHereAvailable: true },
  });
  const branchSurface = buildLiveVisibleTeachingSurface({
    frame: branchFrame,
    requestedMode: "assisted",
    showMoreRevealed: false,
    branchComplete: true,
  });
  const branchCoach = adaptVisibleSurfaceToCoachUi(branchSurface);
  const branchBoard = adaptVisibleSurfaceToBoardVisuals(branchSurface);
  assert.equal(branchCoach.targetUci, null);
  assert.equal(branchCoach.title, "Line complete");
  assert.equal(branchCoach.body, "You finished this training line. Continue from this position or train the line again.");
  assert.equal(branchCoach.title.includes("Safety Fallback"), false);
  assert.equal(branchCoach.body.includes("Think about the safest improving move here."), false);
  assert.equal(branchCoach.actions.some((action) => action.kind === "continue_from_here"), true);
  assert.equal(branchCoach.actions.some((action) => action.kind === "reveal_target"), false);
  assert.equal(branchBoard.visualRecipes.some((visual) => visual.type === "move_arrow"), false);

  const opponentFrame = buildCurrentInstructionFrame({
    kind: "opponent_replying",
    fenBefore: bc4Frame.fenBefore,
    ply: 1,
    sideToMove: "black",
    target: null,
    mode: "blocked",
    source: "none",
  });
  const opponentSurface = buildLiveVisibleTeachingSurface({ frame: opponentFrame, requestedMode: "assisted", showMoreRevealed: false });
  const opponentCoach = adaptVisibleSurfaceToCoachUi(opponentSurface);
  const opponentBoard = adaptVisibleSurfaceToBoardVisuals(opponentSurface);
  assert.equal(opponentCoach.actions.some((action) => action.kind === "reveal_target"), false);
  assert.equal(opponentBoard.visualRecipes.length, 0);

  const e4 = buildLiveVisibleTeachingSurface({
    frame: makeGuidedFrame({
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      uci: "e2e4",
      san: "e4",
      pieceType: "pawn",
    }),
    requestedMode: "assisted",
    showMoreRevealed: false,
  });
  const nf3 = buildLiveVisibleTeachingSurface({
    frame: makeGuidedFrame({
      fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      uci: "g1f3",
      san: "Nf3",
      pieceType: "knight",
    }),
    requestedMode: "assisted",
    showMoreRevealed: false,
  });
  const bc4 = assistedSurface;
  const castle = buildLiveVisibleTeachingSurface({
    frame: makeGuidedFrame({
      fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 6 4",
      uci: "e1g1",
      san: "O-O",
      pieceType: "king",
    }),
    requestedMode: "assisted",
    showMoreRevealed: false,
  });
  assert.equal(Boolean(e4.frameKey && nf3.frameKey && bc4.frameKey && castle.frameKey), true);
  assert.equal(e4.copy.title.includes("Safety Fallback"), false);
  assert.equal(nf3.copy.title.includes("Safety Fallback"), false);
  assert.equal(bc4.copy.title.includes("Safety Fallback"), false);
  const e4Coach = adaptVisibleSurfaceToCoachUi(e4);
  const nf3Coach = adaptVisibleSurfaceToCoachUi(nf3);
  const bc4Coach = adaptVisibleSurfaceToCoachUi(bc4);
  assert.equal(e4Coach.title.toLowerCase().includes("safety fallback"), false);
  assert.equal(e4Coach.body.toLowerCase().includes("safest improving move here"), false);
  assert.equal(e4Coach.body.toLowerCase().includes("e4") || e4Coach.body.toLowerCase().includes("center"), true);
  assert.equal(nf3Coach.title.toLowerCase().includes("safety fallback"), false);
  assert.equal(nf3Coach.body.toLowerCase().includes("safest improving move here"), false);
  assert.equal(nf3Coach.body.toLowerCase().includes("nf3") || nf3Coach.body.toLowerCase().includes("knight"), true);
  assert.equal(bc4Coach.title.toLowerCase().includes("safety fallback"), false);
  assert.equal(bc4Coach.body.toLowerCase().includes("safest improving move here"), false);
  assert.equal(bc4Coach.body.toLowerCase().includes("bc4") || bc4Coach.body.toLowerCase().includes("bishop"), true);
  const d4 = buildLiveVisibleTeachingSurface({
    frame: makeGuidedFrame({
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      uci: "d2d4",
      san: "d4",
      pieceType: "p",
    }),
    requestedMode: "assisted",
    showMoreRevealed: false,
  });
  const d4Coach = adaptVisibleSurfaceToCoachUi(d4);
  assert.equal(d4Coach.title.toLowerCase().includes("safety blocked"), false);
  assert.equal(d4Coach.body.toLowerCase().includes("no move-specific coaching is available"), false);
  assert.equal(d4Coach.body.toLowerCase().includes("d4") || d4Coach.body.toLowerCase().includes("center"), true);

  const graph = buildEvidenceGraph({ frame: bc4Frame });
  const concepts = activateTeachingConcepts({ graph, mode: "assisted", maxConcepts: 20 });
  const compiled = compileCoachFrame({ frame: bc4Frame, graph, activatedConcepts: concepts.activated });
  const mismatchCompiled = {
    ...compiled,
    targetUci: "g1f3",
    assisted: { ...compiled.assisted, body: "Play Bc4 from f1 to c4" },
  };
  const mismatchSafety = runCoachSafetyGate({ frame: bc4Frame, graph, compiled: mismatchCompiled, activatedConcepts: concepts.activated });
  const blockedSurface = buildVisibleTeachingSurface({
    frame: bc4Frame,
    graph,
    safetyOutput: mismatchSafety,
    requestedMode: "assisted",
    showMoreRevealed: false,
  });
  const blockedCoach = adaptVisibleSurfaceToCoachUi(blockedSurface);
  const blockedBoard = adaptVisibleSurfaceToBoardVisuals(blockedSurface);
  assert.equal(blockedCoach.safety.allowed, false);
  assert.equal(hasLeak(`${blockedCoach.title} ${blockedCoach.body}`, ["Bc4", "f1c4", "f1", "c4", "bishop"]), false);
  assert.equal(blockedBoard.visualRecipes.length, 0);
}

testUiSurfaceAdapter();
console.log("uiSurfaceAdapter ok");
