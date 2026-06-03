import assert from "node:assert/strict";

import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
import { activateTeachingConcepts } from "../../lib/blundr/concepts/dynamicConceptActivator";
import {
  teachingConceptRegistry,
  validateTeachingConceptRegistry,
} from "../../lib/blundr/concepts/teachingConceptRegistry";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { lockInstructionTarget } from "../../lib/blundr/runtime/instructionFrameLock";

const STRONG_TERMS = [
  "best",
  "strongest",
  "forced",
  "only move",
  "wins",
  "winning",
  "mate",
  "checkmate",
  "trap",
  "refutes",
  "blunder",
];

function buildBc4Graph() {
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
  return buildEvidenceGraph({ frame, openingKey: "italian_game", openingName: "Italian Game" });
}

export function testTeachingConceptRegistry(): void {
  const validation = validateTeachingConceptRegistry();
  assert.equal(validation.valid, true, validation.issues.join("\n"));
  assert.equal(validation.conceptCount >= 80, true);
  assert.equal(validation.conceptCount, 130);

  const idSet = new Set(teachingConceptRegistry.map((concept) => concept.id));
  assert.equal(idSet.size, teachingConceptRegistry.length);

  for (const concept of teachingConceptRegistry) {
    assert.equal(Boolean(concept.label), true, `${concept.id}: missing label`);
    assert.equal(Boolean(concept.family), true, `${concept.id}: missing family`);
    assert.equal(Boolean(concept.summary), true, `${concept.id}: missing summary`);
    assert.equal(concept.requiredEvidence.claimTypes.length > 0, true, `${concept.id}: missing required claim types`);
    assert.equal(Array.isArray(concept.forbiddenWithoutEvidence), true, `${concept.id}: forbiddenWithoutEvidence missing`);
    assert.equal(concept.plainHintTemplate.template.trim().length > 0, true, `${concept.id}: empty plain template`);
    assert.equal(concept.assistedTemplate.template.trim().length > 0, true, `${concept.id}: empty assisted template`);
    assert.equal(concept.showMoreTemplate.template.trim().length > 0, true, `${concept.id}: empty showMore template`);

    const textBlob = `${concept.label} ${concept.summary} ${concept.plainHintTemplate.template} ${concept.assistedTemplate.template} ${concept.showMoreTemplate.template}`.toLowerCase();
    const hasStrongTerm = STRONG_TERMS.some((term) => textBlob.includes(term));
    if (hasStrongTerm) {
      assert.equal(concept.forbiddenWithoutEvidence.length > 0, true, `${concept.id}: strong text missing forbiddenWithoutEvidence`);
    }

    if (concept.plainHintTemplate.leakRisk === "high") {
      const low = concept.plainHintTemplate.template.toLowerCase();
      assert.equal(low.includes("{targetsan}") || low.includes("{targetuci}") || low.includes("{from}") || low.includes("{to}"), false, `${concept.id}: high leak plain template leaks target slots`);
    }
  }

  const graph = buildBc4Graph();
  const activated = activateTeachingConcepts({ graph, mode: "assisted", maxConcepts: 50 });
  const engineRequired = activated.activated.filter((entry) => entry.concept.safety.requiresEngineEvidence);
  assert.equal(engineRequired.length, 0);
}

testTeachingConceptRegistry();
console.log("teachingConceptRegistry ok");
