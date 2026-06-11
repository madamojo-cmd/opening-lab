import assert from "node:assert/strict";

import { evaluateStage2Readiness } from "../../lib/blundr/stage2/readiness/evaluateStage2Readiness";

function hasBlocker(status: ReturnType<typeof evaluateStage2Readiness>, code: string): boolean {
  return status.blockers.some((b) => b.code === code);
}

export function testStage2ReadinessGate(): void {
  const empty = evaluateStage2Readiness();
  assert.equal(empty.stage2Enabled, false);
  assert.equal(hasBlocker(empty, "stage2_not_requested"), true);
  assert.equal(hasBlocker(empty, "crawl_bundle_not_ready"), true);
  assert.equal(hasBlocker(empty, "copy_bundle_not_ready"), true);
  assert.equal(hasBlocker(empty, "ownership_guardrails_not_confirmed"), true);
  assert.equal(hasBlocker(empty, "board_truth_boundary_not_confirmed"), true);
  assert.equal(hasBlocker(empty, "runtime_integration_not_approved"), true);

  const requestedOnly = evaluateStage2Readiness({ stage2Requested: true });
  assert.equal(requestedOnly.stage2Enabled, false);
  assert.equal(requestedOnly.summary.readyForRuntimeIntegration, false);

  const validCrawlOnly = evaluateStage2Readiness({
    stage2Requested: true,
    crawlBundleValidation: { ok: true, errors: [], warnings: [] },
  });
  assert.equal(validCrawlOnly.stage2Enabled, false);
  assert.equal(validCrawlOnly.crawlBundleReady, true);
  assert.equal(validCrawlOnly.summary.readyForRuntimeIntegration, false);

  const validCopyOnly = evaluateStage2Readiness({
    stage2Requested: true,
    copyBundleValidation: { ok: true, errors: [], warnings: [] },
  });
  assert.equal(validCopyOnly.stage2Enabled, false);
  assert.equal(validCopyOnly.copyBundleReady, true);
  assert.equal(validCopyOnly.summary.readyForRuntimeIntegration, false);

  const missingGuardrails = evaluateStage2Readiness({
    stage2Requested: true,
    crawlBundleValidation: { ok: true },
    copyBundleValidation: { ok: true },
    runtimeIntegrationApproved: true,
  });
  assert.equal(missingGuardrails.summary.readyForRuntimeIntegration, false);
  assert.equal(hasBlocker(missingGuardrails, "ownership_guardrails_not_confirmed"), true);
  assert.equal(hasBlocker(missingGuardrails, "board_truth_boundary_not_confirmed"), true);

  const missingRuntimeApproval = evaluateStage2Readiness({
    stage2Requested: true,
    crawlBundleValidation: { ok: true },
    copyBundleValidation: { ok: true },
    ownershipGuardrailsPassed: true,
    boardTruthBoundaryPassed: true,
    runtimeIntegrationApproved: false,
  });
  assert.equal(missingRuntimeApproval.summary.readyForRuntimeIntegration, false);
  assert.equal(hasBlocker(missingRuntimeApproval, "runtime_integration_not_approved"), true);

  const allTrue = evaluateStage2Readiness({
    stage2Requested: true,
    crawlBundleValidation: { ok: true, errors: [], warnings: [] },
    copyBundleValidation: { ok: true, errors: [], warnings: [] },
    ownershipGuardrailsPassed: true,
    boardTruthBoundaryPassed: true,
    runtimeIntegrationApproved: true,
  });
  assert.equal(allTrue.summary.readyForRuntimeIntegration, true);
  assert.equal(allTrue.summary.readyForVisibleCopy, true);
  assert.equal(allTrue.summary.readyForStage3, false);
  assert.equal(allTrue.stage2Enabled, false);

  const failedCrawl = evaluateStage2Readiness({
    stage2Requested: true,
    crawlBundleValidation: { ok: false, errors: [{ code: "x" }] },
    copyBundleValidation: { ok: true },
    ownershipGuardrailsPassed: true,
    boardTruthBoundaryPassed: true,
    runtimeIntegrationApproved: true,
  });
  assert.equal(failedCrawl.summary.readyForRuntimeIntegration, false);
  assert.equal(hasBlocker(failedCrawl, "crawl_bundle_not_ready"), true);

  const failedCopy = evaluateStage2Readiness({
    stage2Requested: true,
    crawlBundleValidation: { ok: true },
    copyBundleValidation: { ok: false, errors: [{ code: "x" }] },
    ownershipGuardrailsPassed: true,
    boardTruthBoundaryPassed: true,
    runtimeIntegrationApproved: true,
  });
  assert.equal(failedCopy.summary.readyForRuntimeIntegration, false);
  assert.equal(hasBlocker(failedCopy, "copy_bundle_not_ready"), true);
}

testStage2ReadinessGate();
console.log("stage2ReadinessGate ok");
