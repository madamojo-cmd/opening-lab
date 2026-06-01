import assert from "node:assert/strict";
import { buildPositionEvidence } from "../positionEvidenceBuilder";

export function testPositionEvidenceBuilder(): void {
  const evidence = buildPositionEvidence({
    frameId: "10",
    trainerFrameId: 10,
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    boardFen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -",
    moveHistorySan: ["e4"],
    bookStatus: "book_complete",
  });
  assert.equal(evidence.stale, false);
  assert.equal(evidence.legalMoves.length > 0, true);

  const stale = buildPositionEvidence({
    frameId: "10",
    trainerFrameId: 11,
    fen: "8/8/8/8/8/8/8/8 w - -",
    boardFen: "8/8/8/8/8/8/8/8 w - -",
    moveHistorySan: [],
    bookStatus: "out_of_book",
  });
  assert.equal(stale.stale, true);
}
