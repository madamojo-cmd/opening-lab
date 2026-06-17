import assert from "node:assert/strict";
import fs from "node:fs";

import {
  getStage2ApprovedContentApprovedPacketsDefaultPath,
  loadStage2ApprovedContentCandidatePackage,
  validateStage2ApprovedContentCandidatePackage,
} from "../../lib/blundr/stage2ApprovedContent/stage2ApprovedContentPackage.server";

async function main(): Promise<void> {
  const approvedPath = getStage2ApprovedContentApprovedPacketsDefaultPath();
  assert.equal(fs.existsSync(approvedPath), true, `approved_bundle_missing:${approvedPath}`);

  const text = fs.readFileSync(approvedPath, "utf8");
  const packets = text.split(/\r?\n/).filter((line) => line.trim().length > 0).map((line) => JSON.parse(line) as Record<string, unknown>);
  assert.equal(packets.length, 540);

  for (const packet of packets) {
    assert.equal(packet.status, "approved");
    assert.equal(packet.approvalReadiness, "app_validated");
    assert.equal(packet.sourceCandidatePackage, "stage2-approved-content-candidates-5openings-50lines-v1");
    assert.equal(packet.safetyStatus, "safe");
    assert.equal(packet.runtimeReconciliation?.status, "matched");
  }

  const validation = await validateStage2ApprovedContentCandidatePackage(loadStage2ApprovedContentCandidatePackage());
  assert.equal(validation.approvedPackets.length, packets.length);
}

main()
  .then(() => {
    console.log("stage2ApprovedPacketPromotion ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
