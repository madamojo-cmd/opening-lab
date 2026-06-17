import assert from "node:assert/strict";

import {
  STAGE2_OPENING_AVAILABILITY_MATRIX,
  getStage2OpeningAvailabilitySummary,
} from "../../lib/blundr/openings/openingAvailability";

export function testStage2OpeningAvailabilityProductReadiness(): void {
  const summary = getStage2OpeningAvailabilitySummary();
  assert.equal(summary.openingCount, 21);
  assert.equal(summary.visibleOpeningCount, 21);
  assert.equal(summary.runtimeAvailableCount, 21);
  assert.equal(summary.approvedContentInventoryCount, 21);
  assert.equal(summary.approvedContentMatchedCount, 21);
  assert.equal(summary.approvedContentAvailableCount, 21);
  assert.equal(summary.publicOpeningCount, 0);
  assert.equal(summary.betaOpeningCount, 1);
  assert.equal(summary.devOpeningCount, 20);
  assert.equal(summary.hiddenOpeningCount, 0);
  assert.equal(summary.liveLichessCalled, false);
  assert.equal(summary.openingAvailabilityStatus, "smoke_pass");

  const italianWhite = STAGE2_OPENING_AVAILABILITY_MATRIX.find((entry) => entry.openingId === "italian-white");
  assert.ok(italianWhite, "italian_white_missing");
  assert.equal(italianWhite?.runtimeAvailable, true);
  assert.equal(italianWhite?.approvedContentAvailable, true);
  assert.equal(italianWhite?.userVisible, true);
  assert.equal(italianWhite?.stage, "beta");
  assert.equal(italianWhite?.qaStatus, "smoke_pass");
  assert.equal(italianWhite?.publicReady, false);
  assert.equal(italianWhite?.betaReady, true);
  assert.equal(italianWhite?.leadingMvpCandidate, true);
  assert.equal(italianWhite?.needsBrowserQA, true);
  assert.equal(italianWhite?.reasonHidden, "beta_selector_only_until_browser_qa");

  for (const opening of STAGE2_OPENING_AVAILABILITY_MATRIX) {
    assert.equal(opening.runtimeAvailable, true, `runtime_available:${opening.openingId}`);
    assert.equal(opening.approvedContentAvailable, true, `approved_content_available:${opening.openingId}`);
    assert.equal(opening.userVisible, true, `user_visible:${opening.openingId}`);
    assert.equal(opening.publicReady, false, `public_ready_must_be_false:${opening.openingId}`);
    assert.equal(opening.needsBrowserQA, true, `browser_qa_pending:${opening.openingId}`);
    assert.equal(opening.reasonHidden != null, true, `reason_hidden_missing:${opening.openingId}`);
    assert.equal(opening.qaStatus, "smoke_pass", `qa_status:${opening.openingId}`);
    if (opening.openingId === "italian-white") {
      assert.equal(opening.stage, "beta", `italian_white_stage:${opening.openingId}`);
      assert.equal(opening.betaReady, true, `italian_white_beta_ready:${opening.openingId}`);
      assert.equal(opening.leadingMvpCandidate, true, `italian_white_mvp:${opening.openingId}`);
    } else {
      assert.equal(opening.stage, "dev", `dev_stage:${opening.openingId}`);
      assert.equal(opening.betaReady, false, `beta_ready_false:${opening.openingId}`);
      assert.equal(opening.leadingMvpCandidate, false, `leading_mvp_false:${opening.openingId}`);
    }
  }
}

testStage2OpeningAvailabilityProductReadiness();
console.log("stage2OpeningAvailabilityProductReadiness ok");
