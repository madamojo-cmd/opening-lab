import assert from "node:assert/strict";

import {
  STAGE2_APPROVED_CONTENT_APPROVED_PACKET_COUNT,
  STAGE2_APPROVED_CONTENT_APPROVED_PACKETS,
} from "../../lib/blundr/stage2ApprovedContent/stage2ApprovedContentPackage.generated";

async function main(): Promise<void> {
  assert.equal(STAGE2_APPROVED_CONTENT_APPROVED_PACKET_COUNT, 2515);
  assert.equal(STAGE2_APPROVED_CONTENT_APPROVED_PACKETS.length, 2515);

  const uniquePacketIds = new Set(STAGE2_APPROVED_CONTENT_APPROVED_PACKETS.map((packet) => packet.packetId));
  assert.equal(uniquePacketIds.size, 2515);

  const openings = [...new Set(STAGE2_APPROVED_CONTENT_APPROVED_PACKETS.map((packet) => packet.openingId))].sort();
  assert.deepEqual(openings, [
    "caro-kann-black",
    "colle-white",
    "english-white",
    "french-black",
    "italian-black",
    "italian-white",
    "kings-indian-black",
    "london-white",
    "nimzo-indian-black",
    "petroff-black",
    "pirc-black",
    "qgd-black",
    "queens-gambit-white",
    "queens-indian-black",
    "reti-white",
    "ruy-lopez-white",
    "scandinavian-black",
    "scotch-white",
    "sicilian-black",
    "slav-black",
    "vienna-white",
  ]);

  const exact = STAGE2_APPROVED_CONTENT_APPROVED_PACKETS.find((packet) => packet.openingId === "london-white" && packet.moveUci === "d2d4");
  assert.ok(exact, "london-white approved packet missing");
  assert.equal(exact?.status, "approved");
  assert.equal(exact?.approvalReadiness, "app_validated");
  assert.equal(exact?.runtimeReconciliation?.status, "matched");
}

main()
  .then(() => {
    console.log("stage2ApprovedContentPackageGeneratedRuntime ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
