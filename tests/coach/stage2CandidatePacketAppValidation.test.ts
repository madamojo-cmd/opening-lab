import assert from "node:assert/strict";

import {
  loadStage2ApprovedContentCandidatePackage,
  validateStage2ApprovedContentCandidatePackage,
} from "../../lib/blundr/stage2ApprovedContent";

async function main(): Promise<void> {
  const loadResult = loadStage2ApprovedContentCandidatePackage();
  const validation = await validateStage2ApprovedContentCandidatePackage(loadResult);

  assert.equal(validation.summary.openingCount, 5);
  assert.equal(validation.summary.lineCount, 100);
  assert.equal(validation.summary.packetCount, 540);
  assert.equal(validation.summary.uniquePacketIdCount, 540);
  assert.equal(validation.summary.approvedPacketCount, 540);
  assert.equal(validation.summary.rejectedPacketCount, 0);
  assert.equal(validation.summary.runtimeDataSource, "local_crawled_package");
  assert.equal(validation.summary.liveLichessCalled, false);

  assert.equal(validation.approvedPackets.length, 540);
  assert.equal(validation.rejectedPackets.length, 0);

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
    assert.equal(entry.runtimeDataSource, "local_crawled_package", `runtime_data_source:${entry.packetId}`);
    assert.equal(entry.liveLichessCalled, false, `live_lichess_called:${entry.packetId}`);
    assert.equal(entry.reasons.length, 0, `unexpected_rejection_reasons:${entry.packetId}`);
  }
}

main()
  .then(() => {
    console.log("stage2CandidatePacketAppValidation ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
