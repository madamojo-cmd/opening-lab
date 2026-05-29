import assert from "node:assert/strict";

import type { OpponentChoiceMemory } from "../opponentVariationMemory";
import { selectOpponentCandidateWithVariation } from "../opponentVariationPolicy";

function memory(branchKey: string, playedAt: number, openingId = "italian-white", positionKey = "fenA"): OpponentChoiceMemory {
  return {
    openingId,
    lineId: openingId,
    trainingMode: "restricted",
    positionKey,
    opponentMoveUci: branchKey.split("::")[1] ?? "",
    branchKey,
    playedAt,
  };
}

export function testOpponentVariationPolicy(): void {
  const context = { openingId: "italian-white", lineId: "italian-white", trainingMode: "restricted" as const, positionKey: "fenA" };
  const candidateA = { uci: "f8c5", san: "Bc5", branchKey: "fenA::f8c5", weight: 70, legal: true, supported: true };
  const candidateB = { uci: "f8e7", san: "Be7", branchKey: "fenA::f8e7", weight: 20, legal: true, supported: true };

  const a = selectOpponentCandidateWithVariation({
    context,
    candidates: [candidateA, candidateB],
    memory: [memory("fenA::f8c5", 1000)],
    rng: () => 0.01,
  });
  assert.ok(a);
  assert.equal(a?.selected.branchKey, "fenA::f8c5");

  const b = selectOpponentCandidateWithVariation({
    context,
    candidates: [candidateA, candidateB],
    memory: [memory("fenA::f8c5", 2000), memory("fenA::f8c5", 1000)],
    rng: () => 0.01,
  });
  assert.ok(b);
  assert.equal(b?.blockedThirdRepeatBranches.includes("fenA::f8c5"), true);
  assert.equal(b?.selected.branchKey, "fenA::f8e7");

  const c = selectOpponentCandidateWithVariation({
    context,
    candidates: [candidateA],
    memory: [memory("fenA::f8c5", 2000), memory("fenA::f8c5", 1000)],
    rng: () => 0.2,
  });
  assert.ok(c);
  assert.equal(c?.selected.branchKey, "fenA::f8c5");
  assert.equal(c?.opponentVariationReason, "no_supported_alternative");

  const d = selectOpponentCandidateWithVariation({
    context,
    candidates: [candidateA, candidateB],
    memory: [memory("fenA::f8c5", 2000), memory("fenA::f8e7", 1000)],
    rng: () => 0.01,
  });
  assert.ok(d);
  assert.equal(d?.selected.branchKey, "fenA::f8c5");

  const e = selectOpponentCandidateWithVariation({
    context,
    candidates: [candidateA, candidateB],
    memory: [memory("fenB::f8c5", 2000, "ruy-white", "fenB"), memory("fenB::f8c5", 1000, "ruy-white", "fenB")],
    rng: () => 0.01,
  });
  assert.ok(e);
  assert.equal(e?.blockedThirdRepeatBranches.length, 0);
  assert.equal(e?.selected.branchKey, "fenA::f8c5");
}
