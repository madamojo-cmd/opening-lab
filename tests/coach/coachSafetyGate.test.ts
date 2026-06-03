import assert from "node:assert/strict";

import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
import { compileCoachFrame } from "../../lib/blundr/coachCompiler/compileCoachFrame";
import { activateTeachingConcepts } from "../../lib/blundr/concepts/dynamicConceptActivator";
import { buildVisibleTeachingSurface } from "../../lib/blundr/presentation/buildVisibleTeachingSurface";
import { runCoachSafetyGate } from "../../lib/blundr/safety/coachSafetyGate";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { lockInstructionTarget } from "../../lib/blundr/runtime/instructionFrameLock";

function makeFrame(input: {
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

function compilePack(frame: ReturnType<typeof makeFrame>, opening?: { openingKey?: string; openingName?: string }) {
  const graph = buildEvidenceGraph({ frame, openingKey: opening?.openingKey, openingName: opening?.openingName });
  const concepts = activateTeachingConcepts({ graph, mode: "assisted", maxConcepts: 20 });
  const compiled = compileCoachFrame({ frame, graph, activatedConcepts: concepts.activated });
  return { frame, graph, concepts, compiled };
}

export function testCoachSafetyGate(): void {
  const bc4 = compilePack(
    makeFrame({
      fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 4 3",
      uci: "f1c4",
      san: "Bc4",
      pieceType: "bishop",
    }),
    { openingKey: "italian_game", openingName: "Italian Game" },
  );

  const valid = runCoachSafetyGate({ frame: bc4.frame, graph: bc4.graph, compiled: bc4.compiled, activatedConcepts: bc4.concepts.activated });
  assert.equal(valid.result.allowed, true);

  const badTarget = runCoachSafetyGate({
    frame: bc4.frame,
    graph: bc4.graph,
    compiled: { ...bc4.compiled, targetUci: "g1f3" },
    activatedConcepts: bc4.concepts.activated,
  });
  assert.equal(badTarget.result.allowed, false);
  assert.equal(badTarget.result.criticalIssues.some((i) => i.code === "compiler_target_mismatch"), true);

  const badVisual = runCoachSafetyGate({
    frame: bc4.frame,
    graph: bc4.graph,
    compiled: {
      ...bc4.compiled,
      visualIntents: bc4.compiled.visualIntents.map((v, idx) => (idx === 0 ? { ...v, targetUci: "g1f3" } : v)),
    },
    activatedConcepts: bc4.concepts.activated,
  });
  assert.equal(badVisual.result.allowed, false);
  assert.equal(badVisual.result.criticalIssues.some((i) => i.code === "visual_mismatch"), true);

  const badReveal = runCoachSafetyGate({
    frame: bc4.frame,
    graph: bc4.graph,
    compiled: { ...bc4.compiled, revealAction: { ...bc4.compiled.revealAction, targetUci: "g1f3" } },
    activatedConcepts: bc4.concepts.activated,
  });
  assert.equal(badReveal.result.allowed, false);
  assert.equal(badReveal.result.criticalIssues.some((i) => i.code === "reveal_mismatch"), true);

  const badGraph = runCoachSafetyGate({
    frame: bc4.frame,
    graph: { ...bc4.graph, targetUci: "g1f3" },
    compiled: bc4.compiled,
    activatedConcepts: bc4.concepts.activated,
  });
  assert.equal(badGraph.result.allowed, false);
  assert.equal(badGraph.result.criticalIssues.some((i) => i.code === "graph_target_mismatch"), true);

  const plainLeakSan = runCoachSafetyGate({
    frame: bc4.frame,
    graph: bc4.graph,
    compiled: { ...bc4.compiled, plain: { ...bc4.compiled.plain, body: "Play Bc4 now." } },
  });
  assert.equal(plainLeakSan.result.allowed, false);
  assert.equal(plainLeakSan.result.criticalIssues.some((i) => i.code === "plain_leak"), true);

  const plainLeakUci = runCoachSafetyGate({
    frame: bc4.frame,
    graph: bc4.graph,
    compiled: { ...bc4.compiled, plain: { ...bc4.compiled.plain, body: "Use f1c4." } },
  });
  assert.equal(plainLeakUci.result.allowed, false);

  const plainLeakSquares = runCoachSafetyGate({
    frame: bc4.frame,
    graph: bc4.graph,
    compiled: { ...bc4.compiled, plain: { ...bc4.compiled.plain, body: "Move from f1 to c4." } },
  });
  assert.equal(plainLeakSquares.result.allowed, false);

  const plainLeakPiece = runCoachSafetyGate({
    frame: bc4.frame,
    graph: bc4.graph,
    compiled: { ...bc4.compiled, plain: { ...bc4.compiled.plain, body: "Develop the bishop." } },
  });
  assert.equal(plainLeakPiece.result.allowed, false);

  const genericPlain = runCoachSafetyGate({
    frame: bc4.frame,
    graph: bc4.graph,
    compiled: { ...bc4.compiled, plain: { ...bc4.compiled.plain, body: "Focus on development and central control." } },
  });
  assert.equal(genericPlain.result.allowed, true);

  const strongBest = runCoachSafetyGate({
    frame: bc4.frame,
    graph: bc4.graph,
    compiled: {
      ...bc4.compiled,
      assisted: { ...bc4.compiled.assisted, body: "This is the best move." },
      showMore: { ...bc4.compiled.showMore, body: "This is the best move." },
    },
  });
  assert.equal(strongBest.result.allowed, true);
  assert.equal(strongBest.result.recoverableReasons.includes("claim_without_evidence"), true);
  assert.equal(strongBest.safeFrame.assisted.body.toLowerCase().includes("best"), false);

  const strongWin = runCoachSafetyGate({
    frame: bc4.frame,
    graph: bc4.graph,
    compiled: {
      ...bc4.compiled,
      assisted: { ...bc4.compiled.assisted, body: "This wins material immediately." },
      showMore: { ...bc4.compiled.showMore, body: "This wins material immediately." },
    },
  });
  assert.equal(strongWin.result.allowed, true);
  assert.equal(strongWin.safeFrame.assisted.body.toLowerCase().includes("wins"), false);

  const strongMate = runCoachSafetyGate({
    frame: bc4.frame,
    graph: bc4.graph,
    compiled: {
      ...bc4.compiled,
      assisted: { ...bc4.compiled.assisted, body: "This is a forced mate." },
      showMore: { ...bc4.compiled.showMore, body: "This is a forced mate." },
    },
  });
  assert.equal(strongMate.result.allowed, true);
  assert.equal(strongMate.safeFrame.showMore.body.toLowerCase().includes("forced mate"), false);

  const checkmateFrame = makeFrame({
    fen: "4k3/8/8/8/8/8/4Q3/4K3 w - - 0 1",
    uci: "e2e7",
    san: "Qe7+",
    pieceType: "queen",
  });
  const checkmateGraph = buildEvidenceGraph({ frame: checkmateFrame });
  const checkmateCompiled = compileCoachFrame({ frame: checkmateFrame, graph: checkmateGraph, activatedConcepts: [] });
  const withCheckmateWord = runCoachSafetyGate({
    frame: checkmateFrame,
    graph: { ...checkmateGraph, boardTruth: { ...checkmateGraph.boardTruth, isCheckmate: true } },
    compiled: {
      ...checkmateCompiled,
      plain: { ...checkmateCompiled.plain, body: "Focus on development and king safety." },
      showMore: { ...checkmateCompiled.showMore, body: "Qe7+ leads to checkmate." },
    },
  });
  assert.equal(withCheckmateWord.result.allowed, true);

  const engineLanguage = runCoachSafetyGate({
    frame: bc4.frame,
    graph: bc4.graph,
    compiled: {
      ...bc4.compiled,
      assisted: { ...bc4.compiled.assisted, body: "Stockfish says this is engine-approved." },
      showMore: { ...bc4.compiled.showMore, body: "Stockfish says this is engine-approved." },
    },
  });
  assert.equal(engineLanguage.result.allowed, true);
  assert.equal(engineLanguage.result.recoverableReasons.includes("claim_without_evidence"), true);
  assert.equal(engineLanguage.safeFrame.assisted.body.toLowerCase().includes("stockfish says"), false);

  const opponent = buildCurrentInstructionFrame({
    kind: "opponent_replying",
    fenBefore: bc4.frame.fenBefore,
    ply: 1,
    sideToMove: "black",
    target: null,
    mode: "blocked",
    source: "none",
  });
  const opponentGraph = buildEvidenceGraph({ frame: opponent });
  const opponentCompiled = compileCoachFrame({ frame: opponent, graph: opponentGraph, activatedConcepts: [] });

  const opponentReveal = runCoachSafetyGate({
    frame: opponent,
    graph: opponentGraph,
    compiled: { ...opponentCompiled, revealAction: { kind: "reveal_target", label: "Reveal", targetUci: "f1c4", targetSan: "Bc4" } },
  });
  assert.equal(opponentReveal.result.allowed, false);

  const opponentVisual = runCoachSafetyGate({
    frame: opponent,
    graph: opponentGraph,
    compiled: {
      ...opponentCompiled,
      visualIntents: [{
        id: "v1",
        type: "move_arrow",
        targetUci: "f1c4",
        from: "f1",
        to: "c4",
        evidenceClaimIds: [],
        displayModes: ["assisted", "show_more"],
        leakRisk: "low",
      }],
    },
  });
  assert.equal(opponentVisual.result.allowed, false);

  const branchComplete = buildCurrentInstructionFrame({
    kind: "branch_complete",
    fenBefore: bc4.frame.fenBefore,
    ply: 1,
    sideToMove: "black",
    target: null,
    mode: "blocked",
    source: "none",
    branchComplete: { isComplete: true, continueFromHereAvailable: true },
  });
  const branchGraph = buildEvidenceGraph({ frame: branchComplete });
  const branchCompiled = compileCoachFrame({ frame: branchComplete, graph: branchGraph, activatedConcepts: [] });
  const branchPass = runCoachSafetyGate({ frame: branchComplete, graph: branchGraph, compiled: branchCompiled });
  assert.equal(branchPass.result.allowed, true);
  assert.equal(branchPass.originalFrameBlocked, false);
  assert.equal(branchPass.safeFrame.plain.title.includes("Safety Fallback"), false);
  assert.equal(branchPass.safeFrame.revealAction.kind, "continue_from_here");

  const branchRevealBad = runCoachSafetyGate({
    frame: branchComplete,
    graph: branchGraph,
    compiled: { ...branchCompiled, revealAction: { kind: "reveal_target", label: "Reveal", targetUci: "f1c4", targetSan: "Bc4" } },
  });
  assert.equal(branchRevealBad.result.allowed, false);

  const terminal = buildCurrentInstructionFrame({
    kind: "terminal",
    fenBefore: bc4.frame.fenBefore,
    ply: 2,
    sideToMove: "white",
    target: null,
    mode: "terminal",
    source: "terminal",
  });
  const terminalGraph = buildEvidenceGraph({ frame: terminal });
  const terminalCompiled = compileCoachFrame({ frame: terminal, graph: terminalGraph, activatedConcepts: [] });
  const terminalVisualBad = runCoachSafetyGate({
    frame: terminal,
    graph: terminalGraph,
    compiled: {
      ...terminalCompiled,
      visualIntents: [{
        id: "v1",
        type: "move_arrow",
        targetUci: "f1c4",
        from: "f1",
        to: "c4",
        evidenceClaimIds: [],
        displayModes: ["assisted", "show_more"],
        leakRisk: "low",
      }],
    },
  });
  assert.equal(terminalVisualBad.result.allowed, false);

  const providerMismatchGraph = {
    ...bc4.graph,
    claims: [
      ...bc4.graph.claims,
      {
        ...bc4.graph.claims[0],
        id: "provider:mismatch",
        targetUci: "g1f3",
        provenance: [{ source: "stockfish", confidence: "high" as const }],
      },
    ],
  };
  const providerMismatch = runCoachSafetyGate({ frame: bc4.frame, graph: providerMismatchGraph, compiled: bc4.compiled });
  assert.equal(providerMismatch.result.allowed, false);
  assert.equal(providerMismatch.result.criticalIssues.some((i) => i.code === "provider_authority_violation"), true);

  assert.equal(providerMismatch.safeFrame.visualIntents.length, 0);
  assert.equal(providerMismatch.safeFrame.revealAction.kind, "none");
  const blockedSurface = buildVisibleTeachingSurface({
    frame: bc4.frame,
    graph: providerMismatchGraph,
    safetyOutput: providerMismatch,
    requestedMode: "assisted",
    showMoreRevealed: false,
  });
  assert.equal(blockedSurface.mode, "blocked");
  assert.equal(blockedSurface.visuals.length, 0);
  assert.equal(blockedSurface.actions.some((action) => action.kind === "reveal_target"), false);
  assert.equal(blockedSurface.targetUci, "f1c4");
  assert.equal(blockedSurface.copy.title.includes("Safety Fallback"), false);
  assert.equal(blockedSurface.copy.body.includes("Think about the safest improving move here."), false);

  assert.notEqual(providerMismatch.safeFrame, bc4.compiled);
  assert.equal(bc4.compiled.revealAction.kind, "reveal_target");

  // valid_knight_development_claim_validation_failed_recovers_to_teaching_copy
  const nc3 = compilePack(
    makeFrame({
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      uci: "b1c3",
      san: "Nc3",
      pieceType: "n",
    }),
    { openingKey: "italian_game", openingName: "Italian Game" },
  );
  const nc3Recoverable = runCoachSafetyGate({
    frame: nc3.frame,
    graph: nc3.graph,
    compiled: {
      ...nc3.compiled,
      assisted: { ...nc3.compiled.assisted, body: "This is the best development move." },
      showMore: { ...nc3.compiled.showMore, body: "This is the best development move." },
    },
    activatedConcepts: nc3.concepts.activated,
  });
  assert.equal(nc3Recoverable.result.allowed, true);
  assert.equal(nc3Recoverable.result.fatalReasons.length, 0);
  assert.equal(nc3Recoverable.result.recoverableReasons.includes("claim_without_evidence"), true);
  assert.equal(nc3Recoverable.safeFrame.targetUci, "b1c3");
  assert.equal(nc3Recoverable.safeFrame.assisted.title.includes("Nc3"), true);
  assert.equal(nc3Recoverable.safeFrame.assisted.title.toLowerCase().includes("develop the knight"), true);
  assert.equal(nc3Recoverable.safeFrame.assisted.body.toLowerCase().includes("move the knight to c3"), true);
  assert.equal(nc3Recoverable.safeFrame.assisted.title.includes("Safety Blocked"), false);
  assert.equal(nc3Recoverable.safeFrame.assisted.body.includes("No move-specific coaching is available"), false);
  const nc3Surface = buildVisibleTeachingSurface({
    frame: nc3.frame,
    graph: nc3.graph,
    safetyOutput: nc3Recoverable,
    requestedMode: "assisted",
    showMoreRevealed: false,
  });
  assert.equal(nc3Surface.mode, "assisted");
  assert.equal(nc3Surface.safety.blocked, false);
  assert.equal(nc3Surface.copy.title.includes("Safety Blocked"), false);
  assert.equal(nc3Surface.copy.body.includes("No move-specific coaching is available"), false);
}

testCoachSafetyGate();
console.log("coachSafetyGate ok");
