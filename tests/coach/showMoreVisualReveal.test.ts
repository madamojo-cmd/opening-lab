import assert from "node:assert/strict";

import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
import { compileCoachFrame } from "../../lib/blundr/coachCompiler/compileCoachFrame";
import { activateTeachingConcepts } from "../../lib/blundr/concepts/dynamicConceptActivator";
import { buildVisibleTeachingSurface } from "../../lib/blundr/presentation/buildVisibleTeachingSurface";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { lockInstructionTarget } from "../../lib/blundr/runtime/instructionFrameLock";
import { runCoachSafetyGate } from "../../lib/blundr/safety/coachSafetyGate";

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
  const safety = runCoachSafetyGate({ frame, graph, compiled, activatedConcepts: concepts.activated });
  assert.equal(safety.result.allowed, true);
  const assistedSurface = buildVisibleTeachingSurface({
    frame,
    graph,
    safetyOutput: safety,
    requestedMode: "assisted",
    showMoreRevealed: false,
  });
  const plainShowMoreSurface = buildVisibleTeachingSurface({
    frame,
    graph,
    safetyOutput: safety,
    requestedMode: "plain",
    showMoreRevealed: true,
  });
  assert.equal(plainShowMoreSurface.targetUci, assistedSurface.targetUci);
  assert.deepEqual(
    plainShowMoreSurface.visuals.map((visual) => `${visual.id}:${visual.targetUci}:${visual.type}`),
    assistedSurface.visuals.map((visual) => `${visual.id}:${visual.targetUci}:${visual.type}`),
  );
}

testShowMoreVisualReveal();
console.log("showMoreVisualReveal ok");
