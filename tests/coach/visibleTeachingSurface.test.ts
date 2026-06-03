import assert from "node:assert/strict";

import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
import { compileCoachFrame } from "../../lib/blundr/coachCompiler/compileCoachFrame";
import { activateTeachingConcepts } from "../../lib/blundr/concepts/dynamicConceptActivator";
import { buildVisibleTeachingSurface } from "../../lib/blundr/presentation/buildVisibleTeachingSurface";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { lockInstructionTarget } from "../../lib/blundr/runtime/instructionFrameLock";
import { runCoachSafetyGate } from "../../lib/blundr/safety/coachSafetyGate";

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

function buildSurfacePack(input: {
  frame: ReturnType<typeof buildCurrentInstructionFrame>;
  requestedMode: "assisted" | "plain";
  showMoreRevealed: boolean;
}) {
  const graph = buildEvidenceGraph({ frame: input.frame, openingKey: "italian_game", openingName: "Italian Game" });
  const concepts = activateTeachingConcepts({ graph, mode: input.showMoreRevealed ? "show_more" : "assisted", maxConcepts: 20 });
  const compiled = compileCoachFrame({ frame: input.frame, graph, activatedConcepts: concepts.activated });
  const safetyOutput = runCoachSafetyGate({ frame: input.frame, graph, compiled, activatedConcepts: concepts.activated });
  const surface = buildVisibleTeachingSurface({
    frame: input.frame,
    graph,
    safetyOutput,
    requestedMode: input.requestedMode,
    showMoreRevealed: input.showMoreRevealed,
  });
  return { graph, concepts, compiled, safetyOutput, surface };
}

