import assert from "node:assert/strict";
import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
import { activateTeachingConcepts } from "../../lib/blundr/concepts/dynamicConceptActivator";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { lockInstructionTarget } from "../../lib/blundr/runtime/instructionFrameLock";

const STRONG_TERMS = [
  "best",
  "strongest",
  "wins",
  "winning",
  "forced",
  "only move",
  "mate",
  "checkmate",
  "blunder",
  "refutes",
  "trap",
];

function containsStrongTerm(text: string): boolean {
  const lower = text.toLowerCase();
  return STRONG_TERMS.some((term) => lower.includes(term));
}

function mayUseCopy(text: string, approvedClaimIds: string[]): boolean {
  if (!containsStrongTerm(text)) return true;
  return approvedClaimIds.length > 0;
}

export function testAntiHallucination(): void {
  const unsupported = "This is the best and only move, it refutes everything.";
  assert.equal(mayUseCopy(unsupported, []), false);

  const supported = "This is the best move in the current engine line.";
  assert.equal(mayUseCopy(supported, ["engine_claim_top1"]), true);

  const safeFallback = "This move improves piece activity and keeps your position solid.";
  assert.equal(mayUseCopy(safeFallback, []), true);


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
  const graph = buildEvidenceGraph({ frame });
  const textBlob = graph.claims.map((c) => c.textSafeSummary).join(" ").toLowerCase();
  assert.equal(textBlob.includes("wins material"), false);
  assert.equal(textBlob.includes("only move"), false);
  assert.equal(textBlob.includes("assisted"), false);

  const concepts = activateTeachingConcepts({ graph, mode: "assisted", maxConcepts: 40 });
  assert.equal(concepts.activated.some((c) => c.conceptId === "sacrifice_requires_proof"), false);
  assert.equal(concepts.activated.some((c) => c.conceptId === "mate_threat"), false);
}

testAntiHallucination();
console.log("antiHallucination ok");
