import assert from "node:assert/strict";

import {
  getStage2ApprovedContentApprovedPacketsDefaultPath,
  loadStage2ApprovedContentCandidatePackage,
  validateStage2ApprovedContentCandidatePackage,
} from "../../lib/blundr/stage2ApprovedContent/stage2ApprovedContentPackage.server";

async function main(): Promise<void> {
  const approvedPath = getStage2ApprovedContentApprovedPacketsDefaultPath();
  assert.equal(approvedPath.includes("approved-5openings-v1"), true);

  const loadResult = loadStage2ApprovedContentCandidatePackage();
  assert.equal(loadResult.packageId, "stage2-approved-content-candidates-5openings-50lines-v1");
  assert.equal(loadResult.contentInventory.length, 5);
  assert.equal(loadResult.lineInventory.length, 100);
  assert.equal(loadResult.packets.length, 540);

  const validation = await validateStage2ApprovedContentCandidatePackage(loadResult);
  assert.equal(validation.summary.approvedPacketCount, 540);
  assert.equal(validation.summary.rejectedPacketCount, 0);
  assert.equal(validation.summary.runtimeDataSource, "local_crawled_package");
  assert.equal(validation.summary.liveLichessCalled, false);
}

main()
  .then(() => {
    console.log("stage2ApprovedContentPackageServerReader ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
