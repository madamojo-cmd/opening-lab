import assert from "node:assert/strict";

import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
import { compileCoachFrame } from "../../lib/blundr/coachCompiler/compileCoachFrame";
import { activateTeachingConcepts } from "../../lib/blundr/concepts/dynamicConceptActivator";
import { buildVisibleTeachingSurface } from "../../lib/blundr/presentation/buildVisibleTeachingSurface";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { createTargetMismatchIssue, lockInstructionTarget } from "../../lib/blundr/runtime/instructionFrameLock";
import { runCoachSafetyGate } from "../../lib/blundr/safety/coachSafetyGate";

export function testTargetInvariant(): void {
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
  const compiled = compileCoachFrame({ frame, graph, activatedConcepts: concepts.activated });

  assert.equal(compiled.targetUci, frame.target?.uci ?? null);
  assert.equal(compiled.revealAction.targetUci, frame.target?.uci ?? null);
  assert.equal(compiled.visualIntents.every((intent) => intent.targetUci === frame.target?.uci), true);
  assert.equal(compiled.showMore.body.toLowerCase().includes("bc4"), true);
  const safety = runCoachSafetyGate({ frame, graph, compiled, activatedConcepts: concepts.activated });
  assert.equal(safety.result.allowed, true);
  const surface = buildVisibleTeachingSurface({
    frame,
    graph,
    safetyOutput: safety,
    requestedMode: "assisted",
    showMoreRevealed: false,
  });
  assert.equal(surface.debug.targetVisualUcis.every((uci) => uci === surface.targetUci), true);

  const mismatch = createTargetMismatchIssue({ expected: "f1c4", actual: "g1f3", surface: "showMore" });
  assert.equal(mismatch.code, "target_source_ambiguous");
  assert.equal(mismatch.severity, "critical");
}

testTargetInvariant();
console.log("targetInvariant ok");
