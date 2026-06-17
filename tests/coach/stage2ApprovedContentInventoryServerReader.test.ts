import assert from "node:assert/strict";

import {
  STAGE2_APPROVED_CONTENT_INVENTORY,
  getStage2ApprovedContentInventoryEntry,
  getStage2ApprovedContentInventorySummary,
} from "../../lib/blundr/stage2Coaching/stage2ApprovedContentInventory";

export function testStage2ApprovedContentInventoryServerReader(): void {
  const summary = getStage2ApprovedContentInventorySummary();
  assert.equal(STAGE2_APPROVED_CONTENT_INVENTORY.length, 21);
  assert.equal(summary.approvedContentInventoryCount, 21);
  assert.equal(summary.approvedContentMatchedCount, 21);
  assert.equal(summary.approvedContentAvailableCount, 21);
  assert.equal(summary.runtimeMatchedCount, 21);
  assert.equal(summary.targetMatchedCount, 21);
  assert.equal(summary.plainViewSafeCount, 21);
  assert.equal(summary.visualRecipeAvailableCount, 21);

  const entry = getStage2ApprovedContentInventoryEntry("italian-white");
  assert.equal(entry?.status, "approved");
  assert.equal(entry?.approvedContentAvailable, true);
  assert.equal(entry?.visualRecipeAvailable, true);
}

testStage2ApprovedContentInventoryServerReader();
console.log("stage2ApprovedContentInventoryServerReader ok");
