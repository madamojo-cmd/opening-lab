import assert from "node:assert/strict";

import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
import { compileCoachFrame } from "../../lib/blundr/coachCompiler/compileCoachFrame";
import { activateTeachingConcepts } from "../../lib/blundr/concepts/dynamicConceptActivator";
import { buildVisibleTeachingSurface } from "../../lib/blundr/presentation/buildVisibleTeachingSurface";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { lockInstructionTarget } from "../../lib/blundr/runtime/instructionFrameLock";
import { runCoachSafetyGate } from "../../lib/blundr/safety/coachSafetyGate";

function buildTargetFrame(input: {
  fen: string;
  uci: string;
  san: string;
  pieceType: "pawn" | "knight" | "bishop" | "rook" | "queen" | "king";
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
      reason: "smoke",
    }),
    mode: "guided",
    source: "opening_tree",
  });
}

function fullChain(input: {
  frame: ReturnType<typeof buildCurrentInstructionFrame>;
  opening?: { openingKey?: string; openingName?: string };
  mode?: "assisted" | "plain" | "show_more";
  requestedMode?: "assisted" | "plain";
  showMoreRevealed?: boolean;
}) {
  const graph = buildEvidenceGraph({
    frame: input.frame,
    openingKey: input.opening?.openingKey,
    openingName: input.opening?.openingName,
  });
  const concepts = activateTeachingConcepts({ graph, mode: input.mode ?? "assisted", maxConcepts: 20 });
  const compiled = compileCoachFrame({
    frame: input.frame,
    graph,
    activatedConcepts: concepts.activated,
    suppressedConceptIds: concepts.suppressed.map((s) => s.conceptId),
  });
  const gated = runCoachSafetyGate({
    frame: input.frame,
    graph,
    compiled,
    activatedConcepts: concepts.activated,
  });
  const surface = buildVisibleTeachingSurface({
    frame: input.frame,
    graph,
    safetyOutput: gated,
    requestedMode: input.requestedMode ?? "assisted",
    showMoreRevealed: input.showMoreRevealed ?? false,
  });
  return { graph, concepts, compiled, gated, surface };
}

function hasLeak(text: string, tokens: string[]): boolean {
  const lower = text.toLowerCase();
  return tokens.some((token) => lower.includes(token.toLowerCase()));
}

