import assert from "node:assert/strict";
import {
  STAGE2_APPROVED_CONTENT_INVENTORY,
  getStage2ApprovedContentInventorySummary,
} from "../../lib/blundr/stage2Coaching";

export function testStage2ApprovedContentAvailabilityMatchesBundles(): void {
  const summary = getStage2ApprovedContentInventorySummary();
  assert.equal(STAGE2_APPROVED_CONTENT_INVENTORY.length, 21);
  assert.equal(summary.approvedContentInventoryCount, 21);
  assert.equal(summary.approvedContentMatchedCount, 21);
  assert.equal(summary.approvedContentAvailableCount, 21);
  assert.equal(summary.runtimeMatchedCount, 21);
  assert.equal(summary.targetMatchedCount, 21);
  assert.equal(summary.plainViewSafeCount, 21);
  assert.equal(summary.visualRecipeAvailableCount, 21);

  const openings = new Set<string>();
  const sourceFiles = new Set<string>();
  const expectedSourceFiles = new Set([
    "data/blundr/stage2-approved-content-approved-5openings-v1/approved-packets.jsonl",
    "data/blundr/stage2-approved-content-approved-batches2to4-16openings-v1/approved-packets.jsonl",
  ]);
  for (const entry of STAGE2_APPROVED_CONTENT_INVENTORY) {
    assert.equal(entry.approvedContentAvailable, true, `approved_content_should_exist:${entry.openingId}`);
    assert.equal(entry.status, "approved", `approved_content_status:${entry.openingId}`);
    assert.equal(entry.runtimeMatched, true, `runtime_must_remain_matched:${entry.openingId}`);
    assert.equal(entry.targetMatched, true, `target_must_remain_matched:${entry.openingId}`);
    assert.equal(entry.plainViewSafe, true, `plain_view_safety:${entry.openingId}`);
    assert.equal(entry.visualRecipeAvailable, true, `visual_recipe_available:${entry.openingId}`);
    assert.equal(Boolean(entry.reasonNotApproved), false, `no_rejection_reason:${entry.openingId}`);
    openings.add(entry.openingId);
    sourceFiles.add(entry.sourceFile);
    assert.equal(
      entry.sourceFile.startsWith("/"),
      false,
      `source_file_must_be_repository_relative:${entry.openingId}`,
    );
  }

  assert.equal(openings.size, 21, "opening_ids_must_remain_unique");
  assert.equal(sourceFiles.size, 2, "approved_bundles_should_cover_two_source_files");
  for (const expectedSourceFile of expectedSourceFiles) {
    assert.equal(sourceFiles.has(expectedSourceFile), true, `missing_expected_source_file:${expectedSourceFile}`);
  }
}

testStage2ApprovedContentAvailabilityMatchesBundles();
console.log("stage2ApprovedContentAvailabilityMatchesBundles ok");
