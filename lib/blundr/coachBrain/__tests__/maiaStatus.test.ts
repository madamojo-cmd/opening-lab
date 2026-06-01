import assert from "node:assert/strict";
import { buildCoachEvidencePacket } from "../coachEvidenceBuilder";
import { buildCoachCopyFromEvidence } from "../evidenceConditionedCopyBuilder";

export function testMaiaStatus(): void {
  const fen = "r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQK2R w KQkq - 0 6";
  const packet = buildCoachEvidencePacket({
    frameId: "10",
    trainerFrameId: "10",
    fen,
    viewMode: "assisted",
    trainingMode: "continuation",
    bookStatus: "out_of_book",
  });
  assert.equal(packet.maiaSupport.status, "unavailable");
  const copy = buildCoachCopyFromEvidence({ packet, interaction: "show_plan" });
  const text = `${copy.title} ${copy.body ?? ""}`.toLowerCase();
  assert.equal(text.includes("maia"), false);
}
