import assert from "node:assert/strict";

import { loadStage2ApprovedContentCandidatePackageCollection } from "../../lib/blundr/stage2ApprovedContent/stage2ApprovedContentPackage.server";

async function main(): Promise<void> {
  const loadResult = loadStage2ApprovedContentCandidatePackageCollection([
    "docs/2026-06-17/stage2-approved-content-candidates-batch2-5openings-v1.zip",
    "docs/2026-06-17/stage2-approved-content-candidates-batch3-5openings-v1.zip",
    "docs/2026-06-17/stage2-approved-content-candidates-batch4-6openings-v1-castling-normalized.zip",
  ]);

  assert.deepEqual(loadResult.packageIds, [
    "stage2-approved-content-candidates-batch2-5openings-v1",
    "stage2-approved-content-candidates-batch3-5openings-v1",
    "stage2-approved-content-candidates-batch4-6openings-v1-castling-normalized",
  ]);
  assert.equal(loadResult.packages.length, 3);
  assert.equal(loadResult.contentInventory.length, 16);
  assert.equal(loadResult.lineInventory.length, 400);
  assert.equal(loadResult.packets.length, 1975);

  const uniquePacketIds = new Set(loadResult.packets.map((packet) => packet.packetId));
  assert.equal(uniquePacketIds.size, 1975);

  const openings = [...new Set(loadResult.packets.map((packet) => packet.openingId))].sort();
  assert.deepEqual(openings, [
    "colle-white",
    "english-white",
    "french-black",
    "italian-black",
    "kings-indian-black",
    "nimzo-indian-black",
    "petroff-black",
    "pirc-black",
    "qgd-black",
    "queens-indian-black",
    "reti-white",
    "ruy-lopez-white",
    "scandinavian-black",
    "scotch-white",
    "slav-black",
    "vienna-white",
  ]);
}

main()
  .then(() => {
    console.log("stage2CandidateMultiPackageLoad ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
