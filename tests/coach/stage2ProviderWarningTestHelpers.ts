import type { Stage2ProviderWarning, Stage2ProviderWarningContext } from "../../lib/blundr/providers/providerWarningPolicy";

export function warningIds(warnings: Stage2ProviderWarning[] | undefined | null): string[] {
  return Array.isArray(warnings) ? warnings.map((warning) => warning.warningId) : [];
}

export function healthyLocalRuntimeContext(overrides: Partial<Stage2ProviderWarningContext> = {}): Stage2ProviderWarningContext {
  return {
    runtimeDataSource: "local_crawled_package",
    liveLichessCalled: false,
    runtimeAvailable: true,
    selectedOpeningRuntimeAvailable: true,
    trainingMode: "restricted",
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    visibleSurfaceMode: "assisted",
    stockfishProviderStatus: "ready",
    stockfishValidationStatus: "ready",
    maiaProviderStatus: "disabled",
    approvedContentMatched: true,
    stage2ApprovedContentEnabled: true,
    ...overrides,
  };
}

export function maiaAuthorityContext(overrides: Partial<Stage2ProviderWarningContext> = {}): Stage2ProviderWarningContext {
  return {
    runtimeDataSource: "local_crawled_package",
    liveLichessCalled: false,
    runtimeAvailable: true,
    selectedOpeningRuntimeAvailable: true,
    trainingMode: "continuation",
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    visibleSurfaceMode: "assisted",
    maiaProviderStatus: "ready",
    maiaRuntimeStatus: "ready",
    maiaAllowedThisFrame: false,
    stage2ApprovedContentEnabled: true,
    ...overrides,
  };
}

export function stockfishAuthorityContext(overrides: Partial<Stage2ProviderWarningContext> = {}): Stage2ProviderWarningContext {
  return {
    runtimeDataSource: "local_crawled_package",
    liveLichessCalled: false,
    runtimeAvailable: true,
    selectedOpeningRuntimeAvailable: true,
    trainingMode: "continuation",
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    visibleSurfaceMode: "assisted",
    stockfishProviderStatus: "ready",
    stockfishValidationStatus: "ready",
    stage2ApprovedContentEnabled: true,
    ...overrides,
  };
}

export function safeFallbackContext(overrides: Partial<Stage2ProviderWarningContext> = {}): Stage2ProviderWarningContext {
  return {
    runtimeDataSource: "local_crawled_package",
    liveLichessCalled: false,
    runtimeAvailable: true,
    selectedOpeningRuntimeAvailable: true,
    trainingMode: "continuation",
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    visibleSurfaceMode: "assisted",
    stockfishProviderStatus: "unavailable",
    stockfishValidationStatus: "unavailable",
    approvedContentMatched: false,
    approvedPacketKind: "safe_fallback",
    runtimeSafeFallbackUsed: true,
    runtimeSafeFallbackReason: "stockfish_provider_unavailable",
    stage2ApprovedContentEnabled: true,
    stage2SafeFallbackEnabled: true,
    ...overrides,
  };
}

export function continuationFallbackContext(overrides: Partial<Stage2ProviderWarningContext> = {}): Stage2ProviderWarningContext {
  return {
    runtimeDataSource: "local_crawled_package",
    liveLichessCalled: false,
    runtimeAvailable: true,
    selectedOpeningRuntimeAvailable: true,
    trainingMode: "continuation",
    trainerPhase: "ready_for_user",
    isUserTurn: true,
    visibleSurfaceMode: "assisted",
    stockfishProviderStatus: "unavailable",
    stockfishValidationStatus: "unavailable",
    approvedContentMatched: false,
    approvedPacketKind: "safe_fallback",
    runtimeSafeFallbackUsed: true,
    runtimeSafeFallbackReason: "continuation_provider_unavailable",
    stage2ApprovedContentEnabled: true,
    stage2SafeFallbackEnabled: true,
    ...overrides,
  };
}
