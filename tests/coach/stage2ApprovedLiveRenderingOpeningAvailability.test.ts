import assert from "node:assert/strict";

import { STAGE2_OPENING_AVAILABILITY_MATRIX, getStage2OpeningAvailabilitySummary } from "../../lib/blundr/openings/openingAvailability";

export function testStage2ApprovedLiveRenderingOpeningAvailability(): void {
  const summary = getStage2OpeningAvailabilitySummary();
  assert.equal(summary.openingCount, 21);
  assert.equal(summary.visibleOpeningCount, 21);
  assert.equal(summary.publicOpeningCount, 0);
  assert.equal(summary.betaOpeningCount, 1);
  assert.equal(summary.devOpeningCount, 20);
  assert.equal(summary.hiddenOpeningCount, 0);
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
    assert.equal(opening.publicReady, false, `public readiness should remain blocked:${opening.openingId}`);
    assert.equal(opening.needsBrowserQA, true, `browser QA should remain pending:${opening.openingId}`);
    assert.equal(opening.reasonHidden != null, true, `reason hidden should be present:${opening.openingId}`);
    if (opening.openingId === "italian-white") {
      assert.equal(opening.stage, "beta", `leading MVP should be beta:${opening.openingId}`);
      assert.equal(opening.betaReady, true, `leading MVP should be beta-ready:${opening.openingId}`);
      assert.equal(opening.leadingMvpCandidate, true, `leading MVP flag missing:${opening.openingId}`);
    } else {
      assert.equal(opening.stage, "dev", `stage should remain non-public:${opening.openingId}`);
      assert.equal(opening.betaReady, false, `beta-ready should stay false:${opening.openingId}`);
      assert.equal(opening.leadingMvpCandidate, false, `leading MVP flag should stay false:${opening.openingId}`);
    }
    assert.equal(opening.qaStatus, "smoke_pass", `qa status mismatch:${opening.openingId}`);
    assert.equal(opening.userVisible, true, `catalog visibility mismatch:${opening.openingId}`);
    assert.equal(opening.contentStatus, "approved", `content status mismatch:${opening.openingId}`);
  }
}

testStage2ApprovedLiveRenderingOpeningAvailability();
console.log("stage2ApprovedLiveRenderingOpeningAvailability ok");
