import assert from "node:assert/strict";
import { buildCoachEvidencePacket } from "../coachEvidenceBuilder";
import { buildCoachCopyFromEvidence } from "../evidenceConditionedCopyBuilder";

function sentenceCount(text: string): number {
  return text.split(/(?<=[.!?])\s+/).filter(Boolean).length;
}

export function testPortionAndThemePolicy(): void {
  const fen = "r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQK2R w KQkq - 0 6";
  const packet = buildCoachEvidencePacket({
    frameId: "7",
    trainerFrameId: "7",
    fen,
    viewMode: "assisted",
    trainingMode: "restricted",
    bookStatus: "in_book",
    expectedMoveUci: "e1g1",
    expectedMoveSan: "O-O",
    repertoireMoves: ["e1g1", "c2c3"],
    trainingContext: { conceptId: "castle_for_safety" },
  });

  const volumetric = buildCoachCopyFromEvidence({ packet, interaction: "none", portionMetric: "volumetric" });
  assert.equal(sentenceCount(volumetric.body ?? "") <= 2, true);

  const weight = buildCoachCopyFromEvidence({ packet, interaction: "none", portionMetric: "weight" });
  const tokens = (weight.body ?? "").trim().split(/\s+/).filter(Boolean).length;
  assert.equal(tokens <= 60, true);

  const lower = (volumetric.body ?? "").toLowerCase();
  assert.equal(lower.includes("king") || lower.includes("center"), true);
}
