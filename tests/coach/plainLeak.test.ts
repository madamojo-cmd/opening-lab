import assert from "node:assert/strict";
import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
import { compileCoachFrame } from "../../lib/blundr/coachCompiler/compileCoachFrame";
import { activateTeachingConcepts } from "../../lib/blundr/concepts/dynamicConceptActivator";
import { teachingConceptRegistry } from "../../lib/blundr/concepts/teachingConceptRegistry";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { lockInstructionTarget } from "../../lib/blundr/runtime/instructionFrameLock";
import { runCoachSafetyGate } from "../../lib/blundr/safety/coachSafetyGate";

function containsForbiddenLeak(text: string, forbiddenTerms: string[]): boolean {
  const lower = text.toLowerCase();
  return forbiddenTerms.some((term) => lower.includes(term.toLowerCase()));
}

export function testPlainLeak(): void {
  const forbidden = ["Bc4", "f1c4", "f1", "c4", "bishop", "show answer"];

  const safeHint = "Find a move that develops a piece and improves pressure.";
  assert.equal(containsForbiddenLeak(safeHint, forbidden), false);

  const leakingHint = "Play Bc4 now, moving the bishop from f1 to c4.";
  assert.equal(containsForbiddenLeak(leakingHint, forbidden), true);

  const forbiddenProviderTerms = ["best", "strongest", "forced", "only move", "checkmate"];
  const safeProviderHint = "This move supports your position and keeps options flexible.";
  assert.equal(containsForbiddenLeak(safeProviderHint, forbiddenProviderTerms), false);

  const highLeakTemplatesAreSafe = teachingConceptRegistry
    .filter((concept) => concept.plainHintTemplate.leakRisk === "high")
    .every((concept) => {
      const low = concept.plainHintTemplate.template.toLowerCase();
      return !low.includes("{targetsan}") && !low.includes("{targetuci}") && !low.includes("{from}") && !low.includes("{to}");
    });
  assert.equal(highLeakTemplatesAreSafe, true);

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
  const plainActivated = activateTeachingConcepts({ graph, mode: "plain", maxConcepts: 40 });
  assert.equal(plainActivated.activated.some((entry) => entry.conceptId === "show_more_reveal"), false);

  const assistedConcepts = activateTeachingConcepts({ graph, mode: "assisted", maxConcepts: 20 });
  const compiled = compileCoachFrame({ frame, graph, activatedConcepts: assistedConcepts.activated });
  const compiledPlain = compiled.plain.body.toLowerCase();
  assert.equal(compiledPlain.includes("bc4"), false);
  assert.equal(compiledPlain.includes("f1c4"), false);
  assert.equal(compiledPlain.includes("f1"), false);
  assert.equal(compiledPlain.includes("c4"), false);
  assert.equal(compiledPlain.includes("bishop"), false);

  const gatePass = runCoachSafetyGate({ frame, graph, compiled, activatedConcepts: assistedConcepts.activated });
  assert.equal(gatePass.result.allowed, true);

  const leaked = {
    ...compiled,
    plain: { ...compiled.plain, body: "Play Bc4 by moving the bishop from f1 to c4." },
  };
  const gateLeak = runCoachSafetyGate({ frame, graph, compiled: leaked, activatedConcepts: assistedConcepts.activated });
  assert.equal(gateLeak.result.allowed, false);
  assert.equal(gateLeak.result.criticalIssues.some((i) => i.code === "plain_leak"), true);
}

testPlainLeak();
console.log("plainLeak ok");
