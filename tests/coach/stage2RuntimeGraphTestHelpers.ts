import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";

export function buildStage2RuntimeGraphSnapshot(overrides: Record<string, unknown> = {}) {
  const currentPly = Number(overrides.selectedRuntimeLineCurrentPly ?? overrides.stage2OpeningCurrentPly ?? 12);
  const selectedOpeningId = String(overrides.selectedOpeningId ?? "italian-white");
  const selectedLineId = String(overrides.selectedLineId ?? `${selectedOpeningId}:0`);
  const selectedRuntimeLineId = String(overrides.selectedRuntimeLineId ?? selectedLineId);
  const playSequenceUci = Array.isArray(overrides.selectedRuntimeLinePlaySequenceUci)
    ? (overrides.selectedRuntimeLinePlaySequenceUci as string[])
    : [
        "e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "g8f6",
        "f3g5", "d7d5", "e4d5", "c6a5", "c4b5", "c7c6",
      ];
  const moveHistory = Array.isArray(overrides.moveHistory)
    ? (overrides.moveHistory as unknown[])
    : playSequenceUci.slice(0, Math.max(0, currentPly));
  const lastMoveUci = moveHistory.length > 0 ? String(moveHistory[moveHistory.length - 1]) : null;
  const lineComplete = Boolean(overrides.selectedLineCompleteConfirmed ?? currentPly >= playSequenceUci.length);
  const branchTransitionRendered = Boolean(overrides.branchTransitionSurfaceRendered ?? lineComplete);
  const visibleTitle = String(overrides.visibleTitle ?? (lineComplete ? "Line complete" : "Book progress"));

  return buildTrainerDebugSnapshot({
    debugEnabled: true,
    fen: String(overrides.fen ?? "r1bqkb1r/pppp1ppp/2n5/4p3/2BPP3/5N2/PPP2PPP/RNBQ1RK1 b kq - 0 6"),
    trainerFrameId: Number(overrides.trainerFrameId ?? 610),
    trainerPhase: String(overrides.trainerPhase ?? "ready_for_user"),
    trainerView: String(overrides.trainerView ?? "assisted"),
    trainingMode: String(overrides.trainingMode ?? "restricted"),
    isUserTurn: Boolean(overrides.isUserTurn ?? false),
    moveHistory,
    lastMoveUci,
    lastMoveSan: overrides.lastMoveSan ?? null,
    lastMoveColor: overrides.lastMoveColor ?? null,
    lastUserMoveUci: overrides.lastUserMoveUci ?? lastMoveUci,
    lastUserMoveSan: overrides.lastUserMoveSan ?? overrides.lastMoveSan ?? null,
    userExplicitlyEnteredContinuation: Boolean(overrides.userExplicitlyEnteredContinuation ?? false),
    selectedOpeningId,
    selectedLineId,
    selectedRuntimeLineId,
    selectedRuntimeLineKey: String(overrides.selectedRuntimeLineKey ?? `${selectedRuntimeLineId}:${playSequenceUci.join(",")}`),
    selectedRuntimeLinePlayKey: String(overrides.selectedRuntimeLinePlayKey ?? playSequenceUci.join(",")),
    selectedRuntimeLinePlaySequenceUci: playSequenceUci,
    selectedRuntimeLinePlyLength: playSequenceUci.length,
    selectedRuntimeLineCurrentPly: currentPly,
    selectedRuntimeLineExhausted: Boolean(overrides.selectedRuntimeLineExhausted ?? currentPly >= playSequenceUci.length),
    stage2OpeningDepthTargetPly: Number(overrides.stage2OpeningDepthTargetPly ?? 12),
    stage2OpeningCurrentPly: Number(overrides.stage2OpeningCurrentPly ?? currentPly),
    stage2OpeningDepthReached: Boolean(overrides.stage2OpeningDepthReached ?? currentPly >= 12),
    bookCompleteAllowed: Boolean(overrides.bookCompleteAllowed ?? overrides.guidedCompleteAllowed ?? false),
    guidedCompleteAllowed: Boolean(overrides.guidedCompleteAllowed ?? overrides.bookCompleteAllowed ?? false),
    runtimeGraphAuthorityUsed: String(overrides.runtimeGraphAuthorityUsed ?? "local_runtime_package"),
    runtimeGraphCurrentPlayKey: String(overrides.runtimeGraphCurrentPlayKey ?? playSequenceUci.slice(0, currentPly).join(",")),
    runtimeGraphCandidateCount: Number(overrides.runtimeGraphCandidateCount ?? 3),
    runtimeGraphSelectedCandidateUci: String(overrides.runtimeGraphSelectedCandidateUci ?? "f1c4"),
    selectedRuntimeLineUsedFor: String(overrides.selectedRuntimeLineUsedFor ?? "opening_stage"),
    hardRailDetected: Boolean(overrides.hardRailDetected ?? false),
    hardRailBlockedReason: overrides.hardRailBlockedReason ?? null,
    selectedLineCompleteConfirmed: lineComplete,
    terminalProofLineAuthority: String(overrides.terminalProofLineAuthority ?? "selected_runtime_line_play_sequence_uci"),
    terminalProofBlockedReason: overrides.terminalProofBlockedReason ?? (lineComplete ? null : "runtime_line_not_exhausted"),
    runtimeBookQueried: Boolean(overrides.runtimeBookQueried ?? true),
    runtimeBookOpeningId: String(overrides.runtimeBookOpeningId ?? selectedOpeningId),
    runtimeBookPlayKeyBefore: String(overrides.runtimeBookPlayKeyBefore ?? playSequenceUci.slice(0, Math.max(0, currentPly)).join(",")),
    runtimeBookStatus: String(overrides.runtimeBookStatus ?? "ready"),
    runtimeBookCandidateCount: Number(overrides.runtimeBookCandidateCount ?? 0),
    runtimeBookBookExhausted: Boolean(overrides.runtimeBookBookExhausted ?? !lineComplete),
    continueFromHereClicked: Boolean(overrides.continueFromHereClicked ?? false),
    continueFromHereClickHandled: Boolean(overrides.continueFromHereClickHandled ?? false),
    continueFromHereClickBlockedReason: overrides.continueFromHereClickBlockedReason ?? null,
    continuationSessionId: overrides.continuationSessionId ?? null,
    branchTransitionSurfaceRendered: branchTransitionRendered,
    continueFromHereAvailable: Boolean(overrides.continueFromHereAvailable ?? branchTransitionRendered),
    continueFromHereButtonRendered: Boolean(overrides.continueFromHereButtonRendered ?? branchTransitionRendered),
    branchCompleteEligible: Boolean(overrides.branchCompleteEligible ?? lineComplete),
    branchCompleteReason: overrides.branchCompleteReason ?? (lineComplete ? "selected_line_exhausted" : null),
    branchCompleteBlockedReason: overrides.branchCompleteBlockedReason ?? null,
    visibleTeachingSurface: overrides.visibleTeachingSurface ?? {
      owner: "v28_visible_surface",
      mode: branchTransitionRendered ? "branch_complete" : "guided_move",
      coach: {
        shouldRender: true,
        title: visibleTitle,
        body: visibleTitle,
        buttons: branchTransitionRendered ? ["continue_from_here", "restart_line"] : [],
      },
      visual: { lines: [] },
      actions: branchTransitionRendered ? [{ kind: "continue_from_here" }, { kind: "restart_line" }] : [],
      safety: { blocked: false, criticalIssues: [] },
      debug: {
        visibleCoachOwner: "visible_surface_v28",
        visibleVisualOwner: "visible_surface_v28",
        visibleActionOwner: "visible_surface_v28",
      },
    },
    presentationFrame: overrides.presentationFrame ?? {
      coach: {
        shouldRender: true,
        owner: branchTransitionRendered ? "branch_transition_surface" : "visible_surface_v28",
        title: visibleTitle,
        body: visibleTitle,
        buttons: branchTransitionRendered ? ["continue_from_here", "restart_line"] : [],
      },
      visual: { shouldRender: false, source: "none" },
      legacy: {},
    },
    coachDecision: overrides.coachDecision ?? {
      shouldShowCoachCard: true,
      title: visibleTitle,
      body: visibleTitle,
      buttons: branchTransitionRendered ? ["continue_from_here", "restart_line"] : [],
      debug: {
        coachDecisionSource: branchTransitionRendered ? "branch_transition_surface" : "visible_surface_v28",
        coachMoveUci: null,
        coachPieceType: null,
        coachQuality: { qualityScore: 90, targetAligned: false, pieceAligned: false, containsDebugLeak: false },
      },
    },
    actualCoachCardTitle: visibleTitle,
    actualCoachCardBody: visibleTitle,
    actualCoachCardButtons: branchTransitionRendered ? ["continue_from_here", "restart_line"] : [],
    actualCoachCardSource: branchTransitionRendered ? "surfaceCoachCardDecision" : "visible_surface_v28",
    actualVisualSource: "visible_surface_v28",
    renderedActionIds: branchTransitionRendered ? ["continue_from_here", "restart_line"] : [],
    surfaceActionIds: branchTransitionRendered ? ["continue_from_here", "restart_line"] : [],
    renderedVisualPrimitiveCount: 0,
    surfaceVisualPrimitiveCount: 0,
    coachQuality: {
      qualityScore: 90,
      qualityScoreSource: "final_rendered",
      source: "final_rendered",
      targetAligned: false,
      pieceAligned: false,
      usedFallback: false,
      containsDebugLeak: false,
    },
    maiaOpponentProviderStatus: String(overrides.maiaOpponentProviderStatus ?? "disabled"),
    maiaRuntimeErrorReason: overrides.maiaRuntimeErrorReason ?? null,
    maiaContinuationEnabled: Boolean(overrides.maiaContinuationEnabled ?? (Boolean(overrides.userExplicitlyEnteredContinuation) && String(overrides.trainingMode ?? "restricted") === "continuation")),
    maiaContinuationStatus: String(overrides.maiaContinuationStatus ?? overrides.maiaOpponentProviderStatus ?? "disabled"),
    maiaContinuationLoaded: Boolean(overrides.maiaContinuationLoaded ?? false),
    maiaContinuationError: overrides.maiaContinuationError ?? null,
    maiaOpponentProviderUsed: Boolean(overrides.maiaOpponentProviderUsed ?? false),
    maiaOpponentRequestPending: Boolean(overrides.maiaOpponentRequestPending ?? false),
    maiaOpponentLastMoveUci: overrides.maiaOpponentLastMoveUci ?? null,
    pendingOpponentRequest: overrides.pendingOpponentRequest ?? null,
    opponentColor: overrides.opponentColor ?? "b",
    eventLog: [],
  } as any);
}
