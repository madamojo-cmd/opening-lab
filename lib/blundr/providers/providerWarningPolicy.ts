export type Stage2ProviderId =
  | "local_runtime_package"
  | "historical_lichess_source"
  | "maia"
  | "stockfish"
  | "approved_content"
  | "safe_fallback"
  | "debug_snapshot";

export type Stage2ProviderRole =
  | "authoritative_runtime_source"
  | "historical_source_only"
  | "opponent_reply_provider"
  | "continuation_validator"
  | "approved_content_enricher"
  | "safe_fallback_renderer"
  | "debug_report_only";

export type Stage2ProviderWarningSeverity = "info" | "warning" | "degraded" | "blocked" | "critical";

export type Stage2ProviderWarningAuthorityImpact = "none" | "blocked_non_authority_feature" | "blocked_frame";

export type Stage2ProviderWarning = {
  providerId: Stage2ProviderId;
  warningId: string;
  severity: Stage2ProviderWarningSeverity;
  userVisible: boolean;
  debugOnly: boolean;
  message: string;
  fallbackUsed: boolean;
  authorityImpact: Stage2ProviderWarningAuthorityImpact;
  affectedFeature: string | null;
};

export type Stage2ProviderWarningPolicyProvider = {
  providerId: Stage2ProviderId;
  allowedRoles: Stage2ProviderRole[];
  disallowedRoles: Stage2ProviderRole[];
  warningIds: string[];
};

export type Stage2ProviderWarningPolicyWarning = {
  warningId: string;
  providerIds: Stage2ProviderId[];
  severity: Stage2ProviderWarningSeverity;
  userVisible: boolean;
  debugOnly: boolean;
  fallbackBehavior: string;
  authorityImpact: Stage2ProviderWarningAuthorityImpact;
  tests: string[];
};

export type Stage2ProviderWarningPolicy = {
  policyId: "stage2-provider-warning-policy";
  version: string;
  providers: Stage2ProviderWarningPolicyProvider[];
  warnings: Stage2ProviderWarningPolicyWarning[];
};

export type Stage2ProviderWarningSummary = {
  totalWarnings: number;
  maxSeverity: Stage2ProviderWarningSeverity | "none";
  userVisibleCount: number;
  debugOnlyCount: number;
  fallbackUsedCount: number;
  blockedFrameCount: number;
  blockedNonAuthorityFeatureCount: number;
  byProviderId: Record<Stage2ProviderId, number>;
  bySeverity: Record<Stage2ProviderWarningSeverity, number>;
};

export type Stage2ProviderWarningContext = {
  runtimeDataSource?: string | null;
  liveLichessCalled?: boolean | null;
  runtimeAvailable?: boolean | null;
  runtimeBookQueried?: boolean | null;
  runtimeBookStatus?: string | null;
  runtimeBookBookExhausted?: boolean | null;
  runtimeBookFallbackUsed?: boolean | null;
  runtimeBookFallbackAuthority?: string | null;
  selectedOpeningRuntimeAvailable?: boolean | null;
  selectedOpeningContentStatus?: string | null;
  selectedOpeningApprovedContentAvailable?: boolean | null;
  trainingMode?: string | null;
  trainerPhase?: string | null;
  isUserTurn?: boolean | null;
  visibleSurfaceMode?: string | null;
  stockfishProviderStatus?: string | null;
  stockfishValidationStatus?: string | null;
  stockfishValidationAvailable?: boolean | null;
  maiaProviderStatus?: string | null;
  maiaRuntimeStatus?: string | null;
  maiaAllowedThisFrame?: boolean | null;
  maiaFallbackUsed?: boolean | null;
  maiaFallbackReason?: string | null;
  stage2ApprovedContentEnabled?: boolean | null;
  stage2SafeFallbackEnabled?: boolean | null;
  approvedContentMatched?: boolean | null;
  approvedPacketKind?: string | null;
  approvedPacketFallbackReason?: string | null;
  approvedPacketMissReason?: string | null;
  stage2CoachingPacketKind?: string | null;
  stage2CoachingSafetyStatus?: string | null;
  stage2CoachingRuntimeMatched?: boolean | null;
  stage2CoachingResolverEnabled?: boolean | null;
  runtimeSafeFallbackUsed?: boolean | null;
  runtimeSafeFallbackReason?: string | null;
  candidateSource?: string | null;
};

const PROVIDER_ORDER: Stage2ProviderId[] = [
  "local_runtime_package",
  "historical_lichess_source",
  "maia",
  "stockfish",
  "approved_content",
  "safe_fallback",
  "debug_snapshot",
];

