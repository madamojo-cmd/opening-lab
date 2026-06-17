import assert from "node:assert/strict";

import { resolveStage2ApprovedContentPacket } from "../../lib/blundr/stage2ApprovedContent";

async function main(): Promise<void> {
  const approvedPath = "data/blundr/stage2-approved-content-approved-batches2to4-16openings-v1/approved-packets.jsonl";

  const packet = resolveStage2ApprovedContentPacket({
    openingId: "italian-black",
    playKeyBefore: "e2e4,e7e5,g1f3,b8c6,f1c4,f8c5,c2c3,g8f6,d2d3",
    targetUci: "e8g8",
    surface: "assisted",
    approvedPacketsPath: approvedPath,
  });
  assert.equal(packet.kind, "approved_packet");
  if (packet.kind !== "approved_packet") return;

  assert.equal(packet.packet.openingId, "italian-black");
  assert.equal(packet.packet.moveUci, "e8g8");
  assert.equal(packet.packet.normalizedMoveUci, "e8g8");
  assert.equal(packet.packet.sourceRuntimeMoveUci, "e8h8");
  assert.equal(packet.packet.uciNormalizationApplied, true);
  assert.equal(packet.packet.uciNormalizationReason, "castling_rook_square_to_standard_king_destination");
  assert.equal(packet.packet.visualRecipe.targetMoveUci, "e8g8");
  assert.equal(packet.packet.moveSan, "O-O");

  const byPlayKey = resolveStage2ApprovedContentPacket({
    openingId: "ruy-lopez-white",
    playKey: "e2e4,e7e5,g1f3,b8c6,f1b5,a7a6,b5a4,g8f6,e1g1",
    targetUci: "e1g1",
    surface: "plain_show_more",
    approvedPacketsPath: approvedPath,
  });
  assert.equal(byPlayKey.kind, "approved_packet");
  if (byPlayKey.kind !== "approved_packet") return;
  assert.equal(byPlayKey.packet.moveSan, "O-O");
  assert.equal(byPlayKey.packet.normalizedMoveUci, "e1g1");
  assert.equal(byPlayKey.packet.sourceRuntimeMoveUci, "e1h1");
}

main()
  .then(() => {
    console.log("stage2ApprovedCastlingNormalization ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
