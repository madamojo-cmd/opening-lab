import assert from "node:assert/strict";

import { STAGE2_OPENING_AVAILABILITY_MATRIX, getStage2OpeningAvailabilitySummary } from "../../lib/blundr/openings/openingAvailability";

export function testStage2ApprovedLiveRenderingOpeningAvailability(): void {
  const summary = getStage2OpeningAvailabilitySummary();
  assert.equal(summary.openingCount, 21);
  assert.equal(summary.visibleOpeningCount, 21);
  assert.equal(summary.runtimeAvailableCount, 21);
  assert.equal(summary.approvedContentInventoryCount, 21);
  assert.equal(summary.approvedContentMatchedCount, 21);
  assert.equal(summary.approvedContentAvailableCount, 21);
  assert.equal(summary.runtimeDataSource, "local_crawled_package");
  assert.equal(summary.liveLichessCalled, false);
  assert.equal(summary.openingAvailabilityStatus, "smoke_pass");

  for (const opening of STAGE2_OPENING_AVAILABILITY_MATRIX) {
    assert.equal(opening.runtimeAvailable, true, `runtime availability mismatch:${opening.openingId}`);
    assert.equal(opening.approvedContentAvailable, true, `approved content unavailable:${opening.openingId}`);
    assert.equal(opening.stage, "dev", `stage should remain non-public:${opening.openingId}`);
    assert.equal(opening.qaStatus, "smoke_pass", `qa status mismatch:${opening.openingId}`);
    assert.equal(opening.userVisible, true, `catalog visibility mismatch:${opening.openingId}`);
    assert.equal(opening.contentStatus, "approved", `content status mismatch:${opening.openingId}`);
  }
}

testStage2ApprovedLiveRenderingOpeningAvailability();
console.log("stage2ApprovedLiveRenderingOpeningAvailability ok");