const SEVERITY_RANK: Record<Stage2ProviderWarningSeverity, number> = {
  info: 0,
  warning: 1,
  degraded: 2,
  blocked: 3,
  critical: 4,
};

export const STAGE2_PROVIDER_WARNING_POLICY: Stage2ProviderWarningPolicy = {
  policyId: "stage2-provider-warning-policy",
  version: "v1",
  providers: [
    {
      providerId: "local_runtime_package",
      allowedRoles: ["authoritative_runtime_source"],
      disallowedRoles: ["historical_source_only", "opponent_reply_provider"],
      warningIds: ["local_runtime_loaded", "local_runtime_missing", "no_live_lichess_required", "live_lichess_disabled", "live_lichess_call_blocked"],
    },
    {
      providerId: "historical_lichess_source",
      allowedRoles: ["historical_source_only"],
      disallowedRoles: ["authoritative_runtime_source"],
      warningIds: ["live_lichess_disabled", "live_lichess_call_blocked"],
    },
    {
      providerId: "maia",
      allowedRoles: ["opponent_reply_provider"],
      disallowedRoles: ["authoritative_runtime_source"],
      warningIds: ["maia_unavailable", "maia_not_required_for_restricted_frame", "maia_opponent_reply_only", "maia_not_user_move_authority"],
    },
    {
      providerId: "stockfish",
      allowedRoles: ["continuation_validator"],
      disallowedRoles: ["authoritative_runtime_source"],
      warningIds: ["stockfish_unavailable", "stockfish_validation_unavailable", "stockfish_not_user_move_authority", "continuation_provider_fallback_used"],
    },
    {
      providerId: "approved_content",
      allowedRoles: ["approved_content_enricher"],
      disallowedRoles: ["authoritative_runtime_source"],
      warningIds: ["approved_content_not_matched", "approved_content_fallback_used"],
    },
    {
      providerId: "safe_fallback",
      allowedRoles: ["safe_fallback_renderer"],
      disallowedRoles: ["authoritative_runtime_source"],
      warningIds: ["safe_fallback_used"],
    },
    {
      providerId: "debug_snapshot",
      allowedRoles: ["debug_report_only"],
      disallowedRoles: ["authoritative_runtime_source"],
      warningIds: ["provider_warning_debug_only", "provider_warning_user_visible", "provider_no_authority_impact"],
    },
  ],
  warnings: [
    {
      warningId: "local_runtime_loaded",
      providerIds: ["local_runtime_package"],
      severity: "info",
      userVisible: false,
      debugOnly: true,
      fallbackBehavior: "none",
      authorityImpact: "none",
      tests: ["tests/coach/runtimeDataSourceDebug.test.ts", "tests/coach/noLiveLichessRuntimeCalls.test.ts"],
    },
    {
      warningId: "local_runtime_missing",
      providerIds: ["local_runtime_package"],
      severity: "blocked",
      userVisible: true,
      debugOnly: false,
      fallbackBehavior: "block_frame",
      authorityImpact: "blocked_frame",
      tests: ["tests/coach/runtimeCanonical21Openings.test.ts"],
    },
    {
      warningId: "no_live_lichess_required",
      providerIds: ["local_runtime_package"],
      severity: "info",
      userVisible: false,
      debugOnly: true,
      fallbackBehavior: "none",
      authorityImpact: "none",
      tests: ["tests/coach/noLiveLichessRuntimeCalls.test.ts", "tests/coach/stage2ApprovedRuntimeSeparation.test.ts"],
    },
    {
      warningId: "live_lichess_disabled",
      providerIds: ["historical_lichess_source", "local_runtime_package"],
      severity: "info",
      userVisible: false,
      debugOnly: true,
      fallbackBehavior: "none",
      authorityImpact: "none",
      tests: ["tests/coach/noLiveLichessRuntimeCalls.test.ts"],
    },
    {
      warningId: "live_lichess_call_blocked",
      providerIds: ["historical_lichess_source"],
      severity: "blocked",
      userVisible: true,
      debugOnly: false,
      fallbackBehavior: "block_call",
      authorityImpact: "blocked_frame",
      tests: ["tests/coach/noLiveLichessRuntimeCalls.test.ts"],
    },
    {
      warningId: "maia_unavailable",
      providerIds: ["maia"],
      severity: "degraded",
      userVisible: false,
      debugOnly: true,
      fallbackBehavior: "safe_fallback_or_skip",
      authorityImpact: "blocked_non_authority_feature",
      tests: ["tests/coach/stage2ProviderWarningDebugTruth.test.ts"],
    },
    {
      warningId: "maia_not_required_for_restricted_frame",
      providerIds: ["maia"],
      severity: "info",
      userVisible: false,
      debugOnly: true,
      fallbackBehavior: "none",
      authorityImpact: "none",
      tests: ["tests/coach/stage2ProviderWarningDebugTruth.test.ts"],
    },
    {
      warningId: "maia_opponent_reply_only",
      providerIds: ["maia"],
      severity: "info",
      userVisible: false,
      debugOnly: true,
      fallbackBehavior: "none",
      authorityImpact: "none",
      tests: ["tests/coach/stage2ProviderWarningPolicy.test.ts"],
    },
    {
      warningId: "maia_not_user_move_authority",
      providerIds: ["maia"],
      severity: "info",
      userVisible: false,
      debugOnly: true,
      fallbackBehavior: "none",
      authorityImpact: "none",
      tests: ["tests/coach/stage2ProviderWarningPolicy.test.ts"],
    },
    {
      warningId: "stockfish_unavailable",
      providerIds: ["stockfish"],
      severity: "degraded",
      userVisible: true,
      debugOnly: false,
      fallbackBehavior: "safe_fallback_or_skip",
      authorityImpact: "blocked_non_authority_feature",
      tests: ["tests/coach/coachTitlesAndStockfishWarnings.test.ts", "tests/coach/stage2ProviderWarningDebugTruth.test.ts"],
    },
    {
      warningId: "stockfish_validation_unavailable",
      providerIds: ["stockfish"],
      severity: "degraded",
      userVisible: true,
      debugOnly: false,
      fallbackBehavior: "safe_fallback_or_skip",
      authorityImpact: "blocked_non_authority_feature",
      tests: ["tests/coach/stockfishValidationGate.test.ts"],
    },
    {
      warningId: "stockfish_not_user_move_authority",
      providerIds: ["stockfish"],
      severity: "info",
      userVisible: false,
      debugOnly: true,
      fallbackBehavior: "none",
      authorityImpact: "none",
      tests: ["tests/coach/stage2ProviderWarningPolicy.test.ts"],
    },
    {
      warningId: "continuation_provider_fallback_used",
      providerIds: ["stockfish", "safe_fallback"],
      severity: "warning",
      userVisible: true,
      debugOnly: false,
      fallbackBehavior: "safe_fallback",
      authorityImpact: "none",
      tests: ["tests/coach/runtimeBookExhaustionContinuation.test.ts", "tests/coach/stage2ProviderWarningDebugTruth.test.ts"],
    },
    {
      warningId: "approved_content_not_matched",
      providerIds: ["approved_content"],
      severity: "warning",
      userVisible: false,
      debugOnly: true,
      fallbackBehavior: "safe_fallback_preserved",
      authorityImpact: "none",
      tests: ["tests/coach/stage2FeatureTraceFallbackTruth.test.ts", "tests/coach/stage2ProviderWarningDebugTruth.test.ts"],
    },
    {
      warningId: "approved_content_fallback_used",
      providerIds: ["approved_content", "safe_fallback"],
      severity: "info",
      userVisible: false,
      debugOnly: true,
      fallbackBehavior: "safe_fallback",
      authorityImpact: "none",
      tests: ["tests/coach/stage2ApprovedLiveRenderingFallback.test.ts", "tests/coach/stage2ProviderWarningDebugTruth.test.ts"],
    },
    {
      warningId: "safe_fallback_used",
      providerIds: ["safe_fallback"],
      severity: "info",
      userVisible: false,
      debugOnly: true,
      fallbackBehavior: "preserve_lesson_flow",
      authorityImpact: "none",
      tests: ["tests/coach/stage2FeatureTraceFallbackTruth.test.ts", "tests/coach/stage2ProviderWarningDebugTruth.test.ts"],
    },
    {
      warningId: "provider_warning_debug_only",
      providerIds: ["debug_snapshot"],
      severity: "info",
      userVisible: false,
      debugOnly: true,
      fallbackBehavior: "none",
      authorityImpact: "none",
      tests: ["tests/coach/stage2ProviderWarningPolicy.test.ts"],
    },
    {
      warningId: "provider_warning_user_visible",
      providerIds: ["debug_snapshot"],
      severity: "info",
      userVisible: true,
      debugOnly: false,
      fallbackBehavior: "none",
      authorityImpact: "none",
      tests: ["tests/coach/stage2ProviderWarningPolicy.test.ts"],
    },
    {
      warningId: "provider_no_authority_impact",
      providerIds: ["debug_snapshot"],
      severity: "info",
      userVisible: false,
      debugOnly: true,
      fallbackBehavior: "none",
      authorityImpact: "none",
      tests: ["tests/coach/stage2ProviderWarningPolicy.test.ts"],
    },
  ],
};

