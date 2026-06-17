import assert from "node:assert/strict";

import {
  loadStage2ApprovedContentCandidatePackage,
  STAGE2_APPROVED_CONTENT_CANDIDATE_PACKAGE_ID,
} from "../../lib/blundr/stage2ApprovedContent/stage2ApprovedContentPackage.server";

async function main(): Promise<void> {
  const loadResult = loadStage2ApprovedContentCandidatePackage();

  assert.equal(loadResult.packageId, STAGE2_APPROVED_CONTENT_CANDIDATE_PACKAGE_ID);
  assert.equal(loadResult.contentInventory.length, 5);
  assert.equal(loadResult.lineInventory.length, 100);
  assert.equal(loadResult.packets.length, 540);

  const uniquePacketIds = new Set(loadResult.packets.map((packet) => packet.packetId));
  assert.equal(uniquePacketIds.size, 540);

  const openings = new Set(loadResult.packets.map((packet) => packet.openingId));
  assert.deepEqual([...openings].sort(), [
    "caro-kann-black",
    "italian-white",
    "london-white",
    "queens-gambit-white",
    "sicilian-black",
  ]);

  for (const packet of loadResult.packets) {
    assert.equal(packet.status, "approved_candidate", `packet_status:${packet.packetId}`);
    assert.equal(packet.approvalReadiness, "ready_for_app_validation", `packet_readiness:${packet.packetId}`);
    assert.equal(packet.runtimeSource, "local_crawled_package", `packet_runtime_source:${packet.packetId}`);
    assert.equal(packet.runtimePackageId, "stage2-21opening-crawled-filtered5to2-runtime-source-v1", `packet_runtime_package:${packet.packetId}`);
  }
}

main()
  .then(() => {
    console.log("stage2CandidatePacketLoad ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
