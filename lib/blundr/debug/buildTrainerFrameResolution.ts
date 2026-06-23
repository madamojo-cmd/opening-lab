import type { PendingPromotion, PromotionPiece } from "../runtime/promotionAuthority";
import { resolveStage2TerminalProof } from "../runtime/terminalProof";
import { resolveStage2OpeningIdentity } from "../openings/openingIdentity";
import type {
  TrainerFrameApprovedContentResolution,
  TrainerFrameResolution,
  TrainerFrameCoachCardCopy,
  TrainerFrameCoachCardAuthority,
  TrainerFrameVisualResult,
  TrainerFrameFinalSurfaceAuthority,
  TrainerFrameTerminalProofResolution,
  TrainerFrameOpeningIdentityResolution,
} from "./trainerFrameResolutionTypes";

type Input = Record<string, any>;

function normalizeText(value: unknown): string | null {
  const text = typeof value === "string" ? value.trim() : String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function normalizeButtons(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((entry) => {
        if (typeof entry === "string") return entry;
        return String((entry as any)?.kind ?? (entry as any)?.id ?? (entry as any)?.label ?? entry ?? "");
      }).filter((entry) => entry.length > 0)
    : [];
}

function copyAuthorityFromSource(source: string | null): TrainerFrameCoachCardAuthority {
  if (source === "visible_surface_v28") return "visible_surface_v28";
  if (source === "displayedCoachDecision" || source === "surfaceCoachCardDecision") return "pipeline_coach_decision";
  return "unknown";
}

function buildCoachCopy(
  title: unknown,
  body: unknown,
  buttons: unknown,
  source: string | null,
): TrainerFrameCoachCardCopy {
  return {
    title: normalizeText(title),
    body: normalizeText(body),
    buttons: normalizeButtons(buttons),
    source,
    authority: copyAuthorityFromSource(source),
  };
}

function toNumberOrNull(value: unknown): number | null {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function normalizePromotionPiece(value: unknown): PromotionPiece | null {
  const text = String(value ?? "").trim().toLowerCase();
  return text === "q" || text === "r" || text === "b" || text === "n" ? text : null;
}

function normalizeString(value: unknown): string | null {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function normalizePacketKind(value: unknown): TrainerFrameApprovedContentResolution["packetKind"] {
  const text = normalizeText(value);
  if (text === "approved_packet") return "approved_packet";
  if (text === "safe_fallback") return "safe_fallback";
  return "none";
}

function normalizeVisualSource(value: unknown): TrainerFrameVisualResult["visualSource"] {
  const text = normalizeText(value);
  if (text === "approved_recipe") return "approved_recipe";
  if (text === "generated_recipe") return "generated_recipe";
  if (text === "fallback_current_surface") return "fallback_current_surface";
  return "none";
}

function buildTerminalProof(input: Input): TrainerFrameTerminalProofResolution {
  return resolveStage2TerminalProof({
    trainingMode: String(input.trainingMode ?? "restricted") as "restricted" | "continuation",
    isUserTurn: Boolean(input.isUserTurn),
    userExplicitlyEnteredContinuation: Boolean(input.userExplicitlyEnteredContinuation),
    selectedOpeningId: normalizeText(input.selectedOpeningId ?? input.selectedRepertoireId ?? null),
    selectedLineId: normalizeText(input.selectedLineId ?? input.selectedRepertoireId ?? null),
    runtimeOpeningId: normalizeText(input.runtimeBookOpeningId ?? input.runtimeOpeningId ?? null),
    selectedOpeningRuntimeAvailable: Boolean(input.selectedOpeningRuntimeAvailable ?? input.runtimeAvailable ?? false),
    fen4: normalizeText(input.fen ?? input.boardFen4 ?? input.normalizedFen ?? ""),
    lastUserMoveUci: normalizeText(input.lastUserMoveUci ?? null),
    lastUserMoveSan: normalizeText(input.lastUserMoveSan ?? null),
    afterFinalUserMove: Boolean(input.afterFinalUserMove),
    explicitCuratedTerminalNode: Boolean(input.explicitCuratedTerminalNode),
    selectedLineCompleteConfirmed: Boolean(input.selectedLineCompleteConfirmed),
    exactNodeHasChildren: input.exactNodeHasChildren ?? "unknown",
    hasNextOpponentMove: input.hasNextOpponentMove ?? "unknown",
    hasNextUserMove: input.hasNextUserMove ?? "unknown",
    validBranchCompleteLatch: Boolean(input.validBranchCompleteLatch),
    bookCompleteAllowed: Boolean(input.bookCompleteAllowed ?? input.guidedCompleteAllowed ?? false),
    guidedCompleteAllowed: Boolean(input.guidedCompleteAllowed ?? input.bookCompleteAllowed ?? false),
    runtimeBookBookExhausted: Boolean(input.runtimeBookBookExhausted),
    runtimeBookCandidateCount: Number(input.runtimeBookCandidateCount ?? 0),
    runtimeBookStatus: normalizeText(input.runtimeBookStatus ?? null),
  });
}

function isCastlingNotation(moveUci: string | null): boolean {
  if (!moveUci) return false;
  const normalized = moveUci.toLowerCase();
  return normalized === "e1h1" || normalized === "e8h8" || normalized === "e1c1" || normalized === "e8c8";
}

function normalizeCastlingMove(moveUci: string | null): string | null {
  const normalized = normalizeText(moveUci)?.toLowerCase() ?? null;
  if (!normalized) return null;
  if (normalized === "e1h1") return "e1g1";
  if (normalized === "e8h8") return "e8g8";
  if (normalized === "e1c1") return "e1c1";
  if (normalized === "e8c8") return "e8c8";
  return normalized;
}

function deriveVisualResult(input: Input, visual: TrainerFrameResolution["visual"], approvedContentResolution: TrainerFrameApprovedContentResolution): TrainerFrameVisualResult {
  const instructionTargetUci = normalizeText(input.instructionTargetUci);
  const instructionTargetSan = normalizeText(input.instructionTargetSan);
  const coachMoveUci = normalizeText(input.coachMoveUci ?? input.coachDecision?.debug?.coachMoveUci ?? input.displayedCoachDecision?.debug?.coachMoveUci ?? null);
  const finalVisualTargetUci = instructionTargetUci ?? visual.targetMoveUci ?? null;
  const finalVisualTargetSan = instructionTargetSan ?? normalizeText(input.visualRecipeMoveSan ?? input.visualRecipe?.moveSan ?? null);
  const approvedRecipeId = normalizeText(input.visualRecipe?.visualRecipeId ?? input.visualRecipe?.id ?? visual.recipeId ?? null);
  const approvedRecipeTargetMoveUci = normalizeText(input.visualRecipe?.targetMoveUci ?? input.visualRecipeMoveUci ?? input.visualRecipe?.moveUci ?? null);
  const sourceRuntimeMoveUci = normalizeText(
    input.stage2ApprovedPacketSourceRuntimeMoveUci ??
      input.approvedPacketSourceRuntimeMoveUci ??
      approvedContentResolution.sourceRuntimeMoveUci ??
      input.visualRecipe?.sourceRuntimeMoveUci ??
      null,
  );
  const plainViewSuppressed =
    String(input.trainerView ?? "").toLowerCase() === "plain" &&
    Boolean(!(input.showMoreShown ?? input.showMoreRevealed ?? false));
  const rendered = visual.authority !== "none" && !plainViewSuppressed && input.presentationFrame?.visual?.shouldRender !== false;
  const approvedRecipeMatched =
    visual.authority === "approved_recipe" &&
    Boolean(approvedRecipeId) &&
    Boolean(approvedRecipeTargetMoveUci) &&
    Boolean(finalVisualTargetUci) &&
    normalizeText(approvedRecipeTargetMoveUci) === normalizeText(finalVisualTargetUci);
  const generatedRecipeRendered = visual.authority === "generated_recipe" && rendered;
  const fallbackSurfaceVisualsRendered = visual.authority === "fallback_current_surface" && rendered;
  const sourceSquare = finalVisualTargetUci ? finalVisualTargetUci.slice(0, 2) : null;
  const destinationSquare = finalVisualTargetUci ? finalVisualTargetUci.slice(2, 4) : null;
  const targetMatchesInstruction = instructionTargetUci
    ? Boolean(finalVisualTargetUci && normalizeText(finalVisualTargetUci) === instructionTargetUci)
    : "not_applicable";
  const targetMatchesCoachCard = coachMoveUci
    ? Boolean(finalVisualTargetUci && normalizeText(finalVisualTargetUci) === coachMoveUci)
    : "not_applicable";
  const castlingNormalized = sourceRuntimeMoveUci
    ? (isCastlingNotation(sourceRuntimeMoveUci) && finalVisualTargetUci
        ? normalizeCastlingMove(sourceRuntimeMoveUci) === normalizeText(finalVisualTargetUci)
        : "not_applicable")
    : "not_applicable";
  const missingReasons: string[] = [];
  const warnings: string[] = [];
  if (plainViewSuppressed) missingReasons.push("plain_view_suppressed");
  if (!rendered && !plainViewSuppressed && visual.authority === "none") missingReasons.push("no_visuals_rendered");
  if (instructionTargetUci && finalVisualTargetUci && normalizeText(finalVisualTargetUci) !== instructionTargetUci) missingReasons.push("visual_target_mismatch");
  if (sourceRuntimeMoveUci && castlingNormalized !== "not_applicable" && castlingNormalized !== true) missingReasons.push("castling_not_normalized");
  if (visual.authority === "approved_recipe" && !approvedRecipeMatched) missingReasons.push("approved_recipe_target_mismatch");
  if (visual.authority === "approved_recipe" && approvedRecipeMatched) warnings.push("approved_recipe_exact_match");
  if (visual.authority === "generated_recipe") warnings.push("generated_recipe_rendered");

  return {
    rendered,
    visualSource: normalizeVisualSource(visual.authority),
    finalVisualTargetUci,
    finalVisualTargetSan,
    approvedRecipeMatched,
    approvedRecipeId,
    approvedRecipeTargetMoveUci,
    generatedRecipeRendered,
    fallbackSurfaceVisualsRendered,
    primitiveCount: visual.renderedPrimitiveCount,
    sourceSquare,
    destinationSquare,
    targetMatchesInstruction,
    targetMatchesCoachCard,
    plainViewSuppressed,
    castlingNormalized,
    sourceRuntimeMoveUci,
    missingReasons,
    warnings,
  };
}

export function buildTrainerFrameResolution(input: Input): TrainerFrameResolution {
  const preAuthority = buildCoachCopy(
    input.visibleTeachingSurface?.coach?.title ?? input.visibleTeachingSurface?.copy?.title,
    input.visibleTeachingSurface?.coach?.body ?? input.visibleTeachingSurface?.copy?.body,
    input.visibleTeachingSurface?.coach?.buttons ?? input.visibleTeachingSurface?.actions,
    normalizeText(input.visibleTeachingSurface?.owner ?? input.visibleSurfaceOwner ?? "") === "v28_visible_surface"
      ? "visible_surface_v28"
      : null,
  );

  const pipeline = buildCoachCopy(
    input.displayedCoachDecision?.title ?? input.coachDecision?.title,
    input.displayedCoachDecision?.body ?? input.coachDecision?.body,
    input.displayedCoachDecision?.buttons ?? input.coachDecision?.buttons,
    normalizeText(input.displayedCoachDecision?.debug?.coachDecisionSource ?? input.coachDecision?.debug?.coachDecisionSource ?? "") || "displayedCoachDecision",
  );

  const finalRendered = buildCoachCopy(
    input.actualCoachCardTitle ?? input.surfaceCoachCardDecision?.title ?? input.visibleTeachingSurface?.coach?.title ?? pipeline.title,
    input.actualCoachCardBody ?? input.surfaceCoachCardDecision?.body ?? input.visibleTeachingSurface?.coach?.body ?? pipeline.body,
    input.actualCoachCardButtons ?? input.surfaceCoachCardDecision?.buttons ?? input.visibleTeachingSurface?.actions ?? pipeline.buttons,
    normalizeText(input.actualCoachCardSource ?? input.surfaceCoachCardDecision?.source ?? "") || (normalizeText(input.actualActionSource ?? "") === "visible_surface_v28" ? "visible_surface_v28" : pipeline.source),
  );

  const renderedVisualPrimitiveCount = toNumberOrNull(input.renderedVisualPrimitiveCount ?? input.boardLinesToRender?.length ?? input.boardLines?.length) ?? 0;
  const surfaceVisualPrimitiveCount = toNumberOrNull(input.surfaceVisualPrimitiveCount ?? input.visibleTeachingSurface?.visual?.lines?.length ?? input.v28BoardVisualUiModel?.visualRecipes?.length) ?? 0;
  const actualVisualSource = normalizeText(input.actualVisualSource ?? input.presentationFrame?.visual?.source ?? input.visibleTeachingSurface?.debug?.visibleVisualOwner ?? null);
  const visualRecipeId = normalizeText(input.visualRecipe?.visualRecipeId ?? input.visualRecipe?.id ?? null);
  const patternId = normalizeText(input.visualRecipe?.patternId ?? null);
  const targetMoveUci = normalizeText(input.instructionTargetUci ?? input.expectedMoveUci ?? input.visualRecipeMoveUci ?? input.visualMoveUci ?? null);
  const renderedMoveUci = normalizeText(input.visualRecipeMoveUci ?? input.visualMoveUci ?? input.actualVisualMoveUci ?? null);
  const targetMatchesMoveUci = targetMoveUci && renderedMoveUci ? renderedMoveUci === targetMoveUci : "unknown";

  const approvedRecipeRendered =
    Boolean(input.stage2CoachingPacketKind === "approved_packet") &&
    Boolean(input.visualRecipe) &&
    Boolean(input.presentationFrame?.visual?.shouldRender !== false) &&
    renderedVisualPrimitiveCount > 0 &&
    actualVisualSource !== "visible_surface_v28";
  const generatedRecipeRendered =
    Boolean(input.visualRecipe) &&
    Boolean(input.presentationFrame?.visual?.shouldRender !== false) &&
    renderedVisualPrimitiveCount > 0 &&
    !approvedRecipeRendered &&
    actualVisualSource !== "visible_surface_v28";
  const fallbackCurrentSurfaceRendered =
    (actualVisualSource === "visible_surface_v28" && (renderedVisualPrimitiveCount > 0 || surfaceVisualPrimitiveCount > 0)) ||
    Boolean(renderedVisualPrimitiveCount > 0 && surfaceVisualPrimitiveCount > 0 && !approvedRecipeRendered && !generatedRecipeRendered);
  const noVisualsRendered = !approvedRecipeRendered && !generatedRecipeRendered && !fallbackCurrentSurfaceRendered && renderedVisualPrimitiveCount === 0 && surfaceVisualPrimitiveCount === 0;

  const visualAuthority =
    approvedRecipeRendered
      ? "approved_recipe"
      : generatedRecipeRendered
        ? "generated_recipe"
        : fallbackCurrentSurfaceRendered
          ? "fallback_current_surface"
          : "none";

  const renderedQualityScore = toNumberOrNull(input.renderedQualityScore ?? input.coachQuality?.renderedQualityScore ?? input.coachQuality?.qualityScore);
  const pipelineQualityScore = toNumberOrNull(input.coachQuality?.qualityScore);
  const finalCoachScore = renderedQualityScore ?? pipelineQualityScore;
  const qualityScoreSource = normalizeText(input.coachQuality?.qualityScoreSource ?? input.renderedQualityScoreSource ?? input.coachQuality?.source ?? null);
  const lowQualityThreshold = qualityScoreSource === "verified_safe_fallback" ? 65 : 80;
  const lowQualityTriggered = finalCoachScore != null && finalCoachScore > 0 && finalCoachScore < lowQualityThreshold;
  const acceptedTargetUci = normalizeText(input.acceptedTargetUci ?? input.acceptedPromotionUci ?? input.instructionTargetUci ?? null);
  const openingIdentity = resolveStage2OpeningIdentity({
    selectedOpeningId: normalizeText(input.selectedOpeningId ?? input.selectedRepertoireId ?? null),
    runtimeOpeningId: normalizeText(input.runtimeBookOpeningId ?? input.runtimeOpeningId ?? null),
    selectedOpeningRuntimeAvailable: Boolean(input.selectedOpeningRuntimeAvailable ?? input.runtimeAvailable ?? false),
  });
  const terminalProof = (input.terminalProof as TrainerFrameTerminalProofResolution | undefined) ?? buildTerminalProof(input);
  const finalSurfaceAuthority: TrainerFrameFinalSurfaceAuthority = (input.finalSurfaceAuthority as TrainerFrameFinalSurfaceAuthority | undefined) ?? {
    branchCompleteAllowedByTerminalProof: terminalProof.proven,
    continueFromHereAllowedByTerminalProof: terminalProof.proven,
    runtimeBookExhaustionTreatedAsDebugOnly: terminalProof.runtimeBookExhaustionTreatedAsDebugOnly,
    finalSurfaceBlockedReasons: terminalProof.blockedReasons.slice(),
  };
  const promotion: TrainerFrameResolution["promotion"] = {
    pendingPromotion: (input.pendingPromotion as PendingPromotion | null | undefined) ?? null,
    promotionPickerRendered: Boolean(input.promotionPickerRendered),
    promotionOptions: Array.isArray(input.promotionOptions) ? input.promotionOptions.map(String) : [],
    selectedPromotionPiece: normalizePromotionPiece(input.selectedPromotionPiece),
    attemptedPromotionUci: normalizeString(input.attemptedPromotionUci),
    acceptedPromotionUci: normalizeString(input.acceptedPromotionUci),
    acceptedTargetUci,
    promotionAuthorityMatched: typeof input.promotionAuthorityMatched === "boolean" ? input.promotionAuthorityMatched : null,
    promotionAuthorityMismatchReason: normalizeString(input.promotionAuthorityMismatchReason),
    promotionAuthorityTargetUci: normalizeString(input.promotionAuthorityTargetUci),
  };

  const approvedContentResolution: TrainerFrameResolution["approvedContent"] = {
    matched:
      typeof input.approvedPacketMatched === "boolean"
        ? input.approvedPacketMatched
        : typeof input.stage2ApprovedPacketMatched === "boolean"
          ? input.stage2ApprovedPacketMatched
          : Boolean(
            input.stage2CoachingPacketKind === "approved_packet" ||
            input.stage2CoachingPacketResolution?.kind === "approved_packet",
          ),
    packetKind: normalizePacketKind(
      input.approvedPacketKind ??
      input.stage2ApprovedPacketKind ??
      input.stage2CoachingPacketKind ??
      input.stage2CoachingPacketResolution?.kind,
    ),
    packetId: normalizeString(
      input.approvedPacketId ??
      input.stage2ApprovedPacketId ??
      input.stage2CoachingPacketResolution?.packet?.packetId ??
      input.stage2CoachingPacketId,
    ),
    sourceBundle: normalizeString(
      input.approvedPacketSourceBundle ??
      input.stage2ApprovedPacketSourceBundle ??
      input.stage2CoachingPacketResolution?.packet?.sourceCandidatePackages?.[0] ??
      input.stage2CoachingPacketResolution?.packet?.sourceCandidatePackage ??
      input.stage2CoachingPacketSourceBundle,
    ),
    sourceFile: normalizeString(
      input.approvedPacketSourceFile ??
      input.stage2ApprovedPacketSourceFile ??
      input.stage2CoachingPacketResolution?.packet?.sourceFile ??
      input.stage2CoachingPacketSourceFile,
    ),
    sourceRuntimeMoveUci: normalizeString(
      input.approvedPacketSourceRuntimeMoveUci ??
      input.stage2ApprovedPacketSourceRuntimeMoveUci ??
      input.stage2CoachingPacketResolution?.packet?.sourceRuntimeMoveUci ??
      null,
    ),
    packetStatus: normalizeString(
      input.approvedPacketStatus ??
      input.stage2ApprovedPacketStatus ??
      input.stage2CoachingPacketResolution?.packet?.status ??
      null,
    ),
    approvalReadiness: normalizeString(
      input.approvedPacketApprovalReadiness ??
      input.stage2ApprovedPacketApprovalReadiness ??
      input.stage2CoachingPacketResolution?.packet?.approvalReadiness ??
      null,
    ),
    missReason: normalizeString(
      input.approvedPacketMissReason ??
      input.stage2ApprovedPacketMissReason ??
      input.stage2CoachingPacketResolution?.reason ??
      null,
    ),
    fallbackReason: normalizeString(
      input.approvedPacketFallbackReason ??
      input.stage2ApprovedPacketFallbackReason ??
      input.runtimeSafeFallbackReason ??
      input.coachQuality?.fallbackReason ??
      null,
    ),
    visualSource: normalizeString(
      input.approvedPacketVisualSource ??
      input.stage2ApprovedPacketVisualSource ??
      input.stage2CoachingPacketResolution?.packet?.surface ??
      input.actualVisualSource ??
      input.presentationFrame?.visual?.source ??
      null,
    ),
  };

  return {
    frameId: input.trainerFrameId ?? input.frameId ?? input.debugFrameId ?? null,
    trainerPhase: normalizeText(input.trainerPhase),
    trainerView: normalizeText(input.trainerView),
    trainingMode: normalizeText(input.trainingMode),
    isUserTurn: Boolean(input.isUserTurn),
    instructionTargetUci: normalizeText(input.instructionTargetUci),
    instructionTargetSan: normalizeText(input.instructionTargetSan),
    instructionTargetPieceType: normalizeText(input.instructionTargetPieceType),
    coachMoveUci: normalizeText(input.coachMoveUci ?? input.coachDecision?.debug?.coachMoveUci ?? input.displayedCoachDecision?.debug?.coachMoveUci ?? null),
    coachPieceType: normalizeText(input.coachPieceType ?? input.coachDecision?.debug?.coachPieceType ?? input.displayedCoachDecision?.debug?.coachPieceType ?? null),
    acceptedTargetUci,
    coachCard: {
      preAuthority,
      pipeline,
      finalRendered,
      renderedCopyAuthority: finalRendered.authority,
      finalRenderedMatchesPipeline: finalRendered.title === pipeline.title && finalRendered.body === pipeline.body,
      finalRenderedMatchesPreAuthority: finalRendered.title === preAuthority.title && finalRendered.body === preAuthority.body,
    },
    visual: {
      authority: visualAuthority,
      approvedRecipeRendered,
      generatedRecipeRendered,
      fallbackCurrentSurfaceRendered,
      noVisualsRendered,
      renderedMoveUci,
      targetMoveUci,
      targetMatchesMoveUci,
      renderedPrimitiveCount: renderedVisualPrimitiveCount,
      surfacePrimitiveCount: surfaceVisualPrimitiveCount,
      renderedSource: actualVisualSource,
      surfaceSource: normalizeText(input.visibleTeachingSurface?.mode ?? input.presentationFrame?.visual?.source ?? null),
      recipeId: visualRecipeId,
      patternId,
    },
    visualResult: deriveVisualResult(input, {
      authority: visualAuthority,
      approvedRecipeRendered,
      generatedRecipeRendered,
      fallbackCurrentSurfaceRendered,
      noVisualsRendered,
      renderedMoveUci,
      targetMoveUci,
      targetMatchesMoveUci,
      renderedPrimitiveCount: renderedVisualPrimitiveCount,
      surfacePrimitiveCount: surfaceVisualPrimitiveCount,
      renderedSource: actualVisualSource,
      surfaceSource: normalizeText(input.visibleTeachingSurface?.mode ?? input.presentationFrame?.visual?.source ?? null),
      recipeId: visualRecipeId,
      patternId,
    }, approvedContentResolution),
    coachQuality: {
      qualityScore: finalCoachScore,
      qualityScoreSource,
      lowQualityTriggered,
      lowQualityThreshold,
      lowQualityBasedOn: renderedQualityScore != null ? "final_rendered" : pipelineQualityScore != null ? "fallback" : "none",
    },
    promotion,
    approvedContent: approvedContentResolution,
    terminalProof,
    finalSurfaceAuthority,
    openingIdentity: {
      selectedOpeningId: openingIdentity.selectedOpeningId,
      canonicalSelectedOpeningId: openingIdentity.canonicalSelectedOpeningId,
      resolvedSelectedOpeningId: openingIdentity.resolvedSelectedOpeningId,
      runtimeOpeningId: openingIdentity.runtimeOpeningId,
      selectedOpeningRuntimeAvailable: openingIdentity.selectedOpeningRuntimeAvailable,
      openingIdentityMatched: openingIdentity.openingIdentityMatched,
      openingIdentityMismatchReason: openingIdentity.openingIdentityMismatchReason,
    } as TrainerFrameOpeningIdentityResolution,
  };
}
