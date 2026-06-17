import assert from "node:assert/strict";

import { STAGE2_APPROVED_CONTENT_APPROVED_PACKETS } from "../../lib/blundr/stage2ApprovedContent/stage2ApprovedContentPackage.generated";
import { getStage2ApprovedContentApprovedPacketsDefaultPath, resolveStage2ApprovedContentPacket } from "../../lib/blundr/stage2ApprovedContent";

async function main(): Promise<void> {
  const approvedPath = getStage2ApprovedContentApprovedPacketsDefaultPath();
  const italianBlackPacket = STAGE2_APPROVED_CONTENT_APPROVED_PACKETS.find(
    (packet) => packet.packetId === "italian-black.line-004.ply-10.e8g8",
  );
  const ruyLopezPacket = STAGE2_APPROVED_CONTENT_APPROVED_PACKETS.find(
    (packet) => packet.packetId === "ruy-lopez-white.line-001.ply-09.e1g1",
  );
  assert.ok(italianBlackPacket, "italian_black_packet_missing");
  assert.ok(ruyLopezPacket, "ruy_lopez_packet_missing");

  const packet = resolveStage2ApprovedContentPacket({
    openingId: "italian-black",
    playKeyBefore: italianBlackPacket ? italianBlackPacket.playSequenceUci.slice(0, Math.max(0, Number(italianBlackPacket.ply ?? 1) - 1)).join(",") : "",
    targetUci: "e8g8",
    targetSan: "O-O",
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
    playKeyBefore: ruyLopezPacket ? ruyLopezPacket.playSequenceUci.slice(0, Math.max(0, Number(ruyLopezPacket.ply ?? 1) - 1)).join(",") : "",
    targetUci: "e1g1",
    targetSan: "O-O",
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
