import assert from "node:assert/strict";

import {
  STAGE2_OPENING_AVAILABILITY_MATRIX,
  getStage2OpeningAvailabilitySummary,
} from "../../lib/blundr/openings/openingAvailability";

export function testStage2OpeningVisibilityNoPublicByAccident(): void {
  const summary = getStage2OpeningAvailabilitySummary();
  assert.equal(summary.visibleOpeningCount, 21);
  assert.equal(summary.publicOpeningCount, 0);
  assert.equal(summary.betaOpeningCount, 1);
  assert.equal(summary.devOpeningCount, 20);
  assert.equal(summary.hiddenOpeningCount, 0);

  const publicOpenings = STAGE2_OPENING_AVAILABILITY_MATRIX.filter((entry) => entry.publicReady === true);
  const publicStageOpenings = STAGE2_OPENING_AVAILABILITY_MATRIX.filter((entry) => entry.stage === "public");
  assert.equal(publicOpenings.length, 0, "no_openings_may_be_public");
  assert.equal(publicStageOpenings.length, 0, "no_openings_may_use_public_stage");

  for (const opening of STAGE2_OPENING_AVAILABILITY_MATRIX) {
    assert.equal(opening.userVisible, true, `opening_should_remain_visible:${opening.openingId}`);
    assert.equal(opening.runtimeAvailable, true, `opening_should_remain_runtime_available:${opening.openingId}`);
    assert.equal(opening.approvedContentAvailable, true, `opening_should_remain_approved_content_available:${opening.openingId}`);
    assert.equal(opening.publicReady, false, `opening_should_not_be_public_ready:${opening.openingId}`);
    assert.equal(opening.needsBrowserQA, true, `opening_should_need_browser_qa:${opening.openingId}`);
    assert.equal(opening.reasonHidden != null, true, `opening_should_have_hidden_reason:${opening.openingId}`);
  }
}

testStage2OpeningVisibilityNoPublicByAccident();
console.log("stage2OpeningVisibilityNoPublicByAccident ok");
