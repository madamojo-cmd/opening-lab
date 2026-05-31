import assert from "node:assert/strict";
import { buildCoachEvidencePacket } from "../coachEvidenceBuilder";
import { buildCoachCopyFromEvidence } from "../evidenceConditionedCopyBuilder";

export function testEvidenceConditionedCopyBuilder(): void {
  const fen = "r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQK2R w KQkq - 0 6";

  const bc4Packet = buildCoachEvidencePacket({
    frameId: "70",
    trainerFrameId: "70",
    fen,
    viewMode: "assisted",
    trainingMode: "restricted",
    bookStatus: "in_book",
    expectedMoveUci: "c4f7",
    expectedMoveSan: "Bxf7+",
    repertoireMoves: ["c4f7"],
  });
  const bc4 = buildCoachCopyFromEvidence({ packet: bc4Packet, interaction: "none" });
  assert.equal((bc4.body ?? "").toLowerCase().includes("f7"), true);

  const noF7Packet = buildCoachEvidencePacket({
    frameId: "70",
    trainerFrameId: "70",
    fen,
    viewMode: "assisted",
    trainingMode: "restricted",
    bookStatus: "in_book",
    expectedMoveUci: "c4e2",
    repertoireMoves: ["c4e2"],
  });
  const noF7 = buildCoachCopyFromEvidence({ packet: noF7Packet, interaction: "none" });
  assert.equal((noF7.body ?? "").toLowerCase().includes("f7"), false);

  const plainPrompt = buildCoachCopyFromEvidence({
    packet: { ...bc4Packet, viewMode: "plain", exactMoveAllowed: false },
    interaction: "none",
  });
  assert.equal((plainPrompt.body ?? "").toLowerCase().includes("bxf7"), false);

  const hint = buildCoachCopyFromEvidence({
    packet: { ...bc4Packet, viewMode: "plain", exactMoveAllowed: false },
    interaction: "hint",
  });
  assert.equal((hint.hint ?? "").toLowerCase().includes("bxf7"), false);

  const answer = buildCoachCopyFromEvidence({
    packet: { ...bc4Packet, viewMode: "plain", exactMoveAllowed: true },
    interaction: "answer",
  });
  assert.equal(Boolean(answer.givesAnswer), true);
  assert.equal((answer.body ?? "").toLowerCase().includes("play"), true);

  const pending = buildCoachCopyFromEvidence({
    packet: { ...bc4Packet, trainingMode: "continuation", engineSupport: { ...bc4Packet.engineSupport, status: "pending" }, exactMoveAllowed: false },
    interaction: "show_plan",
  });
  assert.equal((pending.body ?? "").toLowerCase().includes("checking"), true);

  const continued = buildCoachCopyFromEvidence({
    packet: { ...bc4Packet, trainingMode: "continuation", viewMode: "freeplay", exactMoveAllowed: true },
    interaction: "none",
  });
  assert.equal(continued.buttons.includes("show_move"), true);
}
