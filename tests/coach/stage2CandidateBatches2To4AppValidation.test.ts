import assert from "node:assert/strict";

import {
  loadStage2ApprovedContentCandidatePackageCollection,
  validateStage2ApprovedContentCandidatePackageCollection,
} from "../../lib/blundr/stage2ApprovedContent/stage2ApprovedContentPackage.server";

async function main(): Promise<void> {
  const loadResult = loadStage2ApprovedContentCandidatePackageCollection([
    "docs/2026-06-17/stage2-approved-content-candidates-batch2-5openings-v1.zip",
    "docs/2026-06-17/stage2-approved-content-candidates-batch3-5openings-v1.zip",
    "docs/2026-06-17/stage2-approved-content-candidates-batch4-6openings-v1-castling-normalized.zip",
  ]);
  const validation = await validateStage2ApprovedContentCandidatePackageCollection(loadResult);

  assert.equal(validation.summary.packageCount, 3);
  assert.equal(validation.summary.openingCount, 16);
  assert.equal(validation.summary.lineCount, 400);
  assert.equal(validation.summary.packetCount, 1975);
  assert.equal(validation.summary.uniquePacketIdCount, 1975);
  assert.equal(validation.summary.approvedPacketCount, 1975);
  assert.equal(validation.summary.rejectedPacketCount, 0);
  assert.equal(validation.summary.runtimeDataSource, "local_crawled_package");
  assert.equal(validation.summary.liveLichessCalled, false);
  assert.equal(validation.summary.runtimeAvailable, true);
  assert.equal(validation.summary.trainableFromLocalRuntimePackage, true);

  assert.equal(validation.approvedPackets.length, 1975);
  assert.equal(validation.rejectedPackets.length, 0);
  assert.equal(validation.packetValidation.length, 1975);

  for (const entry of validation.packetValidation) {
    assert.equal(entry.approved, true, `packet_not_approved:${entry.packetId}`);
    assert.equal(entry.openingRuntimeAvailable, true, `opening_not_runtime_available:${entry.packetId}`);
    assert.equal(entry.openingTrainableFromLocalRuntimePackage, true, `opening_not_trainable:${entry.packetId}`);
    assert.equal(entry.playSequenceLegal, true, `play_sequence_illegal:${entry.packetId}`);
    assert.equal(entry.moveLegal, true, `move_illegal:${entry.packetId}`);
    assert.equal(entry.sanMatches, true, `san_mismatch:${entry.packetId}`);
    assert.equal(entry.runtimeNodeMatched, true, `runtime_node_missing:${entry.packetId}`);
    assert.equal(entry.runtimeMoveMatched, true, `runtime_move_missing:${entry.packetId}`);
    assert.equal(entry.trainerFrameResolutionTargetMatched, true, `trainer_frame_resolution_target_mismatch:${entry.packetId}`);
    assert.equal(entry.plainHintSafe, true, `plain_hint_leak:${entry.packetId}`);
    assert.equal(entry.visualRecipeTargetMatched, true, `visual_recipe_target_mismatch:${entry.packetId}`);
    assert.equal(entry.noForbiddenGenericLabels, true, `forbidden_generic_label:${entry.packetId}`);
    assert.equal(entry.noPlaceholderText, true, `placeholder_text:${entry.packetId}`);
    assert.equal(entry.noUnsupportedClaims, true, `unsupported_claim:${entry.packetId}`);
    assert.equal(entry.runtimeDataSource, "local_crawled_package", `runtime_data_source:${entry.packetId}`);
    assert.equal(entry.liveLichessCalled, false, `live_lichess_called:${entry.packetId}`);
    assert.equal(entry.reasons.length, 0, `unexpected_rejection_reasons:${entry.packetId}`);
  }
}

main()
  .then(() => {
    console.log("stage2CandidateBatches2To4AppValidation ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
