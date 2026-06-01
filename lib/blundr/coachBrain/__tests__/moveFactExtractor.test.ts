import assert from "node:assert/strict";
import { extractMoveFacts } from "../moveFactExtractor";

export function testMoveFactExtractor(): void {
  const italianFen = "r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQK2R w KQkq - 0 6";

  const bc4 = extractMoveFacts({ fenBefore: "r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 2 3", moveUci: "f1c4" });
  assert.equal(Boolean(bc4?.legal), true);
  assert.equal(bc4?.movedPiece.type, "b");
  assert.equal(bc4?.movedPiece.from, "f1");
  assert.equal(bc4?.movedPiece.to, "c4");
  assert.equal(bc4?.movedPieceAttacksAfter.includes("f7"), true);

  const bb5 = extractMoveFacts({ fenBefore: "r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 2 3", moveUci: "f1b5" });
  assert.equal(Boolean(bb5?.legal), true);
  assert.equal(bb5?.movedPieceAttacksAfter.includes("f7"), false);

  const be2 = extractMoveFacts({ fenBefore: "r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 2 3", moveUci: "f1e2" });
  assert.equal(Boolean(be2?.legal), true);
  assert.equal(be2?.movedPieceAttacksAfter.includes("f7"), false);

  const illegal = extractMoveFacts({ fenBefore: italianFen, moveUci: "a1a8" });
  assert.equal(Boolean(illegal?.legal), false);

  const castle = extractMoveFacts({ fenBefore: italianFen, moveUci: "e1g1" });
  assert.equal(Boolean(castle?.legal), true);
  assert.equal(Boolean(castle?.isCastle), true);

  const centerPush = extractMoveFacts({ fenBefore: italianFen, moveUci: "d3d4" });
  assert.equal(Boolean(centerPush?.legal), true);
  assert.equal(centerPush?.centerSquaresAffected.includes("d4"), true);
}
