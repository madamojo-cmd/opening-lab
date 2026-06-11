import type {
  Stage2ReadinessBlocker,
  Stage2ReadinessInput,
  Stage2ReadinessStatus,
  Stage2ReadinessWarning,
} from "./stage2ReadinessTypes";

function blocker(code: string, message: string): Stage2ReadinessBlocker {
  return { code, message };
}

export function evaluateStage2Readiness(input: Stage2ReadinessInput = {}): Stage2ReadinessStatus {
  const stage2Requested = input.stage2Requested === true;
  const crawlBundleReady = input.crawlBundleValidation?.ok === true;
  const copyBundleReady = input.copyBundleValidation?.ok === true;
  const ownershipGuardrailsPassed = input.ownershipGuardrailsPassed === true;
  const boardTruthBoundaryPassed = input.boardTruthBoundaryPassed === true;
  const runtimeIntegrationApproved = input.runtimeIntegrationApproved === true;

  const blockers: Stage2ReadinessBlocker[] = [];
  const warnings: Stage2ReadinessWarning[] = [];

  if (!stage2Requested) {
    blockers.push(blocker("stage2_not_requested", "Stage 2 has not been explicitly requested."));
  }
  if (!crawlBundleReady) {
    blockers.push(blocker("crawl_bundle_not_ready", "Crawl bundle validation is missing or not successful."));
  }
  if (!copyBundleReady) {
    blockers.push(blocker("copy_bundle_not_ready", "Copy bundle validation is missing or not successful."));
  }
  if (!ownershipGuardrailsPassed) {
    blockers.push(blocker("ownership_guardrails_not_confirmed", "Ownership guardrail tests are not confirmed as passing."));
  }
  if (!boardTruthBoundaryPassed) {
    blockers.push(blocker("board_truth_boundary_not_confirmed", "Board-truth boundary test is not confirmed as passing."));
  }
  if (!runtimeIntegrationApproved) {
    blockers.push(blocker("runtime_integration_not_approved", "Runtime integration has not been approved."));
  }

  const readyForRuntimeIntegration =
    stage2Requested &&
    crawlBundleReady &&
    copyBundleReady &&
    ownershipGuardrailsPassed &&
    boardTruthBoundaryPassed &&
    runtimeIntegrationApproved;

  const readyForVisibleCopy =
    readyForRuntimeIntegration &&
    crawlBundleReady &&
    copyBundleReady;

  const readyForStage3 = false;

  const stage2Enabled = false;

  return {
    stage2Enabled,
    runtimeIntegrationApproved,
    crawlBundleReady,
    copyBundleReady,
    ownershipGuardrailsPassed,
    boardTruthBoundaryPassed,
    blockers,
    warnings,
    summary: {
      readyForRuntimeIntegration,
      readyForVisibleCopy,
      readyForStage3,
    },
  };
}