export function testVisibleTeachingSurface(): void {
  const bc4Frame = makeGuidedFrame({
    fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 4 3",
    uci: "f1c4",
    san: "Bc4",
    pieceType: "bishop",
  });

  const assistedBc4 = buildSurfacePack({ frame: bc4Frame, requestedMode: "assisted", showMoreRevealed: false });
  assert.equal(assistedBc4.surface.targetUci, "f1c4");
  assert.equal(assistedBc4.surface.visuals.every((visual) => visual.targetUci === "f1c4"), true);
  assert.equal(assistedBc4.surface.actions.some((action) => action.kind === "reveal_target"), false);

  const plainPreBc4 = buildSurfacePack({ frame: bc4Frame, requestedMode: "plain", showMoreRevealed: false });
  const plainPreCopy = `${plainPreBc4.surface.copy.title} ${plainPreBc4.surface.copy.body} ${plainPreBc4.surface.copy.bullets.join(" ")}`;
  assert.equal(hasLeak(plainPreCopy, ["Bc4", "f1c4", "f1", "c4", "bishop"]), false);
  assert.equal(
    plainPreBc4.surface.visuals.some((visual) => visual.type === "move_arrow" || visual.type === "source_highlight" || visual.type === "destination_highlight"),
    false,
  );
  assert.equal(plainPreBc4.surface.actions.some((action) => action.kind === "show_more"), true);
  assert.equal(plainPreBc4.surface.actions.some((action) => action.kind === "hint"), true);
  assert.equal(plainPreBc4.surface.actions.some((action) => action.kind === "reveal_target"), false);

  const plainPostBc4 = buildSurfacePack({ frame: bc4Frame, requestedMode: "plain", showMoreRevealed: true });
  assert.equal(plainPostBc4.surface.targetUci, assistedBc4.surface.targetUci);
  assert.deepEqual(
    plainPostBc4.surface.visuals.map((visual) => `${visual.id}:${visual.targetUci}:${visual.type}`),
    assistedBc4.surface.visuals.map((visual) => `${visual.id}:${visual.targetUci}:${visual.type}`),
  );
  assert.equal(plainPostBc4.surface.actions.some((action) => action.kind === "reveal_target"), false);
  assert.equal(plainPostBc4.surface.actions.some((action) => action.kind === "hide_more"), true);
  assert.equal(plainPostBc4.surface.copy.body.includes(plainPostBc4.safetyOutput.safeFrame.showMore.body), true);

  const nf3Frame = makeGuidedFrame({
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    uci: "g1f3",
    san: "Nf3",
    pieceType: "knight",
  });
  const nf3 = buildSurfacePack({ frame: nf3Frame, requestedMode: "assisted", showMoreRevealed: false });
  assert.equal(hasLeak(`${nf3.surface.copy.title} ${nf3.surface.copy.body}`, ["bishop"]), false);

  const bc4Again = buildSurfacePack({ frame: bc4Frame, requestedMode: "assisted", showMoreRevealed: false });
  assert.equal(hasLeak(`${bc4Again.surface.copy.title} ${bc4Again.surface.copy.body}`, ["knight"]), false);

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
  const branch = buildSurfacePack({ frame: branchFrame, requestedMode: "assisted", showMoreRevealed: false });
  assert.equal(branch.surface.mode, "branch_complete");
  assert.equal(branch.surface.targetUci, null);
  assert.equal(branch.surface.copy.title, "Line complete");
  assert.equal(branch.surface.copy.body, "You finished this training line. Continue from this position or train the line again.");
  assert.equal(branch.surface.copy.title.includes("Safety Fallback"), false);
  assert.equal(branch.surface.copy.body.includes("Think about the safest improving move here."), false);
  assert.equal(branch.surface.actions.some((action) => action.kind === "continue_from_here"), true);
  assert.equal(branch.surface.actions.some((action) => action.kind === "reveal_target"), false);
  assert.equal(branch.surface.visuals.some((visual) => visual.type === "move_arrow"), false);

  const opponentFrame = buildCurrentInstructionFrame({
    kind: "opponent_replying",
    fenBefore: bc4Frame.fenBefore,
    ply: 1,
    sideToMove: "black",
    target: null,
    mode: "blocked",
    source: "none",
  });
  const opponent = buildSurfacePack({ frame: opponentFrame, requestedMode: "assisted", showMoreRevealed: false });
  assert.equal(opponent.surface.mode, "opponent_replying");
  assert.equal(opponent.surface.targetUci, null);
  assert.equal(opponent.surface.actions.some((action) => action.kind === "reveal_target"), false);
  assert.equal(opponent.surface.visuals.some((visual) => visual.type === "move_arrow"), false);

  const terminalFrame = buildCurrentInstructionFrame({
    kind: "terminal",
    fenBefore: bc4Frame.fenBefore,
    ply: 2,
    sideToMove: "white",
    target: null,
    mode: "terminal",
    source: "terminal",
  });
  const terminal = buildSurfacePack({ frame: terminalFrame, requestedMode: "assisted", showMoreRevealed: false });
  assert.equal(terminal.surface.mode, "terminal");
  assert.equal(terminal.surface.targetUci, null);
  assert.equal(terminal.surface.actions.some((action) => action.kind === "reveal_target"), false);
  assert.equal(terminal.surface.visuals.some((visual) => visual.type === "move_arrow"), false);

  const graph = assistedBc4.graph;
  const blockedCompiled = {
    ...assistedBc4.compiled,
    targetUci: "g1f3",
    assisted: { ...assistedBc4.compiled.assisted, body: "Play Bc4 from f1 to c4" },
  };
  const blockedSafety = runCoachSafetyGate({ frame: bc4Frame, graph, compiled: blockedCompiled, activatedConcepts: assistedBc4.concepts.activated });
  const blockedSurface = buildVisibleTeachingSurface({
    frame: bc4Frame,
    graph,
    safetyOutput: blockedSafety,
    requestedMode: "assisted",
    showMoreRevealed: false,
  });
  assert.equal(blockedSafety.result.allowed, false);
  assert.equal(blockedSurface.mode, "blocked");
  assert.equal(blockedSurface.visuals.length, 0);
  assert.equal(hasLeak(`${blockedSurface.copy.title} ${blockedSurface.copy.body}`, ["Bc4", "f1c4", "f1", "c4", "bishop"]), false);
  assert.equal(blockedSurface.copy.body.includes("Play Bc4 from f1 to c4"), false);
  const strongClaimBlockedSafety = runCoachSafetyGate({
    frame: bc4Frame,
    graph,
    compiled: {
      ...assistedBc4.compiled,
      assisted: { ...assistedBc4.compiled.assisted, body: "This is the best move and wins material by force." },
      showMore: { ...assistedBc4.compiled.showMore, body: "This is the best move and wins material by force." },
    },
    activatedConcepts: assistedBc4.concepts.activated,
  });
  const strongClaimBlockedSurface = buildVisibleTeachingSurface({
    frame: bc4Frame,
    graph,
    safetyOutput: strongClaimBlockedSafety,
    requestedMode: "assisted",
    showMoreRevealed: false,
  });
  assert.equal(strongClaimBlockedSurface.mode, "assisted");
  assert.equal(strongClaimBlockedSurface.targetUci, "f1c4");
  assert.equal(strongClaimBlockedSurface.safety.blocked, false);
  assert.equal(strongClaimBlockedSurface.safety.recoveredBySafeTeachingCopy, true);
  assert.equal(strongClaimBlockedSurface.copy.title.includes("Safety Fallback"), false);
  assert.equal(strongClaimBlockedSurface.copy.title.includes("Safety Blocked"), false);
  assert.equal(strongClaimBlockedSurface.copy.body.includes("No move-specific coaching is available"), false);
  assert.equal(strongClaimBlockedSurface.copy.body.includes("Think about the safest improving move here."), false);
  assert.equal(strongClaimBlockedSurface.copy.body.toLowerCase().includes("best move"), false);

  assert.equal(
    blockedSurface.debug.targetVisualUcis.every((uci) => uci === blockedSurface.targetUci),
    true,
  );

  const e4 = buildSurfacePack({
    frame: makeGuidedFrame({
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      uci: "e2e4",
      san: "e4",
      pieceType: "pawn",
    }),
    requestedMode: "assisted",
    showMoreRevealed: false,
  });
  const nf3Chain = buildSurfacePack({ frame: nf3Frame, requestedMode: "assisted", showMoreRevealed: false });
  const d4Chain = buildSurfacePack({
    frame: makeGuidedFrame({
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      uci: "d2d4",
      san: "d4",
      pieceType: "p",
    }),
    requestedMode: "assisted",
    showMoreRevealed: false,
  });
  const bc4Chain = buildSurfacePack({ frame: bc4Frame, requestedMode: "assisted", showMoreRevealed: false });
  const castle = buildSurfacePack({
    frame: makeGuidedFrame({
      fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 6 4",
      uci: "e1g1",
      san: "O-O",
      pieceType: "king",
    }),
    requestedMode: "assisted",
    showMoreRevealed: false,
  });
  assert.equal(Boolean(e4.surface.frameKey && nf3Chain.surface.frameKey && bc4Chain.surface.frameKey && castle.surface.frameKey), true);
  assert.equal(d4Chain.surface.mode, "assisted");
  assert.equal(d4Chain.surface.safety.blocked, false);
  assert.equal(d4Chain.surface.copy.title.toLowerCase().includes("safety blocked"), false);
  assert.equal(d4Chain.surface.copy.body.toLowerCase().includes("no move-specific coaching is available"), false);
  assert.equal(d4Chain.surface.copy.body.toLowerCase().includes("d4") || d4Chain.surface.copy.body.toLowerCase().includes("center"), true);
}

testVisibleTeachingSurface();
console.log("visibleTeachingSurface ok");
