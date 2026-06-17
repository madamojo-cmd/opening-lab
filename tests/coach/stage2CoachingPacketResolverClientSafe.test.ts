import assert from "node:assert/strict";

import { STAGE2_APPROVED_CONTENT_APPROVED_PACKETS } from "../../lib/blundr/stage2ApprovedContent/stage2ApprovedContentPackage.generated";
import { resolveStage2CoachingPacket } from "../../lib/blundr/stage2Coaching";

async function main(): Promise<void> {
  const londonWhitePacket = STAGE2_APPROVED_CONTENT_APPROVED_PACKETS.find(
    (packet) => packet.openingId === "london-white" && packet.moveUci === "d2d4",
  );
  assert.ok(londonWhitePacket, "london_white_packet_missing");

  const exact = resolveStage2CoachingPacket({
    openingId: "london-white",
    playKeyBefore: "",
    targetUci: "d2d4",
    targetSan: "d4",
    learnerSide: "white",
    sideToMove: "white",
    surface: "assisted",
  });

  assert.equal(exact.kind, "approved_packet");
  if (exact.kind === "approved_packet") {
    assert.equal(exact.packet.status, "approved");
    assert.equal(exact.packet.approvalReadiness, "app_validated");
    assert.equal(exact.packet.openingId, "london-white");
    assert.equal(exact.packet.moveUci, "d2d4");
  }

  const plainHint = resolveStage2CoachingPacket({
    openingId: "london-white",
    playKeyBefore: "",
    targetUci: "d2d4",
    targetSan: "d4",
    learnerSide: "white",
    sideToMove: "white",
    surface: "plain_hint",
  });

  assert.equal(plainHint.kind, "approved_packet");
  if (plainHint.kind === "approved_packet") {
    const text = [plainHint.packet.surfaces.plain_hint?.title ?? "", plainHint.packet.surfaces.plain_hint?.body ?? ""]
      .join("\n")
      .toLowerCase();
    assert.equal(text.includes("d2d4"), false);
    assert.equal(text.includes("d4"), false);
  }
}

main()
  .then(() => {
    console.log("stage2CoachingPacketResolverClientSafe ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
