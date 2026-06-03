import assert from "node:assert/strict";
import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
import { activateTeachingConcepts } from "../../lib/blundr/concepts/dynamicConceptActivator";
import { teachingConceptRegistry } from "../../lib/blundr/concepts/teachingConceptRegistry";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { lockInstructionTarget } from "../../lib/blundr/runtime/instructionFrameLock";

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
}

testPlainLeak();
console.log("plainLeak ok");
