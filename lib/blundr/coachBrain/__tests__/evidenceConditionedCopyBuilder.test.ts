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

  // Null-safety hotfix tests for verifiedMoveFallback (via buildCoachCopyFromEvidence with no claims to force fallback path)
  // Base packet with allowedClaims=[] to hit verifiedMoveFallback; override moveFacts for crash cases.
  const baseForFallback: any = {
    ...bc4Packet,
    allowedClaims: [],
    moveFacts: {
      legal: true,
      san: null,
      uci: "e2e4",
      movedPiece: null,
      isCapture: false,
      isCheck: false,
      isCastle: false,
      isPromotion: false,
      movedPieceAttacksAfter: [],
      fenAfter: fen,
      attackedSquaresBefore: [],
      attackedSquaresAfter: [],
      newlyAttackedSquares: [],
      defendedSquaresBefore: [],
      defendedSquaresAfter: [],
      targetSquaresActuallyAttacked: [],
      centerSquaresAffected: [],
    },
    exactMoveAllowed: false,
  };

  // move.san = null does not crash
  const nullSanRes = buildCoachCopyFromEvidence({ packet: { ...baseForFallback, moveFacts: { ...baseForFallback.moveFacts, san: null } }, interaction: "none" });
  assert.equal((nullSanRes.body ?? "").includes("legal continuation") || (nullSanRes.body ?? "").includes("This move"), true);

  // move.san = undefined does not crash
  const undefSanRes = buildCoachCopyFromEvidence({ packet: { ...baseForFallback, moveFacts: { ...baseForFallback.moveFacts, san: undefined } }, interaction: "none" });
  assert.equal((undefSanRes.body ?? "").includes("available"), true);

  // move.san = "" does not crash
  const emptySanRes = buildCoachCopyFromEvidence({ packet: { ...baseForFallback, moveFacts: { ...baseForFallback.moveFacts, san: "" } }, interaction: "none" });
  assert.equal((emptySanRes.body ?? "").includes("available"), true);

  // partial move object does not crash
  const partialRes = buildCoachCopyFromEvidence({ packet: { ...baseForFallback, moveFacts: { legal: true } }, interaction: "none" });
  assert.equal((partialRes.body ?? "").includes("legal continuation"), true);

  // checkmate branch still works when san is valid string containing "#"
  const matePacket: any = {
    ...baseForFallback,
    moveFacts: {
      ...baseForFallback.moveFacts,
      san: "Qh7#",
      legal: true,
      isCheck: true,
      movedPiece: { type: "q", color: "w", from: "h5", to: "h7" },
      movedPieceAttacksAfter: [],
    },
  };
  const mateRes = buildCoachCopyFromEvidence({ packet: matePacket, interaction: "none" });
  assert.equal((mateRes.body ?? "").includes("checkmate"), true);
  assert.equal((mateRes.body ?? "").includes("Qh7#"), true);

  // capture/check/castle branches still work when fields present
  const capCheckPacket: any = {
    ...baseForFallback,
    moveFacts: {
      ...baseForFallback.moveFacts,
      san: "Bxf7+",
      legal: true,
      isCapture: true,
      isCheck: true,
      movedPiece: { type: "b", color: "w", from: "c4", to: "f7" },
    },
  };
  const capCheckRes = buildCoachCopyFromEvidence({ packet: capCheckPacket, interaction: "none" });
  assert.equal((capCheckRes.body ?? "").includes("captures on f7 with check"), true);

  const castlePacket: any = {
    ...baseForFallback,
    moveFacts: {
      ...baseForFallback.moveFacts,
      san: "O-O",
      legal: true,
      isCastle: true,
      movedPiece: { type: "k", color: "w", from: "e1", to: "g1" },
    },
  };
  const castleRes = buildCoachCopyFromEvidence({ packet: castlePacket, interaction: "none" });
  assert.equal((castleRes.body ?? "").includes("brings the king to safety"), true);
}
