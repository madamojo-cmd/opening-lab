import assert from "node:assert/strict";
import fs from "node:fs";

import {
  getStage2ApprovedContentApprovedPacketsDefaultPath,
  loadStage2ApprovedContentCandidatePackageCollection,
  validateStage2ApprovedContentCandidatePackageCollection,
} from "../../lib/blundr/stage2ApprovedContent";

async function main(): Promise<void> {
  const approvedPath = "data/blundr/stage2-approved-content-approved-batches2to4-16openings-v1/approved-packets.jsonl";
  assert.equal(fs.existsSync(approvedPath), true, `approved_bundle_missing:${approvedPath}`);
  assert.equal(getStage2ApprovedContentApprovedPacketsDefaultPath().includes("approved-5openings-v1"), true);

  const lines = fs
    .readFileSync(approvedPath, "utf8")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);
  assert.equal(lines.length, 1975);

  const packets = lines.map((line) => JSON.parse(line) as Record<string, unknown>);
  for (const packet of packets) {
    assert.equal(packet.status, "approved");
    assert.equal(packet.approvalReadiness, "app_validated");
    assert.equal(packet.sourceCandidatePackage, "stage2-approved-content-candidates-batches2to4-16openings-v1");
    assert.equal(packet.safetyStatus, "safe");
    assert.equal(packet.runtimeReconciliation?.status, "matched");
    assert.equal(Array.isArray(packet.sourceCandidatePackages), true);
  }

  const normalized = packets.find((packet) => packet.packetId === "italian-black.line-004.ply-10.e8g8");
  assert.ok(normalized, "normalized_castling_packet_missing");
  assert.equal(normalized?.normalizedMoveUci, "e8g8");
  assert.equal(normalized?.sourceRuntimeMoveUci, "e8h8");
  assert.equal(normalized?.uciNormalizationApplied, true);
  assert.equal(normalized?.moveSan, "O-O");
  assert.equal(normalized?.visualRecipe && (normalized.visualRecipe as Record<string, unknown>).targetMoveUci, "e8g8");

  const validation = await validateStage2ApprovedContentCandidatePackageCollection(
    loadStage2ApprovedContentCandidatePackageCollection([
      "docs/2026-06-17/stage2-approved-content-candidates-batch2-5openings-v1.zip",
      "docs/2026-06-17/stage2-approved-content-candidates-batch3-5openings-v1.zip",
      "docs/2026-06-17/stage2-approved-content-candidates-batch4-6openings-v1-castling-normalized.zip",
    ]),
  );
  assert.equal(validation.approvedPackets.length, packets.length);
}

main()
  .then(() => {
    console.log("stage2ApprovedBatches2To4Promotion ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
