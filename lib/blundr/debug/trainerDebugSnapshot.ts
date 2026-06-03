import { normalizeVisualFen } from "../visual/normalizeVisualFen";
import { buildCoachCacheDebug } from "../cache/cacheDebug";
import type { DebugEvent, TrainerDebugSnapshot } from "./trainerDebugTypes";
import { sanitizeForDebugJson } from "./trainerDebugSanitizer";
import { computeInstructionFrameKey } from "../runtime/currentInstructionFrame";  // v2.7.39.1 target locking
import { analyzeBlundrPosition } from "../brain/analyzeBlundrPosition";  // v2.7.39.2+ Brain facade exposure (debug only for now)

function len(value: unknown): number {
  return Array.isArray(value) ? value.length : value && typeof value === "object" ? Object.keys(value as Record<string, unknown>).length : 0;
}

function bool(value: unknown): boolean {
  return Boolean(value);
}

function isAllowedNullTargetState(input: any): boolean {
  const phase = String(input?.trainerPhase ?? "");
  const visibleSurfaceMode = String(input?.visibleTeachingSurface?.mode ?? "");
  const visibleSurfaceOwner = String(input?.visibleSurfaceOwner ?? input?.visibleTeachingSurface?.owner ?? "");
  const continuationRuntimeStatus = String(input?.continuationRuntimeStatus ?? input?.continuationAnalysisStatus ?? "");
  const continuationNullTargetStatus =
    String(input?.trainingMode ?? "") === "continuation" &&
    !input?.instructionTargetUci &&
    ["requested", "analyzing", "opponent_replying", "terminal", "transitioning"].includes(continuationRuntimeStatus);

  const phaseAllowed =
    phase === "branch_complete"
    || phase === "line_complete"
    || phase === "opponent_replying"
    || phase === "terminal"
    || phase === "transitioning";

  const surfaceAllowed =
    visibleSurfaceMode === "branch_complete"
    || visibleSurfaceMode === "opponent_replying"
    || visibleSurfaceMode === "terminal"
    || visibleSurfaceMode === "transitioning"
    || visibleSurfaceMode === "analyzing";

  const ownerAllowed = visibleSurfaceOwner === "v28_visible_surface" && surfaceAllowed;
  return phaseAllowed || surfaceAllowed || ownerAllowed || continuationNullTargetStatus;
}

function inferVisualFailure(input: any): string {
  if (isAllowedNullTargetState(input)) return "not_applicable";
  if (input.presentationFrame?.visual?.shouldRender) return "none";
  if (input.trainerView !== "assisted") return "not_assisted_view";
  if (!input.isUserTurn) return "not_user_turn";
  if (!input.visualRecipe) return "no_recipe";
  if (!input.visualRecipeOverlay?.adapterAllowed) return input.visualRecipeOverlay?.recipeFenMatchesBoard === false ? "fen_mismatch" : input.visualRecipeOverlay?.recipeFrameMatchesBoard === false ? "frame_mismatch" : "adapter_blocked";
  if (!input.visualRecipePrimitiveIds?.length) return "no_primitives";
  if (!input.playbackReady) return "playback_not_ready";
  if (!input.boardLines?.length) return "no_lines_after_playback";
  return "unknown";
}

function inferCoachFailure(input: any): string {
  const body = String(input.coachDecision?.body ?? "");
  const expected = input.expectedMoveSan || input.expectedMoveUci;
  if (isAllowedNullTargetState(input)) return "none";
  if (!input.coachDecision?.shouldShowCoachCard) return "none";
  if (input.coachDebug?.selectedOpportunityLayer === "fallback" && expected) return "generic_fallback_won";
  if (!expected && input.trainingMode === "restricted") return "expected_move_missing";
  if (input.coachDebug?.mappingBlockedReasons?.length && input.coachDebug?.selectedTemplateId == null) return "template_blocked";
  if (input.coachDebug?.coachSafetyWarnings?.length) return "safety_linter_blocked";
  if (/Improve the knight/i.test(body) && input.expectedMoveUci && !/^[bg][1-8][a-h][1-8]/.test(input.expectedMoveUci)) return "generic_fallback_won";
  return "none";
}

function expectedMoveAlignment(input: any): string {
  const selectedMove = input.coachDebug?.selectedOpportunityMoveUci ?? input.coachDecision?.debug?.coachSelectedCandidateMove;
  if (!input.expectedMoveUci && !input.expectedMoveSan) return "unknown";
  if (selectedMove === input.expectedMoveUci || selectedMove === input.expectedMoveSan) return "matches_expected_move";
  if (input.visualRecipe?.moveUci === input.expectedMoveUci) return "matches_visual_recipe";
  if (input.selectedCandidateUci && selectedMove === input.selectedCandidateUci) return "matches_continuation_candidate";
  return "unknown";
}

function isTeachingFrame(input: any): boolean {
  return input?.trainerPhase === "ready_for_user" && input?.isUserTurn === true;
}

function hasDebugLeakText(text: string): boolean {
  const lower = String(text).toLowerCase();
  const banned = [
    "verified move:",
    "pawn from",
    "knight from",
    "bishop from",
    "rook from",
    "queen from",
    "king from",
    "not_exposed_from_module",
    "pipeline",
    "fallback",
    "runtime",
    "candidate source",
  ];
  return banned.some((token) => lower.includes(token));
}