function pushWarning(warnings: Stage2ProviderWarning[], warning: Stage2ProviderWarning): void {
  warnings.push(warning);
}

function addWarning(
  warnings: Stage2ProviderWarning[],
  providerId: Stage2ProviderId,
  warningId: string,
  severity: Stage2ProviderWarningSeverity,
  message: string,
  fallbackUsed: boolean,
  authorityImpact: Stage2ProviderWarningAuthorityImpact,
  affectedFeature: string | null,
  userVisible = false,
  debugOnly = true,
): void {
  pushWarning(warnings, {
    providerId,
    warningId,
    severity,
    userVisible,
    debugOnly,
    message,
    fallbackUsed,
    authorityImpact,
    affectedFeature,
  });
}

export function resolveStage2ProviderWarnings(context: Stage2ProviderWarningContext): Stage2ProviderWarning[] {
  const warnings: Stage2ProviderWarning[] = [];
  const runtimeDataSource = String(context.runtimeDataSource ?? "");
  const liveLichessCalled = Boolean(context.liveLichessCalled);
  const runtimeAvailable = context.runtimeAvailable !== false && (context.selectedOpeningRuntimeAvailable !== false);
  const trainingMode = String(context.trainingMode ?? "");
  const trainerPhase = String(context.trainerPhase ?? "");
  const isUserTurn = Boolean(context.isUserTurn);
  const visibleSurfaceMode = String(context.visibleSurfaceMode ?? "");
  const stockfishProviderStatus = String(context.stockfishProviderStatus ?? "");
  const stockfishValidationStatus = String(context.stockfishValidationStatus ?? "");
  const maiaProviderStatus = String(context.maiaProviderStatus ?? "");
  const maiaRuntimeStatus = String(context.maiaRuntimeStatus ?? maiaProviderStatus);
  const maiaAllowedThisFrame = Boolean(context.maiaAllowedThisFrame);
  const maiaFallbackUsed = Boolean(context.maiaFallbackUsed);
  const runtimeFallbackUsed = Boolean(context.runtimeSafeFallbackUsed ?? context.runtimeBookFallbackUsed);
  const approvedContentMatched = Boolean(context.approvedContentMatched);
  const approvedPacketKind = String(context.approvedPacketKind ?? context.stage2CoachingPacketKind ?? "");
  const approvedFallbackUsed = runtimeFallbackUsed || approvedPacketKind === "safe_fallback" || String(context.approvedPacketFallbackReason ?? context.runtimeSafeFallbackReason ?? context.maiaFallbackReason ?? "") === "safe_fallback";

  if (runtimeAvailable && runtimeDataSource === "local_crawled_package") {
    addWarning(warnings, "local_runtime_package", "local_runtime_loaded", "info", "Local crawled runtime package is loaded and authoritative for local training.", false, "none", "runtime_availability");
    addWarning(warnings, "local_runtime_package", "no_live_lichess_required", "info", "Local runtime training does not require a live Lichess call.", false, "none", "runtime_availability");
    addWarning(warnings, "local_runtime_package", "live_lichess_disabled", "info", "Live Lichess is disabled for local runtime training.", false, "none", "runtime_availability");
  }

  if (!runtimeAvailable) {
    addWarning(warnings, "local_runtime_package", "local_runtime_missing", "blocked", "Local runtime package is missing or unavailable.", false, "blocked_frame", "runtime_availability", true, false);
  }

  if (liveLichessCalled) {
    addWarning(warnings, "historical_lichess_source", "live_lichess_call_blocked", "blocked", "Live Lichess calls are blocked in Stage 2 local runtime training.", false, "blocked_frame", "historical_lichess_source", true, false);
  }

  if (maiaProviderStatus === "ready" || maiaRuntimeStatus === "ready") {
    if (!maiaAllowedThisFrame) {
      addWarning(warnings, "maia", "maia_opponent_reply_only", "info", "Maia may only participate in allowed opponent-reply roles.", false, "none", "continuation_authority");
      addWarning(warnings, "maia", "maia_not_user_move_authority", "info", "Maia won't choose your moves.", false, "none", "continuation_authority");
    }
  } else if (trainingMode === "restricted") {
    addWarning(warnings, "maia", "maia_not_required_for_restricted_frame", "info", "Maia is not required for restricted frames.", false, "none", "restricted_frame");
  } else if (trainingMode === "continuation" && isUserTurn && visibleSurfaceMode === "assisted") {
    addWarning(warnings, "maia", "maia_unavailable", "degraded", "Maia is unavailable for this optional continuation path. Training continues without it.", maiaFallbackUsed, "blocked_non_authority_feature", "continuation_authority", true, false);
  }

  if (trainingMode === "continuation" && isUserTurn && visibleSurfaceMode === "assisted") {
    if (stockfishProviderStatus !== "ready") {
      addWarning(warnings, "stockfish", "stockfish_unavailable", "degraded", "Stockfish is unavailable for optional continuation checks. Training continues with safe fallbacks.", runtimeFallbackUsed, "blocked_non_authority_feature", "continuation_validation", true, false);
    } else if (stockfishValidationStatus !== "ready") {
      addWarning(warnings, "stockfish", "stockfish_validation_unavailable", "degraded", "Stockfish validation is unavailable for this continuation frame.", runtimeFallbackUsed, "blocked_non_authority_feature", "continuation_validation", true, false);
    }
  }

  if (stockfishProviderStatus === "ready" || stockfishValidationStatus === "ready") {
    addWarning(warnings, "stockfish", "stockfish_not_user_move_authority", "info", "Stockfish checks continuation candidates, but it never chooses your moves.", false, "none", "continuation_validation");
  }

  if (approvedContentMatched === false) {
    addWarning(
      warnings,
      "approved_content",
      "approved_content_not_matched",
      approvedFallbackUsed ? "warning" : "degraded",
      approvedFallbackUsed
        ? "Approved content did not match, but safe fallback preserved the lesson flow."
        : "Approved content did not match the active frame.",
      approvedFallbackUsed,
      approvedFallbackUsed ? "none" : "blocked_non_authority_feature",
      "approved_content",
      false,
      true,
    );
  }

  if (approvedFallbackUsed) {
    addWarning(warnings, "approved_content", "approved_content_fallback_used", "info", "Approved content resolved via safe fallback.", true, "none", "approved_content");
    addWarning(warnings, "safe_fallback", "safe_fallback_used", "info", "Safe fallback preserved the visible lesson flow.", true, "none", "lesson_flow");
  }

  if (
    trainingMode === "continuation" &&
    isUserTurn &&
    (context.stage2CoachingPacketKind === "safe_fallback" || context.runtimeSafeFallbackUsed === true)
  ) {
    addWarning(warnings, "safe_fallback", "continuation_provider_fallback_used", "warning", "Continuation provider fallback was used to preserve the lesson flow.", true, "none", "continuation_validation", Boolean(isUserTurn && trainingMode === "continuation"), false);
  }

  return warnings.sort((left, right) => {
    if (SEVERITY_RANK[right.severity] !== SEVERITY_RANK[left.severity]) return SEVERITY_RANK[right.severity] - SEVERITY_RANK[left.severity];
    const providerIndexDiff = PROVIDER_ORDER.indexOf(left.providerId) - PROVIDER_ORDER.indexOf(right.providerId);
    if (providerIndexDiff !== 0) return providerIndexDiff;
    return left.warningId.localeCompare(right.warningId);
  });
}

