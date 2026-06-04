import assert from "node:assert/strict";

import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
import { compileCoachFrame } from "../../lib/blundr/coachCompiler/compileCoachFrame";
import { activateTeachingConcepts } from "../../lib/blundr/concepts/dynamicConceptActivator";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { lockInstructionTarget } from "../../lib/blundr/runtime/instructionFrameLock";

export function testRevealTargetSourceContract(): void {
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
      reason: "test",
    }),
    mode: "guided",
    source: "opening_tree",
  });

  const graph = buildEvidenceGraph({ frame, openingKey: "italian_game", openingName: "Italian Game" });
  const concepts = activateTeachingConcepts({ graph, mode: "assisted", maxConcepts: 20 });
  const compiled = compileCoachFrame({
    frame,
    graph,
    activatedConcepts: concepts.activated,
    suppressedConceptIds: concepts.suppressed.map((entry) => entry.conceptId),
  });

  assert.equal(compiled.revealAction.targetUci, frame.target?.uci ?? null);
  assert.equal(compiled.revealAction.kind, "reveal_target");

  const staleGraph = { ...graph, targetUci: "g1f3" };
  const staleCompiled = compileCoachFrame({
    frame,
    graph: staleGraph,
    activatedConcepts: concepts.activated,
    suppressedConceptIds: [],
  });

  assert.equal(staleCompiled.revealAction.targetUci, frame.target?.uci ?? null);
  assert.equal(staleCompiled.targetUci, frame.target?.uci ?? null);

  const terminalFrame = buildCurrentInstructionFrame({
    kind: "terminal",
    fenBefore: frame.fenBefore,
    ply: 7,
    sideToMove: "white",
    target: null,
    mode: "terminal",
    source: "terminal",
  });

  const terminalGraph = buildEvidenceGraph({ frame: terminalFrame });
  const terminalCompiled = compileCoachFrame({ frame: terminalFrame, graph: terminalGraph, activatedConcepts: [] });

  assert.equal(terminalCompiled.revealAction.targetUci, null);
  assert.equal(terminalCompiled.revealAction.kind, "none");
}

testRevealTargetSourceContract();
console.log("revealTargetSourceContract ok");