export function buildTrainerDebugSnapshot(input: Record<string, any>): TrainerDebugSnapshot {
  const started = Date.now();
  const boardFen4 = normalizeVisualFen(input.fen);
  const overlayFen4 = normalizeVisualFen(input.overlayFen ?? input.visualRecipe?.fen ?? input.fen);
  const recipeFen4 = normalizeVisualFen(input.visualRecipe?.fen);
  const coachDebug = input.coachDecision?.debug ?? {};
  const presentation = input.presentationFrame ?? {};
  const presentationCoach = presentation.coach ?? {};
  const v28OwnerActive =
    String(input.visibleCoachOwner ?? "") === "visible_surface_v28"
    || String(input.visibleSurfaceOwner ?? "") === "v28_visible_surface"
    || String(input.visibleTeachingSurface?.owner ?? "") === "v28_visible_surface";
  const surfaceCoach = input.visibleTeachingSurface?.coach ?? null;
  const surfaceActionsRaw = Array.isArray(input.visibleTeachingSurface?.actions) ? input.visibleTeachingSurface.actions : [];
  const surfaceActionKinds = surfaceActionsRaw.map((action: any) => (typeof action === "string" ? action : String(action?.kind ?? ""))).filter(Boolean);
  const visibleTitle = v28OwnerActive
    ? (surfaceCoach?.title ?? input.visibleTeachingSurface?.copy?.title ?? null)
    : (presentationCoach.shouldRender ? presentationCoach.title ?? null : input.coachDecision?.shouldShowCoachCard ? input.coachDecision?.title ?? null : null);
  const visibleBody = v28OwnerActive
    ? (surfaceCoach?.body ?? input.visibleTeachingSurface?.copy?.body ?? null)
    : (presentationCoach.shouldRender ? presentationCoach.body ?? null : input.coachDecision?.shouldShowCoachCard ? input.coachDecision?.body ?? null : null);
  const visibleBodyText = String(visibleBody ?? "");
  const visibleButtons = v28OwnerActive
    ? surfaceActionKinds
    : (presentationCoach.shouldRender ? presentationCoach.buttons ?? [] : input.coachDecision?.shouldShowCoachCard ? input.coachDecision?.buttons ?? [] : []);
  const visibleCoachOwner = v28OwnerActive ? "visible_surface_v28" : (presentationCoach.owner ?? "none");
  const visibleCoachIntent = v28OwnerActive
    ? (input.visibleTeachingSurface?.mode ?? presentationCoach.intent ?? input.coachDecision?.debug?.coachIntent ?? input.coachDecision?.debug?.selectedIntent ?? null)
    : (presentationCoach.intent ?? input.coachDecision?.debug?.coachIntent ?? input.coachDecision?.debug?.selectedIntent ?? null);
  const visualFailureKind = inferVisualFailure(input);
  const coachFailureKind = inferCoachFailure({ ...input, coachDebug });
  const continuationLinesPassedToBoard = input.trainingMode === "continuation" ? len(input.boardLines) : 0;
  const instructionTargetUci = input.instructionTargetUci ?? null;
  const instructionTargetPieceType = input.instructionTargetPieceType ?? null;
  const coachMoveUci = input.coachMoveUci ?? coachDebug.coachMoveUci ?? null;
  const coachPieceType = input.coachPieceType ?? coachDebug.coachPieceType ?? null;
  const visualMoveUci = input.visualMoveUci ?? null;
  const revealTargetUci = input.revealTargetUci ?? input.lastActionDebug?.revealTargetUci ?? null;
  const revealTargetSource = input.revealTargetSource ?? input.lastActionDebug?.revealTargetSource ?? null;
  const visualRecipeMoveUci = input.visualRecipeMoveUci ?? input.visualRecipe?.moveUci ?? null;
  const visualRecipeTargetMatchesInstructionTarget =
    input.visualRecipeTargetMatchesInstructionTarget ??
    (instructionTargetUci && visualRecipeMoveUci ? visualRecipeMoveUci === instructionTargetUci : "unknown");
  const criticalIssues: string[] = [];
  const warnings: string[] = [];
  const coachQuality = (input.coachQuality ?? coachDebug.coachQuality ?? {}) as any;
  const containsDebugLeak = Boolean(coachQuality.containsDebugLeak) || hasDebugLeakText(visibleBodyText);
  const instructionalCoachRecords = Array.isArray(input.lastCoachRecords)
    ? input.lastCoachRecords.filter((record: any) => record?.trainerPhase === "ready_for_user" && record?.instructionTargetUci).slice(-5)
    : [];
  const lastCoachRecords = instructionalCoachRecords;
  const coachTimeline = Array.isArray(input.coachTimeline) ? input.coachTimeline.slice(-100) : [];
  const coachCardRenderTimeline = Array.isArray(input.coachCardRenderTimeline) ? input.coachCardRenderTimeline.slice(-75) : [];
  const surfaceModeTransitionTimeline = Array.isArray(input.surfaceModeTransitionTimeline) ? input.surfaceModeTransitionTimeline.slice(-75) : [];
  const actionTimeline = Array.isArray(input.actionTimeline) ? input.actionTimeline.slice(-100) : [];
  const visualRenderTimeline = Array.isArray(input.visualRenderTimeline) ? input.visualRenderTimeline.slice(-75) : [];
  const plainLeakTimeline = Array.isArray(input.plainLeakTimeline) ? input.plainLeakTimeline.slice(-75) : [];
  const actualCoachCardTitle = input.actualCoachCardTitle == null ? null : String(input.actualCoachCardTitle);
  const actualCoachCardBody = input.actualCoachCardBody == null ? null : String(input.actualCoachCardBody);
  const actualCoachCardButtons = Array.isArray(input.actualCoachCardButtons) ? input.actualCoachCardButtons.map(String) : [];
  const actualCoachCardSource = input.actualCoachCardSource == null ? null : String(input.actualCoachCardSource);
  const actualActionSource = input.actualActionSource == null ? null : String(input.actualActionSource);
  const actualVisualSource = input.actualVisualSource == null ? null : String(input.actualVisualSource);
  const renderedActionIds = Array.isArray(input.renderedActionIds) ? input.renderedActionIds.map(String) : [];
  const surfaceActionIds = Array.isArray(input.surfaceActionIds) ? input.surfaceActionIds.map(String) : [];
  const renderedVisualPrimitiveCount = Number(input.renderedVisualPrimitiveCount ?? len(input.boardLines));
  const surfaceVisualPrimitiveCount = Number(input.surfaceVisualPrimitiveCount ?? len(input.visibleTeachingSurface?.visual?.lines));
  const verifiedFallbackUsed = Boolean(coachDebug.verifiedFallbackUsed || coachDebug.candidateCoachFallbackUsed);
  const expectedMoveExists = Boolean(input.expectedMoveSan || input.expectedMoveUci);
  const selectedOpportunityMoveSan = String(input.coachDecision?.debug?.coachSelectedCandidateMove ?? input.coachDebug?.selectedOpportunityMoveSan ?? "").trim();
  const selectedOpportunityMoveExists = selectedOpportunityMoveSan !== "" && selectedOpportunityMoveSan !== "none";
  const selectedTheme = String(coachDebug.selectedTheme ?? coachQuality.selectedTheme ?? "").trim() || null;
  const selectedOpportunityId = String(coachDebug.selectedOpportunityId ?? "").trim() || null;
  const selectedTemplateId = String(coachDebug.selectedTemplateId ?? coachDebug.mappingTemplateId ?? "").trim() || null;
  const selectedOpportunityLayer = String(coachDebug.selectedOpportunityLayer ?? "").trim() || null;
  const selectedOpportunityScoreRaw = Number(coachDebug.selectedOpportunityScore ?? Number.NaN);
  const selectedOpportunityScore = Number.isFinite(selectedOpportunityScoreRaw) ? selectedOpportunityScoreRaw : null;
  const coachSource = String(coachDebug.coachDecisionSource ?? coachQuality.source ?? "live_coach");
  const qualityScoreRaw = Number(coachQuality.qualityScore ?? Number.NaN);
  const qualityScore = Number.isFinite(qualityScoreRaw) ? qualityScoreRaw : null;
  const expectedMoveResolution = input.expectedMoveResolution ?? {};
  const guidedCoveragePolicy = input.guidedCoveragePolicy ?? {};
  const branchTransitionSurfaceRendered = Boolean(input.branchTransitionSurfaceRendered);
  const branchTransitionPayloadValid = Boolean(
    branchTransitionSurfaceRendered &&
      String(visibleTitle ?? "").trim() &&
      String(visibleBody ?? "").trim() &&
      visibleButtons.includes("continue_from_here") &&
      visibleButtons.includes("restart_line"),
  );
  if (input.trainerPhase === "transitioning") criticalIssues.push("illegal_transitioning_phase");
  if (input.trainerPhase === "opponent_animating") criticalIssues.push("illegal_transitioning_phase");
  if (input.pendingOpponentRequest && Date.now() - Number(input.pendingOpponentRequest.startedAt ?? 0) > 5000) {
    criticalIssues.push("opponent_reply_pending_too_long");
  }
  if (String(input.trainerPhase) === "line_complete" && !input.continueFromHereAvailable) {
    criticalIssues.push("line_complete_surface_missing");
  }
  // v2.7.39.1 Target Stability fix: only report terminal_surface_missing when we are in terminal phase
  // AND there is no evidence of a terminal surface (presentation coach owner, explicit feedback, or continuation terminal detection).
  // This eliminates the false critical that was firing on valid game-over / line-complete terminal states (Coach Perfection Gate).
  const hasTerminalSurfaceEvidence =
    /game over|line complete|terminal|checkmate|stalemate|draw/i.test(String(input.feedback ?? "")) ||
    presentationCoach.owner === "continuation_terminal_surface" ||
    presentationCoach.owner === "intent_first_coach" ||
    (typeof presentationCoach.shouldRender === "boolean" && presentationCoach.shouldRender) ||
    input.coachDecision?.shouldShowCoachCard;
  if (String(input.trainerPhase) === "terminal" && !hasTerminalSurfaceEvidence) {
    criticalIssues.push("terminal_surface_missing");
  }
  if (
    input.trainingMode === "restricted" &&
    input.trainerPhase === "ready_for_user" &&
    input.isUserTurn === true &&
    expectedMoveResolution.source === "none" &&
    !branchTransitionSurfaceRendered
  ) criticalIssues.push("restricted_user_turn_missing_expected_move");
  if (
    branchTransitionSurfaceRendered &&
    !branchTransitionPayloadValid
  ) criticalIssues.push("branch_transition_surface_missing_payload");
  if (
    input.trainingMode === "restricted" &&
    input.trainerPhase === "ready_for_user" &&
    input.isUserTurn === true &&
    expectedMoveResolution.source === "guided_branch_needs_continuation" &&
    !branchTransitionSurfaceRendered &&
    !expectedMoveResolution.shouldTransitionToContinuation
  ) criticalIssues.push("restricted_line_exhausted_but_completion_blocked");
  if (input.trainingMode === "restricted" && expectedMoveResolution.source === "engine_preview_fallback" && !expectedMoveResolution.debug?.engineFallbackInRestrictedUsed) criticalIssues.push("expected_move_source_engine_used_in_restricted_without_policy");
  if (
    expectedMoveResolution.expectedMoveUci &&
    input.trainerView === "assisted" &&
    !input.visualRecipe &&
    !["continuation_candidate", "guided_target_fallback"].includes(String(presentation.visual?.source ?? ""))
  ) warnings.push("visual_recipe_missing_for_resolved_expected_move");
  if (expectedMoveResolution.source === "opening_family_plan" && !expectedMoveResolution.debug?.openingFamilyPlanType) criticalIssues.push("opening_family_plan_used_without_plan_or_feature");
  if (input.coachDecision?.title === "Opening pattern" && ["opening_branch", "opening_family_plan", "transposition"].includes(expectedMoveResolution.source)) warnings.push("generic_coach_copy_used_for_branch_response");
  if (selectedOpportunityMoveExists && !expectedMoveResolution.expectedMoveUci && input.trainingMode === "restricted") criticalIssues.push("selectedOpportunityMoveSan exists but expectedMoveUci null");
  if (expectedMoveExists && coachDebug.selectedOpportunityLayer === "fallback") criticalIssues.push("expectedMove exists but fallback opportunity selected");
  if (input.coachDecision?.title === "Opening pattern" && expectedMoveExists && coachFailureKind !== "none") criticalIssues.push("Opening pattern title is paired with a suspicious/fallback coach decision");
  if (/Improve the knight/i.test(String(input.coachDecision?.body ?? "")) && input.expectedMoveUci && !["b", "g"].includes(String(input.expectedMoveUci)[0])) criticalIssues.push("Knight improvement copy shown for non-knight expected move");
  if (input.lastActionDebug?.lastClickedAction && input.lastActionDebug?.stateChanged === false && !input.lastActionDebug?.revealIdempotentNoop) criticalIssues.push("Action click did not change state");
  if (input.trainingMode === "continuation" && input.selectedCandidateUci && input.coachDecision?.exactMoveAllowed && continuationLinesPassedToBoard === 0) criticalIssues.push("continuation_candidate_not_rendered");
  const continuationRuntimeStatus = input.continuationRuntimeStatus ?? input.continuationAnalysisStatus ?? null;
  const continuationSurfaceMode = String(input.visibleTeachingSurface?.mode ?? "");
  const continuationNullTargetStatusFrame =
    String(input.trainingMode) === "continuation" &&
    !instructionTargetUci &&
    (
      ["requested", "analyzing", "opponent_replying", "terminal", "transitioning"].includes(String(continuationRuntimeStatus)) ||
      ["opponent_replying", "terminal", "branch_complete", "transitioning", "analyzing"].includes(continuationSurfaceMode) ||
      String(input.trainerPhase) === "transitioning"
    );
  const terminalRuntimeLike =
    String(input.trainerPhase) === "terminal" ||
    String(continuationRuntimeStatus) === "terminal" ||
    String(input.continuationTerminalReason ?? "") === "checkmate";
  const legalMoveCount = typeof input.legalMoveCount === "number" ? input.legalMoveCount : undefined;
  const lineExhaustedEvidence =
    Boolean(input.branchCompleteLineExhaustedEvidence) ||
    String(expectedMoveResolution.source ?? "") === "guided_branch_needs_continuation" ||
    /repertoire_line_exhausted_needs_continuation|line_exhausted|needs_continuation/i.test(String(expectedMoveResolution.reason ?? ""));
  const continuationTerminalDetected = input.trainingMode === "continuation" && (legalMoveCount === 0 || String(input.lastUserMoveSan ?? "").includes("#"));
  if (continuationTerminalDetected && continuationRuntimeStatus !== "terminal") criticalIssues.push("continuation_terminal_not_classified");
  if (continuationTerminalDetected && presentationCoach.owner !== "intent_first_coach" && presentationCoach.owner !== "continuation_terminal_surface" && presentationCoach.shouldRender !== true) criticalIssues.push("terminal_position_without_terminal_surface");
  if (input.trainingMode === "continuation" && input.userExplicitlyEnteredContinuation && (continuationRuntimeStatus === "idle" || input.continuationAnalysisStatus === "idle") && !continuationTerminalDetected) criticalIssues.push("continuation_idle_after_continue");
  if (input.trainingMode === "continuation" && input.trainerPhase === "transitioning" && !["analyzing", "opponent_replying", "terminal"].includes(String(continuationRuntimeStatus))) criticalIssues.push("transition_state_without_pending_work");
  if (isTeachingFrame(input) && instructionTargetUci == null && !branchTransitionSurfaceRendered) criticalIssues.push("instruction_target_missing_on_teaching_frame");
  if (input.isUserTurn && instructionTargetUci == null && String(input.trainerPhase) === "ready_for_user" && !branchTransitionSurfaceRendered) {
    criticalIssues.push("user_turn_missing_instruction_target");
    criticalIssues.push("ready_for_user_without_target");
  }
  if (instructionTargetUci && presentationCoach.shouldRender === false && !branchTransitionSurfaceRendered) criticalIssues.push("coach_missing_for_instruction_target");
  if (instructionTargetUci && presentationCoach.shouldRender === false && !branchTransitionSurfaceRendered) criticalIssues.push("silent_coach_with_instruction_target");
  if (instructionTargetUci && containsDebugLeak) criticalIssues.push("debug_copy_leaked_to_user");
  if (instructionTargetUci && coachMoveUci && instructionTargetUci !== coachMoveUci) {
    criticalIssues.push("coach_move_mismatch");
    criticalIssues.push("instruction_target_coach_mismatch");
  }
  // Agent 6: surface guard criticals
  if (input.visibleTeachingSurface?.safety?.blocked && isTeachingFrame(input)) {
    if (input.visibleTeachingSurface.safety.targetMismatch || input.visibleTeachingSurface.debug?.fourTargetMismatch) criticalIssues.push("surface_target_mismatch_blocked");
    if (input.visibleTeachingSurface.safety.pieceMismatch || input.visibleTeachingSurface.debug?.twoPieceTypeMismatch) criticalIssues.push("surface_piece_mismatch_blocked");
    if (input.visibleTeachingSurface.safety.plainLeakDetected) criticalIssues.push("plain_leak_detected_and_blocked");
    if (input.visibleTeachingSurface.safety.legacyBypassDetected) criticalIssues.push("surface_legacy_bypass_flagged");
  }
  if (instructionTargetUci && visualMoveUci && instructionTargetUci !== visualMoveUci) {
    criticalIssues.push("visual_target_mismatch");
    criticalIssues.push("instruction_target_visual_mismatch");
  }
  if (instructionTargetUci && revealTargetUci && instructionTargetUci !== revealTargetUci) {
    criticalIssues.push("reveal_target_mismatch");
    criticalIssues.push("instruction_target_reveal_mismatch");
  }
  if (instructionTargetUci && (coachMoveUci !== instructionTargetUci || (visualMoveUci && visualMoveUci !== instructionTargetUci) || (revealTargetUci && revealTargetUci !== instructionTargetUci))) {
    criticalIssues.push("presentation_debug_disagreement");
  }
  if (instructionTargetPieceType && coachPieceType && instructionTargetPieceType !== coachPieceType) {
    criticalIssues.push("coach_piece_mismatch");
    criticalIssues.push("instruction_piece_type_mismatch");
  }
  if (instructionTargetUci && isTeachingFrame(input)) {
    const featureStatus = String(coachDebug.featurePacket?.status ?? input.featurePacket?.status ?? "not_exposed_from_module");
    const planStatus = String(coachDebug.planPacket?.status ?? input.planPacket?.status ?? "not_exposed_from_module");
    const oppStatus = String(coachDebug.opportunityPacket?.status ?? input.opportunityPacket?.status ?? "not_exposed_from_module");
    if (featureStatus === "not_exposed_from_module") criticalIssues.push("missing_feature_pipeline");
    if (planStatus === "not_exposed_from_module") criticalIssues.push("missing_plan_pipeline");
    if (oppStatus === "not_exposed_from_module") criticalIssues.push("missing_opportunity_pipeline");
    if ((coachQuality.targetAligned ?? (coachMoveUci === instructionTargetUci)) !== true) criticalIssues.push("coach_target_mismatch");
    if ((coachQuality.pieceAligned ?? (!instructionTargetPieceType || !coachPieceType || instructionTargetPieceType === coachPieceType)) !== true) criticalIssues.push("coach_piece_mismatch");
    const score = Number(coachQuality.qualityScore ?? 0);
    if (score > 0) {
      const source = String(coachDebug.coachDecisionSource ?? coachQuality.source ?? "live_coach");
      const required = source === "verified_safe_fallback" ? 65 : 80;
      if (score < required) criticalIssues.push("coach_low_quality");
    }
    if (selectedOpportunityScore == null) criticalIssues.push("coach_score_missing");
    if (selectedTheme && selectedOpportunityId && selectedTheme !== selectedOpportunityId) {
      criticalIssues.push("coach_theme_opportunity_mismatch");
      criticalIssues.push("coach_provenance_inconsistent");
    }
    if (selectedTheme && selectedTemplateId && !selectedTemplateId.includes(selectedTheme) && !selectedTemplateId.startsWith("fallback:")) {
      criticalIssues.push("coach_template_theme_mismatch");
      criticalIssues.push("coach_provenance_inconsistent");
    }
    if (selectedTheme && selectedTheme !== "stable_continuation" && selectedOpportunityId === "supported_continuation") {
      warnings.push("supported_continuation_used_despite_specific_theme");
    }
    if (!["live_coach", "verified_coach_explanation", "verified_safe_fallback"].includes(coachSource)) {
      warnings.push("coach_source_unknown");
    }
    const runtimeSafeFallbackUsed = Boolean(
      input.runtimeSafeFallbackUsed ??
        coachDebug.verifiedFallbackUsed ??
        coachDebug.candidateCoachFallbackUsed ??
        coachQuality.usedFallback ??
        coachSource === "verified_safe_fallback",
    );
    const runtimeSafeFallbackReason = String(input.runtimeSafeFallbackReason ?? coachDebug.fallbackReason ?? coachQuality.fallbackReason ?? "").trim() || null;
    const qualityUsedFallback = Boolean(coachQuality.usedFallback);
    if (coachSource === "verified_safe_fallback" && !runtimeSafeFallbackUsed) criticalIssues.push("coach_provenance_inconsistent");
    if (runtimeSafeFallbackUsed && !qualityUsedFallback) criticalIssues.push("coach_provenance_inconsistent");
    if ((coachSource === "verified_safe_fallback" || runtimeSafeFallbackUsed || qualityUsedFallback) && !runtimeSafeFallbackReason) {
      criticalIssues.push("coach_provenance_inconsistent");
    }
  }
  const featurePipelineConnected = coachDebug.advancedFeaturePacketExists === true || Array.isArray(coachDebug.advancedFeatureClaimTypes);
  const planPipelineConnected = coachDebug.strategicPlanPacketExists === true || Array.isArray(coachDebug.recognizedPlanTypes);
  const opportunityPipelineConnected =
    coachDebug.selectedOpportunityId != null || coachDebug.opportunityCount != null || input.opportunityCount != null || verifiedFallbackUsed;
  const explanationPipelineConnected =
    coachDebug.selectedTemplateId != null ||
    coachDebug.mappingTemplateId != null ||
    Array.isArray(coachDebug.templateCandidatesTop5) ||
    verifiedFallbackUsed;
  if (instructionTargetUci && !featurePipelineConnected && !coachDebug.pipelineBypassReason) criticalIssues.push("feature_pipeline_not_connected");
  if (instructionTargetUci && !planPipelineConnected && !coachDebug.pipelineBypassReason) criticalIssues.push("plan_pipeline_not_connected");
  if (instructionTargetUci && !opportunityPipelineConnected && !coachDebug.pipelineBypassReason) criticalIssues.push("opportunity_pipeline_not_connected");
  if (instructionTargetUci && !explanationPipelineConnected && !coachDebug.pipelineBypassReason) criticalIssues.push("explanation_pipeline_not_connected");
  if (instructionTargetUci && visualRecipeMoveUci && visualRecipeMoveUci !== instructionTargetUci) criticalIssues.push("visual_recipe_target_mismatch");
  if (instructionTargetUci && revealTargetSource && revealTargetSource !== "instruction_target") criticalIssues.push("reveal_target_source_mismatch");
  if (input.coachFrameStale) criticalIssues.push("stale_coach_frame");
  if (input.visualFrameStale) criticalIssues.push("stale_visual_frame");
  if (input.revealTargetStale) criticalIssues.push("stale_reveal_target");
  if (input.overlayFrameLagDetected) criticalIssues.push("overlay_frame_lag_detected");
  if (input.trainingMode === "continuation" && input.trainerPhase === "ready_for_user" && input.isUserTurn && instructionTargetUci && continuationLinesPassedToBoard === 0) {
    criticalIssues.push("continuation_candidate_not_rendered");
    criticalIssues.push("continuation_user_turn_target_without_visual");
    criticalIssues.push("assisted_view_target_without_visual");
  }
  if (input.trainingMode === "continuation" && input.trainerPhase === "ready_for_user" && input.isUserTurn && input.continuationAnalysisStatus === "ready" && !instructionTargetUci) {
    if (continuationNullTargetStatusFrame) {
      warnings.push("continuation_ready_without_candidate_transitioning");
    } else {
      criticalIssues.push("continuation_analysis_ready_without_target");
      criticalIssues.push("continuation_user_turn_without_candidate");
    }
  }
  if (input.trainingMode === "continuation" && String(continuationRuntimeStatus) === "ready" && !instructionTargetUci) {
    criticalIssues.push("continuation_candidate_without_target");
  }
  if (instructionTargetUci && coachDebug.candidateCoachFallbackUsed && !coachDebug.coachVerifiedFactsUsed) criticalIssues.push("generic_fallback_without_verified_facts");
  if (instructionTargetUci && String(input.trainerView) === "assisted" && !visualMoveUci) criticalIssues.push("assisted_view_target_without_visual");
  if (instructionTargetUci && String(input.trainerView) === "assisted" && !visualMoveUci) criticalIssues.push("missing_visual_for_instruction_target");
  const currentUnverifiedClaims = Array.isArray(coachDebug.unverifiedClaims) ? coachDebug.unverifiedClaims.map(String) : [];
  if (instructionTargetUci && currentUnverifiedClaims.length) {
    criticalIssues.push("unsafe_template_rendered");
    for (const claim of currentUnverifiedClaims) {
      if (claim.includes("unverified_piece_claim")) criticalIssues.push("unverified_piece_claim");
      if (claim.includes("unverified_development_claim")) criticalIssues.push("unverified_development_claim");
      if (claim.includes("unverified_diagonal_claim")) criticalIssues.push("unverified_diagonal_claim");
      if (claim.includes("unverified_center_tension_claim")) criticalIssues.push("unverified_center_tension_claim");
      if (claim.includes("unverified_pressure_claim")) criticalIssues.push("unverified_pressure_claim");
      if (claim.includes("unverified_king_safety_claim")) criticalIssues.push("unverified_king_safety_claim");
      if (claim.includes("template_claim_not_supported_by_move_fact")) criticalIssues.push("template_claim_not_supported_by_move_fact");
      if (claim.includes("debug_copy_leaked_to_user")) criticalIssues.push("debug_copy_leaked_to_user");
      if (claim.includes("unsafe_unverified_coach_claim")) criticalIssues.push("unsafe_unverified_coach_claim");
    }
  }
  for (const record of lastCoachRecords) {
    const body = String(record?.body ?? "").toLowerCase();
    const targetPiece = String(record?.instructionTargetPieceType ?? "");
    if (/\bbishop\b/.test(body) && ["p", "n", "r", "k"].includes(targetPiece)) {
      criticalIssues.push("recent_unverified_piece_claim");
      criticalIssues.push("recent_coach_piece_mismatch");
    }
    if (/\bknight\b/.test(body) && targetPiece !== "n") {
      criticalIssues.push("recent_unverified_piece_claim");
      criticalIssues.push("recent_coach_piece_mismatch");
    }
    if (/\bactive diagonal\b/.test(body) && !["b", "q"].includes(targetPiece)) {
      criticalIssues.push("recent_unverified_piece_claim");
    }
    if (/\bdevelops?\b/.test(body) && record?.instructionTargetKind && record?.instructionTargetPieceType && !["n", "b", "r"].includes(targetPiece)) {
      criticalIssues.push("recent_unverified_piece_claim");
    }
    if (/\bcenter tension\b/.test(body) && !(record?.verifiedClaims ?? []).some((claim: string) => String(claim).includes("center"))) {
      criticalIssues.push("recent_unverified_piece_claim");
    }
    if (record?.coachMoveUci && record?.instructionTargetUci && record.coachMoveUci !== record.instructionTargetUci) criticalIssues.push("recent_template_target_mismatch");
    if (record?.visualMoveUci && record?.instructionTargetUci && record.visualMoveUci !== record.instructionTargetUci) criticalIssues.push("recent_template_target_mismatch");
    if (record?.revealTargetUci && record?.instructionTargetUci && record.revealTargetUci !== record.instructionTargetUci) criticalIssues.push("recent_template_target_mismatch");
  }
  const instructionalBodies = Array.isArray(input.lastCoachBodies) ? input.lastCoachBodies.map(String) : [];
  if (instructionalBodies.some((body) => /opponent is choosing a reply|line complete|terminal/i.test(body))) {
    warnings.push("coach_status_copy_in_instructional_history");
  }
  if (lastCoachRecords.length >= 5) {
    const patterns = new Map<string, number>();
    for (const record of lastCoachRecords) {
      const normalized = String(record?.normalizedBody ?? "").trim();
      if (!normalized) continue;
      patterns.set(normalized, (patterns.get(normalized) ?? 0) + 1);
    }
    if ([...patterns.values()].some((count) => count >= 3)) {
      const timelineLowQualityCount = coachTimeline.filter((entry: any) => Number(entry?.qualityScore ?? 0) > 0 && Number(entry?.qualityScore ?? 0) < 80).length;
      const timelineRepeatedGenericCount = coachTimeline.filter((entry: any) => Boolean(entry?.repeatedGeneric)).length;
      const targetAlignedNow = instructionTargetUci ? (coachQuality.targetAligned ?? (coachMoveUci === instructionTargetUci)) === true : true;
      const rawGenericFallbackVisible = /safety fallback|safety blocked|no move-specific coaching is available|safest improving move/i.test(`${String(visibleTitle ?? "")} ${String(visibleBody ?? "")}`.toLowerCase());
      if (
        timelineRepeatedGenericCount > 0 ||
        timelineLowQualityCount > 0 ||
        !targetAlignedNow ||
        rawGenericFallbackVisible ||
        coachFailureKind !== "none"
      ) {
        criticalIssues.push("recent_repeated_generic_coach_copy");
      } else {
        warnings.push("recent_repeated_generic_coach_copy_downgraded");
      }
    }
  }
  if (terminalRuntimeLike && continuationSurfaceMode === "opponent_replying") {
    criticalIssues.push("terminal_mode_downgraded_to_opponent_replying");
  }
  if ((presentationCoach.shouldRender || v28OwnerActive) && visibleCoachIntent === "silent" && !isAllowedNullTargetState(input)) {
    criticalIssues.push("visible_coach_with_silent_intent");
  }
  if (input.trainingMode === "continuation" && input.selectedCandidateUci && visibleTitle === "Position context" && !branchTransitionSurfaceRendered) criticalIssues.push("generic_context_rendered_with_candidate");
  if (input.trainingMode === "continuation" && input.selectedCandidateUci && presentationCoach.shouldRender && visibleCoachOwner !== "branch_transition_surface" && !coachDebug.selectedOpportunityId && !coachDebug.selectedTemplateId && !coachDebug.mappingTemplateId && !coachDebug.candidateCoachFallbackUsed) criticalIssues.push("visible_coach_missing_template_and_opportunity");
  if (input.staleSelectedCandidateDetected) criticalIssues.push("stale_selected_candidate");
  if (input.trainingMode === "continuation" && !input.userExplicitlyEnteredContinuation && !guidedCoveragePolicy.guidedCompleteAllowed && (input.moveHistory?.length ?? 0) < (guidedCoveragePolicy.minimumGuidedDepthPly ?? 8)) criticalIssues.push("premature_continuation_transition");
  const lineExhaustedOrNeedsContinuation =
    String(expectedMoveResolution.source ?? "") === "guided_branch_needs_continuation" ||
    /repertoire_line_exhausted_needs_continuation|line_exhausted|needs_continuation/i.test(String(expectedMoveResolution.reason ?? ""));
  const branchCompleteVisible = String(input.visibleTeachingSurface?.mode ?? "") === "branch_complete";
  const hasPendingOpponentReply = Boolean(input.pendingOpponentRequest);
  const unresolvedCompletionStuck =
    Boolean(input.bookComplete) &&
    !guidedCoveragePolicy.guidedCompleteAllowed &&
    !hasPendingOpponentReply &&
    !instructionTargetUci &&
    !branchCompleteVisible &&
    lineExhaustedOrNeedsContinuation;
  if (unresolvedCompletionStuck) criticalIssues.push("book_complete_without_policy");
  const continueFromHereButtonRendered = visibleButtons.includes("continue_from_here");
  const exhaustedWithoutBranchCompleteSurface =
    String(input.trainingMode) === "restricted" &&
    lineExhaustedEvidence &&
    !instructionTargetUci &&
    !continuationTerminalDetected &&
    !input.selectedCandidateUci &&
    !hasPendingOpponentReply &&
    !branchCompleteVisible &&
    !continueFromHereButtonRendered;
  if (exhaustedWithoutBranchCompleteSurface) {
    criticalIssues.push("exhausted_line_without_branch_complete_surface");
  }
  if (input.visualRecipe && input.visualReady === false && !presentation.visual?.shouldRender && input.visualRecipeOverlay?.adapterAllowed) criticalIssues.push("VisualRecipe exists but visual did not render while legacy ready was false");
  if (input.coachSurfacePolicyAffectsVisualLayer) criticalIssues.push("Coach surface policy affected visual layer");
  if (input.coachMemoryLegacyDetected && !input.memoryMigratedOrCleared) criticalIssues.push("legacy_memory_not_migrated");
  if (Array.isArray(input.runtimeCriticalIssues)) {
    for (const issue of input.runtimeCriticalIssues.map(String)) {
      if (issue === "continuation_ready_without_candidate" && continuationNullTargetStatusFrame) {
        warnings.push("continuation_ready_without_candidate_transitioning");
        continue;
      }
      criticalIssues.push(issue);
    }
  }
  if ((actualCoachCardTitle ?? null) !== (visibleTitle ?? null) || (actualCoachCardBody ?? null) !== (visibleBody ?? null)) {
    criticalIssues.push("coach_card_debug_parity_mismatch");
  }
  if (JSON.stringify(actualCoachCardButtons) !== JSON.stringify(visibleButtons.map(String))) {
    criticalIssues.push("action_debug_parity_mismatch");
  }
  const latestActionFrame = actionTimeline.length ? actionTimeline[actionTimeline.length - 1] : null;
  if (latestActionFrame && Array.isArray((latestActionFrame as any).renderedActionIds)) {
    const latestRendered = (latestActionFrame as any).renderedActionIds.map(String);
    if (JSON.stringify(latestRendered) !== JSON.stringify(actualCoachCardButtons)) {
      criticalIssues.push("action_debug_parity_mismatch");
    }
  }
  const debugVisualCount = len(input.visibleTeachingSurface?.visual?.lines);
  const actualVisualCount = len(input.boardLines);
  if (debugVisualCount !== actualVisualCount) {
    criticalIssues.push("visual_debug_parity_mismatch");
  }
  const plainLeakAtFrame = plainLeakTimeline.find((entry: any) => Boolean(entry?.preShowMoreLeak));
  if (plainLeakAtFrame) {
    criticalIssues.push("plain_pre_show_more_leak_at_frame");
    warnings.push(`plain_pre_show_more_leak_frame:${String((plainLeakAtFrame as any).frameId ?? "unknown")}`);
  }
  const v28VisibleEnabled = String(input.visibleSurfaceOwner ?? input.visibleTeachingSurface?.owner ?? "") === "v28_visible_surface";
  if (v28VisibleEnabled && isTeachingFrame(input) && actualCoachCardSource !== "surfaceCoachCardDecision") {
    criticalIssues.push("legacy_coach_visible_bypass");
  }
  if (v28VisibleEnabled && actualActionSource !== "visible_surface_v28") {
    criticalIssues.push("legacy_action_visible_bypass");
  }
  if (v28VisibleEnabled && actualVisualSource !== "visible_surface_v28") {
    criticalIssues.push("legacy_visual_visible_bypass");
  }
  if (v28VisibleEnabled && String(input.trainerPhase) === "branch_complete" && String(input.visibleTeachingSurface?.mode ?? "") !== "branch_complete") {
    criticalIssues.push("legacy_branch_complete_visible_bypass");
  }
  if (String(input.trainerView) === "assisted" && renderedActionIds.includes("reveal_target")) {
    criticalIssues.push("assisted_reveal_action_rendered");
  }
  if (v28VisibleEnabled && renderedActionIds.some((id) => !surfaceActionIds.includes(id))) {
    criticalIssues.push("surface_action_missing_for_rendered_button");
  }
  if (v28VisibleEnabled && renderedVisualPrimitiveCount > 0 && surfaceVisualPrimitiveCount === 0) {
    criticalIssues.push("rendered_visual_missing_surface_source");
  }
  if (v28VisibleEnabled && isTeachingFrame(input) && String(input.coachDecision?.debug?.coachCopySource ?? "") === "orchestrate_teaching") {
    criticalIssues.push("legacy_orchestrate_teaching_visible_bypass");
  }
  if (visualFailureKind !== "none" && visualFailureKind !== "not_applicable") warnings.push(`visualFailureKind:${visualFailureKind}`);
  if (coachFailureKind !== "none") warnings.push(`coachFailureKind:${coachFailureKind}`);
  if (input.memoryMigratedOrCleared) warnings.push("memory_migrated_or_cleared");
  // v2.7.39.1: only warn about missing deep pipelines on actual teaching frames that have (or expect) an instruction target.
  // Suppress on terminal, opponent-reply, no-target, and non-teaching frames (per Coach Perfection Gate).
  // 2.7.39.4: Suppress legacy not_exposed when Brain active (debug behind Brain)
  const brainActive = !!input.brainAnalysis;
  if (!brainActive && isTeachingFrame(input) && !coachDebug.advancedFeatureClaimTypes && !instructionTargetUci) warnings.push("feature_pipeline_not_exposed");
  if (!brainActive && isTeachingFrame(input) && !coachDebug.recognizedPlanTypes && !instructionTargetUci) warnings.push("plan_pipeline_not_exposed");
  if (coachDebug.candidateCoachFallbackUsed) warnings.push("candidate_fallback_used");
  // v2.7.39.4 start: Prefer Brain data for debug packets when present (debug behind Brain migration)
  if (input.brainAnalysis) {
    const b = input.brainAnalysis;
    if (b.features) (coachDebug as any).brainFeatures = b.features;
    if (b.plans) (coachDebug as any).brainPlans = b.plans;
    if (b.opportunities) (coachDebug as any).brainOpportunities = b.opportunities;
  }
  const uniqueCriticalIssues = Array.from(new Set(criticalIssues));
  const uniqueWarnings = Array.from(new Set(warnings));
  const runtimeSafeFallbackUsed = Boolean(
    input.runtimeSafeFallbackUsed ??
      coachDebug.verifiedFallbackUsed ??
      coachDebug.candidateCoachFallbackUsed ??
      coachQuality.usedFallback ??
      coachSource === "verified_safe_fallback",
  );
  const runtimeSafeFallbackReason = String(input.runtimeSafeFallbackReason ?? coachDebug.fallbackReason ?? coachQuality.fallbackReason ?? "").trim() || null;
  const provenanceIssues: string[] = [];
  if (selectedTheme && selectedOpportunityId && selectedTheme !== selectedOpportunityId) provenanceIssues.push("theme_opportunity_mismatch");
  if (selectedTheme && selectedTemplateId && !selectedTemplateId.includes(selectedTheme) && !selectedTemplateId.startsWith("fallback:")) provenanceIssues.push("template_theme_mismatch");
  if (instructionTargetUci && selectedOpportunityScore == null) provenanceIssues.push("score_missing");
  if (coachSource === "verified_safe_fallback" && !runtimeSafeFallbackUsed) provenanceIssues.push("fallback_source_flag_mismatch");
  if (runtimeSafeFallbackUsed && !coachQuality.usedFallback) provenanceIssues.push("fallback_flag_quality_mismatch");
  if ((coachSource === "verified_safe_fallback" || runtimeSafeFallbackUsed || coachQuality.usedFallback) && !runtimeSafeFallbackReason) provenanceIssues.push("fallback_reason_missing");
  const instructionalTimelineEntries = coachTimeline.filter((entry: any) => entry?.entryKind === "instructional");
  const instructionalScores = instructionalTimelineEntries
    .map((entry: any) => Number(entry?.qualityScore))
    .filter((score) => Number.isFinite(score));
  const averageInstructionalQualityScore = instructionalScores.length
    ? Number((instructionalScores.reduce((sum, score) => sum + score, 0) / instructionalScores.length).toFixed(1))
    : null;
  // v2.7.39.1 Coach Perfection Gate: split fallback counts for clarity (instructional vs opponent status vs terminal)
  const fallbackEntries = coachTimeline.filter((entry: any) => Boolean(entry?.runtimeSafeFallbackUsed));
  const instructionalFallbackCount = fallbackEntries.filter((e: any) => e?.trainerPhase === "ready_for_user" || e?.entryKind === "instructional").length;
  const terminalFallbackCount = fallbackEntries.filter((e: any) => String(e?.trainerPhase || "").includes("terminal")).length;
  const opponentStatusFallbackCount = fallbackEntries.length - instructionalFallbackCount - terminalFallbackCount;

  const coachTimelineSummary = {
    totalFrames: coachTimeline.length,
    instructionalFrames: instructionalTimelineEntries.length,
    fallbackCount: fallbackEntries.length,
    instructionalFallbackCount,
    opponentStatusFallbackCount: Math.max(0, opponentStatusFallbackCount),
    terminalFallbackCount,
    lowQualityCount: coachTimeline.filter((entry: any) => Number(entry?.qualityScore ?? 0) > 0 && Number(entry?.qualityScore ?? 0) < 80).length,
    debugLeakCount: coachTimeline.filter((entry: any) => Boolean(entry?.containsDebugLeak)).length,
    repeatedGenericCount: coachTimeline.filter((entry: any) => Boolean(entry?.repeatedGeneric)).length,
    pieceMismatchCount: coachTimeline.filter((entry: any) => entry?.pieceAligned === false).length,
    targetMismatchCount: coachTimeline.filter((entry: any) => entry?.targetAligned === false).length,
    averageInstructionalQualityScore,
    uniqueThemes: Array.from(new Set(coachTimeline.map((entry: any) => String(entry?.selectedTheme ?? "").trim()).filter(Boolean))),
  };

  const snapshot: TrainerDebugSnapshot = {
    generatedAt: Date.now(),
    build: {
      version: "v2.7.40-debug-agent6",
      environment: (process.env.NODE_ENV as any) ?? "development",
      debugEnabled: Boolean(input.debugEnabled),
    },
    frame: {
      trainerFrameId: input.trainerFrameId,
      currentPly: input.moveHistory?.length ?? 0,
      currentMoveIndex: input.historyIndex,
      trainerPhase: input.trainerPhase,
      trainerView: input.trainerView,
      trainingMode: input.trainingMode,
      isUserTurn: input.isUserTurn,
      answerShown: input.showAnswer,
      hintShown: input.coachHintRequestCount > 0,
      coachHidden: input.coachHiddenForFrame,
      coachInteraction: input.coachInteraction,
      expectedMoveSan: input.expectedMoveSan ?? null,
      expectedMoveUci: input.expectedMoveUci ?? null,
      instructionTargetKind: input.instructionTargetKind ?? null,
      instructionTargetUci,
      instructionTargetFrom: input.instructionTargetFrom ?? (instructionTargetUci ? String(instructionTargetUci).slice(0, 2) : null),
      instructionTargetTo: input.instructionTargetTo ?? (instructionTargetUci ? String(instructionTargetUci).slice(2, 4) : null),
      instructionTargetPieceType,
      // v2.7.39.1 Target Locking (Coach Perfection Gate) — stable key used to lock official instructional target
      instructionFrameKey: input.instructionFrameKey ?? computeInstructionFrameKey({
        fen: input.fen,
        trainingMode: input.trainingMode,
        isUserTurn: !!input.isUserTurn,
        trainerPhase: input.trainerPhase,
        source: input.instructionTargetKind || (input.trainingMode === "continuation" ? "continuation_candidate" : "guided"),
      }),
      // v2.7.39.2+ Brain facade (debug exposure only at this phase per roadmap)
      brainAnalysis: input.debugEnabled ? analyzeBlundrPosition({
        fen: input.fen,
        currentInstructionFrame: null, // snapshot context - full frame not always available
        frameKey: input.instructionFrameKey,
        trainingMode: input.trainingMode,
        isUserTurn: !!input.isUserTurn,
        debugEnabled: true,
      } as any) : null,
      expectedMoveSource: expectedMoveResolution.source ?? null,
      expectedMoveCoverageTier: expectedMoveResolution.coverageTier ?? null,
      expectedMoveResolutionReason: expectedMoveResolution.reason ?? null,
      expectedMoveLineCursor: expectedMoveResolution.lineCursor ?? null,
      expectedMoveLineLength: expectedMoveResolution.lineLength ?? null,
      expectedMoveCandidateCount: len(expectedMoveResolution.candidateMoves),
      expectedMoveShouldTransitionToContinuation: Boolean(expectedMoveResolution.shouldTransitionToContinuation),
      exactFenNodeFound: Boolean(expectedMoveResolution.debug?.exactFenNodeFound),
      transpositionNodeFound: Boolean(expectedMoveResolution.debug?.transpositionNodeFound),
      openingFamilyPlanFallbackUsed: Boolean(expectedMoveResolution.debug?.openingFamilyPlanFallbackUsed),
      legacyRecoverableCandidateUsed: Boolean(expectedMoveResolution.debug?.legacyRecoverableCandidateUsed),
      resolverCriticalIssue: expectedMoveResolution.source === "none" ? expectedMoveResolution.reason ?? "unresolved" : null,
      guidedCoverageState: guidedCoveragePolicy.guidedCoverageState ?? null,
      guidedCoverageReason: guidedCoveragePolicy.guidedCoverageReason ?? null,
      minimumGuidedDepthPly: guidedCoveragePolicy.minimumGuidedDepthPly ?? null,
      hardGuidedDepthPly: guidedCoveragePolicy.hardGuidedDepthPly ?? null,
      branchFrequency: guidedCoveragePolicy.branchFrequency ?? null,
      cumulativeBranchCoverage: guidedCoveragePolicy.cumulativeBranchCoverage ?? null,
      branchComplexity: guidedCoveragePolicy.branchComplexity ?? null,
      explicitCuratedTerminalNode: guidedCoveragePolicy.explicitCuratedTerminalNode ?? null,
      guidedCompleteAllowed: guidedCoveragePolicy.guidedCompleteAllowed ?? null,
      guidedCompleteBlockedReason: guidedCoveragePolicy.guidedCompleteBlockedReason ?? null,
      bookCompleteAllowed: guidedCoveragePolicy.bookCompleteAllowed ?? null,
      bookCompleteBlockedReason: guidedCoveragePolicy.bookCompleteBlockedReason ?? null,
      lastUserMoveSan: input.lastUserMoveSan ?? null,
      lastUserMoveUci: input.lastUserMoveUci ?? null,
      lastOpponentMoveSan: input.lastOpponentMoveSan ?? null,
      lastOpponentMoveUci: input.lastOpponentMoveUci ?? null,
      pendingOpponentRequest: input.pendingOpponentRequest ?? null,
      currentSelectedCandidateUci: input.currentSelectedCandidateUci ?? null,
      previousSelectedCandidateUci: input.previousSelectedCandidateUci ?? null,
      staleSelectedCandidateDetected: Boolean(input.staleSelectedCandidateDetected),
      staleSelectedCandidateCleared: Boolean(input.staleSelectedCandidateCleared),
      autoContinuationReason: input.autoContinuationReason ?? null,
      userExplicitlyEnteredContinuation: Boolean(input.userExplicitlyEnteredContinuation),
      prematureContinuationBlocked: Boolean(input.prematureContinuationBlocked),
      transitionToContinuationAllowed: Boolean(input.transitionToContinuationAllowed),
      transitionToContinuationReason: input.transitionToContinuationReason ?? null,
      branchTransitionSurfaceRendered,
      branchTransitionPayloadValid,
      continueFromHereButtonRendered: visibleButtons.includes("continue_from_here"),
      trainAgainButtonRendered: visibleButtons.includes("restart_line"),
      branchTransitionReason: input.branchTransitionReason ?? null,
      continueFromHereAvailable: Boolean(input.continueFromHereAvailable),
      continueFromHereClicked: Boolean(input.continueFromHereClicked),
      selectedLineId: input.selectedLineId ?? null,
      selectedOpeningId: input.selectedOpeningId ?? null,
      selectedConceptId: input.selectedConceptId ?? input.visualRecipe?.conceptId ?? null,
      activeLineName: input.activeLineName ?? null,
    },
    board: {
      boardFenRaw: input.fen,
      boardFen4,
      overlayFenRaw: input.overlayFen ?? null,
      overlayFen4,
      recipeFenRaw: input.visualRecipe?.fen ?? null,
      recipeFen4,
      fenMatches: {
        boardVsOverlay: boardFen4 === overlayFen4,
        boardVsRecipe: !recipeFen4 ? false : boardFen4 === recipeFen4,
        overlayVsRecipe: !recipeFen4 ? false : overlayFen4 === recipeFen4,
      },
      sideToMove: input.sideToMove ?? null,
      legalMoveCount: input.legalMoveCount ?? null,
      expectedMoveLegal: input.expectedMoveLegal ?? null,
      expectedMoveResolvedFromSan: input.expectedMoveResolvedFromSan ?? null,
      expectedMoveResolvedFromUci: input.expectedMoveResolvedFromUci ?? null,
      sanUciResolutionStatus: input.sanUciResolutionStatus ?? (instructionTargetUci ? "resolved_via_instruction_target" : "not_exposed_from_module"),
      sanUciResolutionReason: input.sanUciResolutionReason ?? (instructionTargetUci ? "instruction_target_authoritative" : "not_exposed_from_module"),
    },
    visual: {
      shouldRenderVisualRecipeLayer: presentation.visual?.shouldRender ?? false,
      shouldRenderLegacyVisualLines: presentation.visual?.source === "legacy_fallback",
      visualLayerSource: presentation.visual?.source ?? "none",
      visualLayerBlockedReason: presentation.visual?.blockedReason ?? null,
      visualRecipeExists: Boolean(input.visualRecipe),
      visualRecipeId: input.visualRecipe?.visualRecipeId ?? null,
      visualRecipeMode: input.visualRecipe?.mode ?? null,
      visualRecipeConceptId: input.visualRecipe?.conceptId ?? null,
      visualRecipePrimitiveCount: input.visualRecipePrimitiveIds?.length ?? 0,
      visualRecipePrimitiveIds: input.visualRecipePrimitiveIds ?? [],
      visualRecipeBeatIds: input.visualRecipe?.beats?.map((beat: any) => beat.id) ?? [],
      visualRecipePersistPrimitiveIds: input.visualRecipe?.endState?.persistPrimitives ?? [],
      playbackKey: input.playbackKey ?? null,
      playbackReady: input.playbackReady ?? false,
      playbackPhase: input.visualRecipePlayback?.animationState ?? null,
      playbackLineCount: len(input.visualRecipePlayback?.lines),
      playbackSquareStyleCount: len(input.visualRecipePlayback?.squares),
      activeLineCountPassedToBoard: len(input.boardLines),
      squareStyleCountPassedToBoard: len(input.squareStyles),
      overlayFrameId: input.overlayFrameId,
      overlayFrameMatchesTrainerFrame: input.overlayFrameId != null && input.trainerFrameId != null ? String(input.overlayFrameId) === String(input.trainerFrameId) : input.visualRecipeOverlay?.recipeFrameMatchesBoard ?? false,
      overlayFenMatchesBoard: input.visualRecipeOverlay?.recipeFenMatchesBoard ?? false,
      adapterAllowed: input.visualRecipeOverlay?.adapterAllowed ?? false,
      adapterSuppressedReason: input.visualRecipeOverlay?.adapterSuppressedReason ?? null,
      endStatePrimitiveIds: input.visualRecipe?.endState?.persistPrimitives ?? [],
      endStateLineCount: input.visualRecipeEndStateLineCount ?? null,
      visualReadyLegacyValue: input.visualReady,
      visualModelOutputExists: Boolean(input.visualModelOutput),
      visualRecipeIndependentFromLegacyReady: Boolean(input.visualRecipe),
      coachSurfacePolicyAffectsVisualLayer: Boolean(input.coachSurfacePolicyAffectsVisualLayer),
      visualFailureKind,
      visualTargetMatchesInstructionTarget: instructionTargetUci ? visualMoveUci === instructionTargetUci : "unknown",
      actualVisualSource,
      renderedVisualPrimitiveCount,
      surfaceVisualPrimitiveCount,
    },
    continuation: {
      isContinuationMode: input.trainingMode === "continuation",
      continuationCandidateExists: Boolean(input.selectedCandidateUci),
      selectedCandidateSan: input.selectedCandidateSan ?? null,
      selectedCandidateUci: input.selectedCandidateUci ?? null,
      selectedCandidateSource: input.continuationSelectedCandidateSource ?? input.selectedCandidateSource ?? null,
      selectedCandidateSafetySource: input.selectedCandidateSafetySource ?? null,
      visualMoveUci,
      currentSelectedCandidateUci: input.currentSelectedCandidateUci ?? null,
      exactMoveAllowed: Boolean(input.coachDecision?.exactMoveAllowed),
      enginePreviewExists: Boolean(input.enginePreview),
      enginePreviewBestMove: input.enginePreview?.pvs?.[0]?.uci ?? null,
      enginePreviewSafeMoves: coachDebug.coachEngineSafeMoves ?? [],
      candidateLineCount: len(input.continuationCandidateLines),
      candidateLineUci: input.selectedCandidateUci ?? null,
      candidateLineSan: input.selectedCandidateSan ?? null,
      shouldRenderContinuationLines: input.shouldRenderContinuationLines ?? false,
      continuationLinesPassedToBoard,
      continuationVisualBlockedReason: input.continuationVisualBlockedReason ?? null,
      continuationAnalysisStatus: input.continuationAnalysisStatusLabel ?? input.continuationAnalysisStatus ?? (input.enginePreview ? "ready" : "idle"),
      continuationRuntimeStatus: input.continuationRuntimeStatus ?? null,
      continuationTerminalReason: input.continuationTerminalReason ?? null,
      continuationPauseRequired: input.continuationPauseRequired ?? false,
      continuationPauseReason: input.continuationPauseReason ?? "none",
      continuationPauseAlreadyConsumed: input.continuationPauseAlreadyConsumed ?? false,
      hardStopBackupEligible: input.hardStopBackupEligible ?? false,
      hardStopBackupBlockedReason: input.hardStopBackupBlockedReason ?? null,
      hardStopPlyLimit: input.hardStopPlyLimit ?? null,
      engineFallbackUsed: input.continuationEngineFallbackUsed ?? false,
      engineFallbackReason: input.continuationEngineFallbackReason ?? null,
      databaseCandidatesRejected: input.continuationDatabaseCandidatesRejected ?? false,
      rejectionReasons: input.continuationRejectionReasons ?? [],
      continuationAnalysisRequestId: input.continuationAnalysisRequestId ?? null,
      continuationAnalysisFen4: input.continuationAnalysisFen4 ?? null,
      continuationAnalysisFenMatchesBoard: input.continuationAnalysisFen4 ? input.continuationAnalysisFen4 === boardFen4 : "unknown",
      continuationPolicySource: input.opponentVariationDebug?.opponentVariationReason ?? null,
      continuationPolicyReason: input.opponentVariationDebug?.opponentVariationReason ?? null,
      selectedMoveInCandidateList: input.opponentVariationDebug?.continuedPlaySelectedMoveInCandidateList ?? null,
      candidateDebugList: input.opponentVariationDebug?.candidateOpponentBranches ?? [],
    },
    coach: {
      visibleTitle,
      visibleBody,
      visibleButtons,
      visibleCoachOwner,
      coachDecisionSource: coachSource,
      coachIntent: visibleCoachIntent,
      givesAnswer: input.coachDecision?.givesAnswer ?? false,
      revealRisk: input.coachDecision?.revealRisk ?? null,
      selectedTemplateId,
      coachMoveUci,
      coachPieceType,
      selectedOpportunityId,
      selectedOpportunityLayer,
      selectedOpportunityScore,
      selectedPlanId: coachDebug.mappingPlanIds?.[0] ?? null,
      selectedPlanType: coachDebug.recognizedPlanTypes?.[0] ?? null,
      utteranceFamily: input.coachDecision?.utteranceFamily ?? null,
      genericFallbackUsed: coachDebug.selectedOpportunityLayer === "fallback",
      genericFallbackReason: coachDebug.selectedOpportunityLayer === "fallback" ? "fallback_opportunity_selected" : null,
      runtimeSafeFallbackUsed,
      runtimeSafeFallbackReason,
      coachQuality,
      containsDebugLeak,
      expectedMoveAlignment: expectedMoveAlignment(input),
      coachMismatchReason: coachFailureKind === "none" ? null : coachFailureKind,
      blockedBetterCoachReasons: coachDebug.mappingBlockedReasons ?? [],
      lastCoachBodies: input.lastCoachBodies ?? [],
      repetitionGuardApplied: Boolean(coachDebug.repetitionGuardApplied),
      repetitionGuardReason: coachDebug.repetitionGuardReason ?? null,
      coachFailureKind,
    },
    actions: {
      ...(input.lastActionDebug ?? {
        lastButtonRendered: null,
        renderedButtonActions: visibleButtons,
        lastClickedAction: null,
        actionHandlerEntered: false,
        actionResult: "no_op",
        stateChanged: false,
      }),
      revealTargetUci,
      revealTargetSource,
      revealTargetMatchesInstructionTarget: instructionTargetUci ? revealTargetUci === instructionTargetUci : "unknown",
      actualActionSource,
      renderedActionIds,
      surfaceActionIds,
    },
    features: {
      // 2.7.39.4: Brain primary when available (debug behind Brain)
      advancedFeaturePacketExists: !!input.brainAnalysis?.features || coachDebug.advancedFeaturePacketExists || Array.isArray(coachDebug.advancedFeatureClaimTypes),
      featureFen4: boardFen4,
      featureFenMatchesBoard: true,
      featureClaimCount: input.brainAnalysis?.features ? Object.keys(input.brainAnalysis.features).length : len(coachDebug.advancedFeatureClaimTypes),
      userFacingFeatureClaimCount: input.brainAnalysis?.features ? Object.keys(input.brainAnalysis.features).length : len(coachDebug.advancedFeatureClaimTypes),
      blockedFeatureClaimCount: len(coachDebug.coachBlockedClaims),
      topFeatureClaims: input.brainAnalysis?.features ? Object.keys(input.brainAnalysis.features).filter(k => input.brainAnalysis.features[k]) : (coachDebug.advancedFeatureClaimTypes ?? []),
      blockedFeatureClaims: coachDebug.coachBlockedClaims ?? [],
      pawnStructureSummary: input.brainAnalysis?.features?.pawnStructure ? [input.brainAnalysis.features.pawnStructure] : (coachDebug.coachBoardFactsSummary?.plausiblePawnBreaks ?? []),
      kingSafetySummary: input.brainAnalysis?.features?.kingSafety ? [input.brainAnalysis.features.kingSafety] : (coachDebug.coachBoardFactsSummary?.kingSafetyFacts ?? []),
      pieceQualitySummary: input.brainAnalysis?.features?.pieceQuality ? [input.brainAnalysis.features.pieceQuality] : (coachDebug.advancedFeatureClaimTypes?.filter((type: string) => type.includes("piece") || type.includes("bishop") || type.includes("rook")) ?? []),
      imbalanceSummary: coachDebug.advancedFeatureClaimTypes?.filter((type: string) => type.includes("lead") || type.includes("imbalance")) ?? [],
      tacticalMotifSummary: input.brainAnalysis?.features?.tacticalMotifs ? JSON.stringify(input.brainAnalysis.features.tacticalMotifs).slice(0,100) : "blocked_debug_only",
      featureExtractionMs: coachDebug.featureExtractionMs ?? null,
      featureCacheHit: input.brainAnalysis ? "brain_hit" : (coachDebug.featureCacheHit ?? (instructionTargetUci ? "unknown" : "not_exposed_from_module")),
    },
    plans: {
      // 2.7.39.4: Brain primary
      strategicPlanPacketExists: !!input.brainAnalysis?.plans || coachDebug.strategicPlanPacketExists || Array.isArray(coachDebug.recognizedPlanTypes),
      planFen4: boardFen4,
      planFenMatchesBoard: true,
      recognizedPlanCount: input.brainAnalysis?.plans?.recognized?.length || len(coachDebug.recognizedPlanTypes),
      topPlans: input.brainAnalysis?.plans?.recognized ?? (coachDebug.recognizedPlanTypes ?? []),
      blockedPlans: input.brainAnalysis?.plans?.blocked ?? (coachDebug.blockedPlans ?? []),
      selectedPlanId: input.brainAnalysis?.plans?.primary?.id ?? (coachDebug.mappingPlanIds?.[0] ?? null),
      selectedPlanType: input.brainAnalysis?.plans?.primary?.type ?? (coachDebug.recognizedPlanTypes?.[0] ?? null),
      planRecognitionMs: coachDebug.planRecognitionMs ?? null,
      planCacheHit: input.brainAnalysis ? "brain_hit" : (coachDebug.planCacheHit ?? (instructionTargetUci ? "unknown" : "not_exposed_from_module")),
      openingRegistryHit: input.brainAnalysis?.plans?.recognized?.length > 0 || len(coachDebug.recognizedPlanTypes) > 0,
      openingRegistryEntryId: input.brainAnalysis?.plans?.primary?.id ?? (coachDebug.mappingPlanIds?.[0] ?? null),
      planMatchFailures: coachDebug.mappingBlockedReasons ?? [],
    },
    opportunities: {
      // 2.7.39.4: Brain primary
      opportunityCount: input.brainAnalysis?.opportunities?.ranked?.length ?? (input.opportunityCount ?? coachDebug.opportunityCount ?? (instructionTargetUci ? 0 : "not_exposed_from_module")),
      renderableOpportunityCount: input.brainAnalysis?.opportunities?.ranked?.length ?? (input.renderableOpportunityCount ?? coachDebug.renderableOpportunityCount ?? (instructionTargetUci ? 0 : "not_exposed_from_module")),
      selectedOpportunityId: input.brainAnalysis?.opportunities?.selectedId ?? selectedOpportunityId,
      selectedOpportunityLayer: input.brainAnalysis?.opportunities?.selected ? "brain" : selectedOpportunityLayer,
      selectedOpportunityIntent: coachDebug.selectedIntent ?? null,
      selectedOpportunityScore,
      selectedOpportunityMoveSan: input.coachDecision?.debug?.coachSelectedCandidateMove ?? null,
      selectedOpportunityMoveUci: coachDebug.selectedOpportunityMoveUci ?? input.selectedCandidateUci ?? null,
      selectedOpportunityPlanId: coachDebug.mappingPlanIds?.[0] ?? null,
      opportunitiesTop5: coachDebug.opportunitiesTop5 ?? [],
      blockedOpportunitiesTop10: coachDebug.blockedOpportunitiesTop10 ?? [],
      genericFallbackOpportunityExists: coachDebug.selectedOpportunityLayer === "fallback",
      genericFallbackOpportunityScore: coachDebug.selectedOpportunityLayer === "fallback" ? coachDebug.selectedOpportunityScore : null,
      whySelectedOpportunityWon: coachDebug.whySelectedOpportunityWon ?? (instructionTargetUci ? "missing_exposure" : "not_exposed_from_module"),
      whyExpectedMoveOpportunityLost: coachDebug.whyExpectedMoveOpportunityLost ?? (instructionTargetUci ? "missing_exposure" : "not_exposed_from_module"),
      whyVisualRecipeOpportunityLost: coachDebug.whyVisualRecipeOpportunityLost ?? "not_exposed_from_module",
      whyContinuationCandidateOpportunityLost: coachDebug.whyContinuationCandidateOpportunityLost ?? "not_exposed_from_module",
    },
    explanation: {
      selectedTemplateId,
      selectedTemplateCategory: input.coachDecision?.utteranceFamily ?? null,
      selectedTemplateIntent: coachDebug.coachIntent ?? coachDebug.selectedIntent ?? null,
      selectedTemplateRequiredVariables: coachDebug.selectedTemplateRequiredVariables ?? [],
      resolvedVariables: coachDebug.resolvedVariables ?? {},
      missingVariables: coachDebug.missingVariables ?? [],
      templateCandidatesTop5: coachDebug.templateCandidatesTop5 ?? [],
      blockedTemplatesTop10: (coachDebug.mappingBlockedReasons ?? []).slice(0, 10).map((reason: string) => ({ id: reason.split(":")[0], category: "unknown", blockedReason: reason })),
      safetyLinterStatus: coachDebug.coachSafetyWarnings?.length ? "blocked_or_warned" : "passed",
      safetyLinterBlockedTerms: coachDebug.coachSafetyWarnings ?? [],
      plainLeakDetected: Boolean(
        input.plainLeakDetected ||
        input.visibleTeachingSurface?.safety?.plainLeakDetected ||
        (input.trainerView === "plain" && input.expectedMoveSan ? String(input.coachDecision?.body ?? "").includes(input.expectedMoveSan) : false)
      ),
      renderedTitle: visibleTitle,
      renderedBody: visibleBody,
      explanationCacheHit: coachDebug.explanationCacheHit ?? (instructionTargetUci ? "unknown" : "not_exposed_from_module"),
      explanationRenderMs: coachDebug.explanationRenderMs ?? null,
    },
    presentation: {
      presentationFrameId: presentation.frameId ?? input.trainerFrameId,
      presentationVisualShouldRender: presentation.visual?.shouldRender ?? false,
      presentationVisualSource: presentation.visual?.source ?? "none",
      presentationVisualBlockedReason: presentation.visual?.blockedReason ?? null,
      presentationVisualPrimitiveIds: presentation.visual?.primitiveIds ?? [],
      presentationCoachShouldRender: presentation.coach?.shouldRender ?? false,
      presentationCoachOwner: presentation.coach?.owner ?? "none",
      presentationCoachIntent: presentation.coach?.intent ?? null,
      presentationCoachSuppressedReason: presentation.coach?.suppressedReason ?? null,
      presentationLegacyTrainingAllowed: presentation.legacy?.allowTrainingCard ?? false,
      presentationLegacyAnswerAllowed: presentation.legacy?.allowAnswerCard ?? false,
      presentationMoveImpactAllowed: presentation.legacy?.allowMoveImpact ?? false,
      presentationNextMoveAllowed: presentation.legacy?.allowNextMoveText ?? false,
      presentationLegacySuppressedReason: presentation.legacy?.legacySuppressedReason ?? null,
      visualLayerIndependentFromCoachSurface: true,
      visualLayerIndependentFromLegacyVisualReady: true,
      coachSurfacePolicyAffectsVisualLayer: Boolean(input.coachSurfacePolicyAffectsVisualLayer),
      visualRecipeMoveUci,
      visualRecipeTargetMatchesInstructionTarget,
      visualMoveUci,
      visualTargetMatchesInstructionTarget: input.visualTargetMatchesInstructionTarget ?? (instructionTargetUci ? visualMoveUci === instructionTargetUci : "unknown"),
      frameKey: input.frameKey ?? null,
      coachFrameStale: Boolean(input.coachFrameStale),
      visualFrameStale: Boolean(input.visualFrameStale),
      revealTargetStale: Boolean(input.revealTargetStale),
      overlayFrameLagDetected: Boolean(input.overlayFrameLagDetected),
      // Agent 6: surface owner + 4-target/2-piece + leak/bypass from VisibleTeachingSurface guard
      visibleSurfaceOwner: input.visibleSurfaceOwner ?? input.visibleTeachingSurface?.owner ?? null,
      visibleCoachOwner: input.visibleCoachOwner ?? input.visibleTeachingSurface?.debug?.visibleCoachOwner ?? (presentation?.coach?.owner ?? "none"),
      visibleVisualOwner: input.visibleVisualOwner ?? input.visibleTeachingSurface?.debug?.visibleVisualOwner ?? "none",
      visibleActionOwner: input.visibleActionOwner ?? input.visibleTeachingSurface?.debug?.visibleActionOwner ?? "visibleActionPolicy",
      showMoreTargetUci: input.showMoreTargetUci ?? input.visibleTeachingSurface?.targetUci ?? null,
      surfaceSafety: input.surfaceSafety ?? input.visibleTeachingSurface?.safety ?? null,
      fourTargetMismatchFromSurface: input.surfaceFourTargetMismatch ?? input.visibleTeachingSurface?.debug?.fourTargetMismatch ?? false,
      twoPieceMismatchFromSurface: input.surfaceTwoPieceMismatch ?? input.visibleTeachingSurface?.debug?.twoPieceTypeMismatch ?? false,
    },
    legacy: {
      legacyTrainingCardWouldRender: input.legacyTrainingCardWouldRender ?? false,
      legacyTrainingCardActuallyRendered: input.legacyTrainingCardActuallyRendered ?? false,
      legacyAnswerCardWouldRender: input.legacyAnswerCardWouldRender ?? false,
      legacyAnswerCardActuallyRendered: input.legacyAnswerCardActuallyRendered ?? false,
      legacyMoveImpactWouldRender: input.legacyMoveImpactWouldRender ?? false,
      legacyMoveImpactActuallyRendered: input.legacyMoveImpactActuallyRendered ?? false,
      legacyNextTextWouldRender: input.legacyNextTextWouldRender ?? false,
      legacyNextTextActuallyRendered: input.legacyNextTextActuallyRendered ?? false,
      liveCoachStateExists: Boolean(input.liveCoachState),
      liveCoachWouldRender: Boolean(input.liveCoachState && !input.liveCoachState.silent),
      // v2.7.40 P0 Fix 2: when VisibleTeachingSurface owns the coach render on teaching, live coach path is not "actually rendered" visibly (internal evidence only).
      liveCoachActuallyRendered: input.visibleTeachingSurface?.coach?.shouldRender ? false : (input.coachDecision?.debug?.coachCopySource === "live_coach"),
      legacySuppressionReasons: [input.coachSurfacePolicy?.reason, presentation.legacy?.legacySuppressedReason].filter(Boolean),
      legacyBypassDetected: Boolean(input.legacyBypassDetected || input.legacyBypassDetectedFromSurface || input.visibleTeachingSurface?.safety?.legacyBypassDetected),
      memoryMigratedOrCleared: Boolean(input.memoryMigratedOrCleared),
      coachMemoryLegacyDetected: Boolean(input.coachMemoryLegacyDetected),
      coachMemoryClearedLegacyCount: Number(input.coachMemoryClearedLegacyCount ?? 0) || 0,
    },
    cache: {
      ...buildCoachCacheDebug(),
      featureCacheKey: coachDebug.featureCacheKey ?? null,
      featureCacheHit: coachDebug.featureCacheHit ?? (instructionTargetUci ? "unknown" : "not_exposed_from_module"),
      planCacheKey: coachDebug.planCacheKey ?? null,
      planCacheHit: coachDebug.planCacheHit ?? (instructionTargetUci ? "unknown" : "not_exposed_from_module"),
      opportunityCacheKey: coachDebug.opportunityCacheKey ?? null,
      opportunityCacheHit: coachDebug.opportunityCacheHit ?? (instructionTargetUci ? "unknown" : "not_exposed_from_module"),
      explanationCacheKey: coachDebug.explanationCacheKey ?? null,
      explanationCacheHit: coachDebug.explanationCacheHit ?? (instructionTargetUci ? "unknown" : "not_exposed_from_module"),
      presentationCacheKey: input.presentationCacheKey ?? null,
      presentationCacheHit: "not_exposed_from_module",
      cacheInvalidationReasons: [],
    },
    performance: {
      geometryMs: coachDebug.geometryMs ?? null,
      featureMs: coachDebug.featureExtractionMs ?? null,
      planMs: coachDebug.planRecognitionMs ?? null,
      opportunityMs: coachDebug.opportunityRankMs ?? null,
      explanationMs: coachDebug.explanationRenderMs ?? null,
      presentationMs: coachDebug.presentationFrameMs ?? null,
      totalCoachDecisionMs: coachDebug.totalCoachDecisionMs ?? null,
      renderDebugSnapshotMs: Date.now() - started,
    },
    coachPipeline: {
      selectedTheme,
      selectedOpportunityId,
      selectedOpportunityLayer,
      selectedOpportunityScore,
      selectedTemplateId,
      source: coachSource,
      usedFallback: runtimeSafeFallbackUsed,
      fallbackReason: runtimeSafeFallbackReason,
      evidenceTags: Array.isArray(coachQuality.evidenceTags) ? coachQuality.evidenceTags.map(String) : [],
      qualityScore,
      provenanceConsistent: provenanceIssues.length === 0,
      provenanceIssues,
    },
    coachTimelineSummary,
    coachTimeline,
    coachCardRenderTimeline,
    surfaceModeTransitionTimeline,
    actionTimeline,
    visualRenderTimeline,
    plainLeakTimeline,
    health: {
      criticalIssues: uniqueCriticalIssues,
      warnings: uniqueWarnings,
      passFail: {
        visualRecipeIndependent: !criticalIssues.some((issue) => issue.includes("VisualRecipe exists")),
        coachMatchesExpectedMove: expectedMoveExists ? coachFailureKind === "none" : "unknown",
      revealButtonFunctional: input.lastActionDebug?.lastClickedAction?.includes("reveal") ? Boolean(input.lastActionDebug?.stateChanged) : "unknown",
        instructionTargetAligned:
          instructionTargetUci
            ? coachMoveUci === instructionTargetUci && visualMoveUci === instructionTargetUci && revealTargetUci === instructionTargetUci
            : "unknown",
        continuationLinesAvailable: input.trainingMode === "continuation" ? continuationLinesPassedToBoard > 0 || !input.selectedCandidateUci : "unknown",
        noLegacyBypass: !input.legacyBypassDetected && !(input.visibleTeachingSurface?.safety?.legacyBypassDetected),
        noGenericFallbackWhenSpecificExists: !(expectedMoveExists && coachDebug.selectedOpportunityLayer === "fallback"),
        noPlainLeak: !(input.trainerView === "plain" && input.expectedMoveSan && String(input.coachDecision?.body ?? "").includes(input.expectedMoveSan)) && !Boolean(input.plainLeakDetected || input.visibleTeachingSurface?.safety?.plainLeakDetected),
        noStaleFen: boardFen4 === overlayFen4 && (!recipeFen4 || boardFen4 === recipeFen4),
        // Agent 6 surface invariant pass/fail
        surfaceNotBlockedOnTeaching: isTeachingFrame(input) ? !Boolean(input.visibleTeachingSurface?.safety?.blocked) : "unknown",
        surfaceTargetsAligned: instructionTargetUci ? !(input.surfaceFourTargetMismatch || input.visibleTeachingSurface?.debug?.fourTargetMismatch) : "unknown",
        surfacePiecesAligned: (instructionTargetPieceType || input.instructionTargetPieceType) ? !(input.surfaceTwoPieceMismatch || input.visibleTeachingSurface?.debug?.twoPieceTypeMismatch) : "unknown",
        noPlainLeakFromSurface: !Boolean(input.visibleTeachingSurface?.safety?.plainLeakDetected),
      },
    },
    debugParity: {
      actualCoachCardTitle,
      actualCoachCardBody,
      actualCoachCardButtons,
      actualCoachCardSource,
      actualActionSource,
      actualVisualSource,
      renderedActionIds,
      surfaceActionIds,
      renderedVisualPrimitiveCount,
      surfaceVisualPrimitiveCount,
      debugVisibleTitle: visibleTitle,
      debugVisibleBody: visibleBody,
      debugVisibleButtons: visibleButtons,
      parity: {
        coachCard: (actualCoachCardTitle ?? null) === (visibleTitle ?? null) && (actualCoachCardBody ?? null) === (visibleBody ?? null),
        actions: JSON.stringify(actualCoachCardButtons) === JSON.stringify(visibleButtons.map(String)),
        visuals: debugVisualCount === actualVisualCount,
      },
    },
    eventLog: (input.eventLog ?? []) as DebugEvent[],
  };
  return sanitizeForDebugJson(snapshot) as TrainerDebugSnapshot;
}