export function summarizeStage2ProviderWarnings(warnings: Stage2ProviderWarning[]): Stage2ProviderWarningSummary {
  const summary: Stage2ProviderWarningSummary = {
    totalWarnings: warnings.length,
    maxSeverity: warnings.length ? warnings.reduce((max, entry) => (SEVERITY_RANK[entry.severity] > SEVERITY_RANK[max] ? entry.severity : max), "info" as Stage2ProviderWarningSeverity) : "none",
    userVisibleCount: 0,
    debugOnlyCount: 0,
    fallbackUsedCount: 0,
    blockedFrameCount: 0,
    blockedNonAuthorityFeatureCount: 0,
    byProviderId: {
      local_runtime_package: 0,
      historical_lichess_source: 0,
      maia: 0,
      stockfish: 0,
      approved_content: 0,
      safe_fallback: 0,
      debug_snapshot: 0,
    },
    bySeverity: {
      info: 0,
      warning: 0,
      degraded: 0,
      blocked: 0,
      critical: 0,
    },
  };

  for (const warning of warnings) {
    summary.byProviderId[warning.providerId] += 1;
    summary.bySeverity[warning.severity] += 1;
    summary.userVisibleCount += warning.userVisible ? 1 : 0;
    summary.debugOnlyCount += warning.debugOnly ? 1 : 0;
    summary.fallbackUsedCount += warning.fallbackUsed ? 1 : 0;
    summary.blockedFrameCount += warning.authorityImpact === "blocked_frame" ? 1 : 0;
    summary.blockedNonAuthorityFeatureCount += warning.authorityImpact === "blocked_non_authority_feature" ? 1 : 0;
  }

  return summary;
}
