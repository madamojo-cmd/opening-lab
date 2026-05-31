import assert from "node:assert/strict";
import { buildCoachEvidencePacket } from "../coachEvidenceBuilder";
import {
  canClaimBishopPressuresSquare,
  canClaimPreparesD4,
  canClaimRookSupportsFile,
} from "../boardClaimValidator";

export function testBoardClaimValidator(): void {
  const fen = "r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 2 3";
  const rookFen = "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQ1RK1 w - - 0 8";

  const bishopPressure = buildCoachEvidencePacket({
    frameId: "1",
    trainerFrameId: "1",
    fen,
    viewMode: "assisted",
    trainingMode: "restricted",
    bookStatus: "in_book",
    expectedMoveUci: "f1c4",
    repertoireMoves: ["f1c4"],
  });
  assert.equal(canClaimBishopPressuresSquare(bishopPressure, "f7"), true);

  const noPressure = buildCoachEvidencePacket({
    frameId: "1",
    trainerFrameId: "1",
    fen,
    viewMode: "assisted",
    trainingMode: "restricted",
    bookStatus: "in_book",
    expectedMoveUci: "f1b5",
    repertoireMoves: ["f1b5"],
  });
  assert.equal(canClaimBishopPressuresSquare(noPressure, "f7"), false);

  const c3Prep = buildCoachEvidencePacket({
    frameId: "1",
    trainerFrameId: "1",
    fen,
    viewMode: "assisted",
    trainingMode: "restricted",
    bookStatus: "in_book",
    expectedMoveUci: "c2c3",
    repertoireMoves: ["c2c3"],
  });
  assert.equal(canClaimPreparesD4(c3Prep), true);

  const badPrep = buildCoachEvidencePacket({
    frameId: "1",
    trainerFrameId: "1",
    fen,
    viewMode: "assisted",
    trainingMode: "restricted",
    bookStatus: "in_book",
    expectedMoveUci: "a2a3",
    repertoireMoves: ["a2a3"],
  });
  assert.equal(canClaimPreparesD4(badPrep), false);

  const rookFile = buildCoachEvidencePacket({
    frameId: "1",
    trainerFrameId: "1",
    fen: rookFen,
    viewMode: "assisted",
    trainingMode: "restricted",
    bookStatus: "in_book",
    expectedMoveUci: "f1e1",
    repertoireMoves: ["f1e1"],
  });
  assert.equal(canClaimRookSupportsFile(rookFile, "e"), true);

  const rookNoFile = buildCoachEvidencePacket({
    frameId: "1",
    trainerFrameId: "1",
    fen: rookFen,
    viewMode: "assisted",
    trainingMode: "restricted",
    bookStatus: "in_book",
    expectedMoveUci: "f1f2",
    repertoireMoves: ["f1f2"],
  });
  assert.equal(canClaimRookSupportsFile(rookNoFile, "e"), false);
}
