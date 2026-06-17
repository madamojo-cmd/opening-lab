import assert from "node:assert/strict";

import {
  STAGE2_OPENING_AVAILABILITY_MATRIX,
  STAGE2_RUNTIME_PACKAGE_ID,
  getStage2OpeningAvailabilitySummary,
} from "../../lib/blundr/openings/openingAvailability";

export function testOpeningVisibilityMatrix(): void {
  assert.equal(STAGE2_OPENING_AVAILABILITY_MATRIX.length, 21, "runtime_visible_opening_count_must_be_21");

  const summary = getStage2OpeningAvailabilitySummary();
  assert.equal(summary.runtimeDataSource, "local_crawled_package");
  assert.equal(summary.runtimePackageId, STAGE2_RUNTIME_PACKAGE_ID);
  assert.equal(summary.openingCount, 21);
  assert.equal(summary.visibleOpeningCount, 21);
  assert.equal(summary.publicOpeningCount, 0);
  assert.equal(summary.betaOpeningCount, 1);
  assert.equal(summary.devOpeningCount, 20);
  assert.equal(summary.hiddenOpeningCount, 0);
  assert.equal(summary.liveLichessCalled, false);
  assert.equal(summary.openingAvailabilityStatus, "smoke_pass");

  const openingIds = STAGE2_OPENING_AVAILABILITY_MATRIX.map((entry) => entry.openingId).sort();
  assert.equal(openingIds.length, 21, "opening_id_count_mismatch");
  assert.equal(new Set(openingIds).size, 21, "opening_ids_must_be_unique");
  assert.equal(summary.approvedContentInventoryCount, 21);
  assert.equal(summary.approvedContentMatchedCount, 21);

  for (const opening of STAGE2_OPENING_AVAILABILITY_MATRIX) {
    assert.equal(Boolean(opening.displayName), true, `display_name_missing:${opening.openingId}`);
    assert.equal(opening.learnerPerspective === "white" || opening.learnerPerspective === "black", true, `learner_perspective_invalid:${opening.openingId}`);
    assert.equal(opening.runtimeAvailable, true, `runtime_not_available:${opening.openingId}`);
    assert.equal(opening.runtimePackageId, STAGE2_RUNTIME_PACKAGE_ID, `runtime_package_id_mismatch:${opening.openingId}`);
    assert.equal(opening.runtimeNodeCount > 0, true, `runtime_node_count_missing:${opening.openingId}`);
    assert.equal(opening.runtimeCandidateMoveCount > 0, true, `runtime_candidate_count_missing:${opening.openingId}`);
    assert.equal(opening.userVisible, true, `opening_not_user_visible:${opening.openingId}`);
    assert.equal(opening.contentStatus, "approved", `content_status_mismatch:${opening.openingId}`);
    assert.equal(opening.approvedContentAvailable, true, `approved_content_should_be_available:${opening.openingId}`);
    assert.equal(opening.publicReady, false, `public_ready_must_remain_false:${opening.openingId}`);
    assert.equal(opening.needsBrowserQA, true, `browser_qa_pending:${opening.openingId}`);
    assert.equal(opening.reasonHidden != null, true, `reason_hidden_missing:${opening.openingId}`);
    if (opening.openingId === "italian-white") {
      assert.equal(opening.stage, "beta", `beta_stage_expected:${opening.openingId}`);
      assert.equal(opening.betaReady, true, `beta_ready_expected:${opening.openingId}`);
      assert.equal(opening.leadingMvpCandidate, true, `leading_mvp_expected:${opening.openingId}`);
    } else {
      assert.equal(opening.stage, "dev", `stage_mismatch:${opening.openingId}`);
      assert.equal(opening.betaReady, false, `beta_ready_should_be_false:${opening.openingId}`);
      assert.equal(opening.leadingMvpCandidate, false, `leading_mvp_should_be_false:${opening.openingId}`);
    }
    assert.equal(opening.qaStatus, "smoke_pass", `qa_status_mismatch:${opening.openingId}`);
  }

  assert.equal(STAGE2_OPENING_AVAILABILITY_MATRIX.length > 8, true, "stale_8_opening_gate_detected");
}

testOpeningVisibilityMatrix();
console.log("openingVisibilityMatrix ok");
