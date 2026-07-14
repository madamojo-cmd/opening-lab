import assert from "node:assert/strict";

import { STAGE2_APPROVED_CONTENT_APPROVED_PACKETS } from "../../lib/blundr/stage2ApprovedContent/stage2ApprovedContentPackage.generated";

async function main(): Promise<void> {
  const londonWhitePacket = STAGE2_APPROVED_CONTENT_APPROVED_PACKETS.find(
    (packet) => packet.openingId === "london-white" && packet.moveUci === "d2d4",
  );
  assert.ok(londonWhitePacket, "london_white_packet_missing");

  const approvedContent = await import("../../lib/blundr/stage2ApprovedContent");
  const coaching = await import("../../lib/blundr/stage2Coaching");

  const approved = approvedContent.resolveStage2ApprovedContentPacketCollection({
    openingId: "london-white",
    playKeyBefore: "",
    targetUci: "d2d4",
    targetSan: "d4",
    learnerSide: "white",
    sideToMove: "white",
    surface: "assisted",
  });

  assert.equal(approved.kind, "approved_packet");

  const coachingResolution = coaching.resolveStage2CoachingPacket({
    openingId: "london-white",
    playKeyBefore: "",
    targetUci: "d2d4",
    targetSan: "d4",
    learnerSide: "white",
    sideToMove: "white",
    surface: "assisted",
  });
  assert.equal(coachingResolution.kind, "approved_packet");
}

main()
  .then(() => {
    console.log("stage2BrowserRuntimeNoRequireCrashApprovedPackage ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
