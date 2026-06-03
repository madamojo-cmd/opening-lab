import assert from "node:assert/strict";

import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
import { compileCoachFrame } from "../../lib/blundr/coachCompiler/compileCoachFrame";
import { activateTeachingConcepts } from "../../lib/blundr/concepts/dynamicConceptActivator";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { lockInstructionTarget } from "../../lib/blundr/runtime/instructionFrameLock";

function makeFrame(input: {
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
      reason: "test",
    }),
    mode: "guided",
    source: "opening_tree",
  });
}

function compileFor(frame: ReturnType<typeof makeFrame>, opening?: { openingKey?: string; openingName?: string }) {
  const graph = buildEvidenceGraph({ frame, openingKey: opening?.openingKey, openingName: opening?.openingName });
  const concepts = activateTeachingConcepts({ graph, mode: "assisted", maxConcepts: 20 });
  return {
    graph,
    concepts,
    compiled: compileCoachFrame({
      frame,
      graph,
      activatedConcepts: concepts.activated,
      suppressedConceptIds: concepts.suppressed.map((item) => item.conceptId),
    }),
  };
}

export function testCoachCompiler(): void {
  const bc4Frame = makeFrame({
    fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 4 3",
    uci: "f1c4",
    san: "Bc4",
    pieceType: "bishop",
  });
  const bc4 = compileFor(bc4Frame, { openingKey: "italian_game", openingName: "Italian Game" });
  assert.equal(bc4.compiled.targetUci, "f1c4");
  assert.equal(/bc4|bishop/i.test(`${bc4.compiled.assisted.title} ${bc4.compiled.assisted.body}`), true);
  assert.equal(/knight development/i.test(`${bc4.compiled.assisted.title} ${bc4.compiled.assisted.body}`), false);

  const nf3Frame = makeFrame({
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    uci: "g1f3",
    san: "Nf3",
    pieceType: "knight",
  });
  const nf3 = compileFor(nf3Frame);
  assert.equal(nf3.compiled.targetUci, "g1f3");
  assert.equal(/knight|nf3/i.test(`${nf3.compiled.assisted.title} ${nf3.compiled.assisted.body}`), true);
  assert.equal(/bishop|bc4/i.test(`${nf3.compiled.assisted.title} ${nf3.compiled.assisted.body}`), false);

  const plain = bc4.compiled.plain.body.toLowerCase();
  assert.equal(plain.includes("bc4"), false);
  assert.equal(plain.includes("f1c4"), false);
  assert.equal(plain.includes("f1"), false);
  assert.equal(plain.includes("c4"), false);
  assert.equal(plain.includes("bishop"), false);

  assert.equal(bc4.compiled.targetUci, bc4Frame.target?.uci ?? null);
  assert.equal(bc4.compiled.revealAction.targetUci, bc4Frame.target?.uci ?? null);
  assert.equal(bc4.compiled.visualIntents.every((intent) => intent.targetUci === bc4Frame.target?.uci), true);

  const branchComplete = buildCurrentInstructionFrame({
    kind: "branch_complete",
    fenBefore: bc4Frame.fenBefore,
    ply: 1,
    sideToMove: "black",
    target: null,
    mode: "blocked",
    source: "none",
    branchComplete: { isComplete: true, continueFromHereAvailable: true },
  });
  const branchGraph = buildEvidenceGraph({ frame: branchComplete });
  const branchConcepts = activateTeachingConcepts({ graph: branchGraph, mode: "assisted", maxConcepts: 10 });
  const branchCompiled = compileCoachFrame({ frame: branchComplete, graph: branchGraph, activatedConcepts: branchConcepts.activated });
  assert.equal(branchCompiled.revealAction.kind, "continue_from_here");
  assert.equal(branchCompiled.targetUci, null);

  const opponent = buildCurrentInstructionFrame({
    kind: "opponent_replying",
    fenBefore: bc4Frame.fenBefore,
    ply: 1,
    sideToMove: "black",
    target: null,
    mode: "blocked",
    source: "none",
  });
  const opponentGraph = buildEvidenceGraph({ frame: opponent });
  const opponentCompiled = compileCoachFrame({ frame: opponent, graph: opponentGraph, activatedConcepts: [] });
  assert.equal(opponentCompiled.revealAction.kind, "none");
  assert.equal(opponentCompiled.visualIntents.length, 0);

  const terminal = buildCurrentInstructionFrame({
    kind: "terminal",
    fenBefore: bc4Frame.fenBefore,
    ply: 2,
    sideToMove: "white",
    target: null,
    mode: "terminal",
    source: "terminal",
  });
  const terminalGraph = buildEvidenceGraph({ frame: terminal });
  const terminalCompiled = compileCoachFrame({ frame: terminal, graph: terminalGraph, activatedConcepts: [] });
  assert.equal(terminalCompiled.revealAction.kind, "none");
  assert.equal(terminalCompiled.visualIntents.length, 0);

  assert.equal(/wins material/i.test(`${bc4.compiled.assisted.body} ${bc4.compiled.showMore.body}`), false);
  assert.equal(/best move/i.test(`${bc4.compiled.assisted.body} ${bc4.compiled.showMore.body}`), false);

  const beforeUci = bc4Frame.target?.uci;
  compileCoachFrame({ frame: bc4Frame, graph: bc4.graph, activatedConcepts: bc4.concepts.activated });
  assert.equal(bc4Frame.target?.uci, beforeUci);

  const mismatchedGraph = { ...bc4.graph, targetUci: "g1f3" };
  const mismatchCompiled = compileCoachFrame({
    frame: bc4Frame,
    graph: mismatchedGraph,
    activatedConcepts: bc4.concepts.activated,
  });
  assert.equal(mismatchCompiled.targetUci, bc4Frame.target?.uci ?? null);
  assert.equal(
    mismatchCompiled.safetyPrecheck.criticalIssues.some((issue) => issue.includes("frame/graph target mismatch")),
    true,
  );

  const assistedTargets = bc4.compiled.visualIntents.filter((intent) => intent.displayModes.includes("assisted")).map((intent) => intent.targetUci);
  const showTargets = bc4.compiled.visualIntents.filter((intent) => intent.displayModes.includes("show_more")).map((intent) => intent.targetUci);
  assert.equal(assistedTargets.length > 0 && showTargets.length > 0, true);
  assert.equal(new Set(assistedTargets).size, 1);
  assert.equal(new Set(showTargets).size, 1);
  assert.equal(assistedTargets[0], showTargets[0]);
}

testCoachCompiler();
console.log("coachCompiler ok");
