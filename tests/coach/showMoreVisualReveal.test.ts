import assert from "node:assert/strict";

import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
import { compileCoachFrame } from "../../lib/blundr/coachCompiler/compileCoachFrame";
import { activateTeachingConcepts } from "../../lib/blundr/concepts/dynamicConceptActivator";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { lockInstructionTarget } from "../../lib/blundr/runtime/instructionFrameLock";

export function testShowMoreVisualReveal(): void {
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
  const concepts = activateTeachingConcepts({ graph, mode: "show_more", maxConcepts: 20 });
  const compiled = compileCoachFrame({ frame, graph, activatedConcepts: concepts.activated });

  assert.equal(compiled.revealAction.targetUci, frame.target?.uci ?? null);
  assert.equal(compiled.visualIntents.every((intent) => intent.targetUci === frame.target?.uci), true);
  assert.equal(compiled.visualIntents.every((intent) => intent.displayModes.includes("assisted") && intent.displayModes.includes("show_more")), true);
}

testShowMoreVisualReveal();
console.log("showMoreVisualReveal ok");