export function testLiveChainSmoke(): void {
  // 1) Italian e4
  const e4Frame = buildTargetFrame({
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    uci: "e2e4",
    san: "e4",
    pieceType: "pawn",
  });
  const e4 = fullChain({ frame: e4Frame, opening: { openingKey: "italian_game", openingName: "Italian Game" } });
  assert.equal(e4.graph.targetUci, e4Frame.target?.uci ?? null);
  assert.equal(
    e4.concepts.activated.some((c) => c.conceptId.includes("center") || c.conceptId.includes("pawn") || c.conceptId.includes("develop")),
    true,
  );
  assert.equal(e4.compiled.targetUci, e4Frame.target?.uci ?? null);
  assert.equal(e4.gated.result.allowed, true);
  assert.equal(e4.gated.safeFrame.targetUci, "e2e4");
  assert.equal(e4.surface.targetUci, "e2e4");

  // 2) Italian Nf3
  const nf3Frame = buildTargetFrame({
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    uci: "g1f3",
    san: "Nf3",
    pieceType: "knight",
  });
  const nf3 = fullChain({ frame: nf3Frame, opening: { openingKey: "italian_game", openingName: "Italian Game" } });
  assert.equal(nf3.concepts.activated.some((c) => c.conceptId === "knight_development"), true);
  assert.equal(nf3.concepts.activated.some((c) => c.conceptId === "bishop_development"), false);
  assert.equal(hasLeak(nf3.compiled.plain.body, ["Nf3", "g1", "f3", "knight"]), false);
  assert.equal(nf3.gated.result.allowed, true);

  // 3) Italian Bc4
  const bc4Frame = buildTargetFrame({
    fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 4 3",
    uci: "f1c4",
    san: "Bc4",
    pieceType: "bishop",
  });
  const bc4 = fullChain({ frame: bc4Frame, opening: { openingKey: "italian_game", openingName: "Italian Game" } });
  assert.equal(
    bc4.concepts.activated.some((c) => c.conceptId === "bishop_development" || c.conceptId === "italian_bishop_c4_pressure"),
    true,
  );
  assert.equal(bc4.concepts.activated.some((c) => c.conceptId === "knight_development"), false);
  assert.equal(bc4.compiled.targetUci, "f1c4");
  assert.equal(bc4.compiled.revealAction.targetUci, "f1c4");
  assert.equal(bc4.compiled.visualIntents.every((v) => v.targetUci === "f1c4"), true);
  assert.equal(hasLeak(bc4.compiled.plain.body, ["Bc4", "f1c4", "f1", "c4", "bishop"]), false);
  assert.equal(bc4.gated.result.allowed, true);
  assert.equal(bc4.surface.actions.some((action) => action.kind === "reveal_target" && action.targetUci === "f1c4"), true);

  // 4) Castling O-O
  const castleFrame = buildTargetFrame({
    fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 6 4",
    uci: "e1g1",
    san: "O-O",
    pieceType: "king",
  });
  const castle = fullChain({ frame: castleFrame });
  assert.equal(castle.concepts.activated.some((c) => c.conceptId === "kingside_castling" || c.conceptId === "king_safety"), true);
  assert.equal(castle.gated.result.allowed, true);

  // 5) Branch complete before Continue
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
  const branch = fullChain({ frame: branchFrame });
  assert.equal(branch.graph.targetUci, null);
  assert.equal(branch.compiled.targetUci, null);
  assert.equal(branch.compiled.revealAction.kind, "continue_from_here");
  assert.equal(branch.compiled.visualIntents.some((v) => v.type === "move_arrow"), false);
  assert.equal(branch.gated.result.allowed, true);
  assert.equal(branch.surface.mode, "branch_complete");
  assert.equal(branch.surface.actions.some((action) => action.kind === "continue_from_here"), true);

  // 6) Opponent replying
  const opponentFrame = buildCurrentInstructionFrame({
    kind: "opponent_replying",
    fenBefore: bc4Frame.fenBefore,
    ply: 1,
    sideToMove: "black",
    target: null,
    mode: "blocked",
    source: "none",
  });
  const opponent = fullChain({ frame: opponentFrame });
  assert.equal(opponent.compiled.targetUci, null);
  assert.equal(opponent.compiled.revealAction.kind, "none");
  assert.equal(opponent.compiled.visualIntents.length, 0);
  assert.equal(opponent.gated.result.allowed, true);
  assert.equal(opponent.surface.mode, "opponent_replying");
  assert.equal(opponent.surface.actions.some((action) => action.kind === "reveal_target"), false);

  // 7) Mismatch trap
  const mismatchCompiled = {
    ...bc4.compiled,
    targetUci: "g1f3",
    visualIntents: bc4.compiled.visualIntents.map((v, idx) => (idx === 0 ? { ...v, targetUci: "g1f3" } : v)),
  };
  const mismatchGate = runCoachSafetyGate({ frame: bc4Frame, graph: bc4.graph, compiled: mismatchCompiled, activatedConcepts: bc4.concepts.activated });
  assert.equal(mismatchGate.result.allowed, false);
  assert.equal(mismatchGate.safeFrame.visualIntents.length, 0);
  assert.equal(mismatchGate.safeFrame.revealAction.kind, "none");

  // 8) Plain leak trap
  const plainLeakCompiled = {
    ...bc4.compiled,
    plain: { ...bc4.compiled.plain, body: "Play Bc4 from f1 to c4 with the bishop" },
  };
  const plainLeakGate = runCoachSafetyGate({ frame: bc4Frame, graph: bc4.graph, compiled: plainLeakCompiled, activatedConcepts: bc4.concepts.activated });
  assert.equal(plainLeakGate.result.allowed, false);
  assert.equal(hasLeak(plainLeakGate.safeFrame.plain.body, ["Bc4", "f1", "c4", "bishop"]), false);
  const blockedSurface = buildVisibleTeachingSurface({
    frame: bc4Frame,
    graph: bc4.graph,
    safetyOutput: plainLeakGate,
    requestedMode: "assisted",
    showMoreRevealed: false,
  });
  assert.equal(blockedSurface.mode, "blocked");
  assert.equal(blockedSurface.visuals.length, 0);

  // 9) Unsupported strong claim trap
  const strongClaimCompiled = {
    ...bc4.compiled,
    assisted: { ...bc4.compiled.assisted, body: "This is the best move and wins material by force" },
  };
  const strongClaimGate = runCoachSafetyGate({ frame: bc4Frame, graph: bc4.graph, compiled: strongClaimCompiled, activatedConcepts: bc4.concepts.activated });
  assert.equal(strongClaimGate.result.allowed, false);
}

testLiveChainSmoke();
console.log("liveChainSmoke ok");
