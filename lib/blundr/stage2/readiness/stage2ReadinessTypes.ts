export interface Stage2ReadinessInput {
  stage2Requested?: boolean;
  crawlBundleValidation?: {
    ok: boolean;
    errors?: unknown[];
    warnings?: unknown[];
  } | null;
  copyBundleValidation?: {
    ok: boolean;
    errors?: unknown[];
    warnings?: unknown[];
  } | null;
  ownershipGuardrailsPassed?: boolean;
  boardTruthBoundaryPassed?: boolean;
  runtimeIntegrationApproved?: boolean;
}

export interface Stage2ReadinessBlocker {
  code: string;
  message: string;
}

export interface Stage2ReadinessWarning {
  code: string;
  message: string;
}

export interface Stage2ReadinessStatus {
  stage2Enabled: boolean;
  runtimeIntegrationApproved: boolean;
  crawlBundleReady: boolean;
  copyBundleReady: boolean;
  ownershipGuardrailsPassed: boolean;
  boardTruthBoundaryPassed: boolean;
  blockers: Stage2ReadinessBlocker[];
  warnings: Stage2ReadinessWarning[];
  summary: {
    readyForRuntimeIntegration: boolean;
    readyForVisibleCopy: boolean;
    readyForStage3: boolean;
  };
}
