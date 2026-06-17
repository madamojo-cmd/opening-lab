import type { PendingPromotion, PromotionPiece } from "../runtime/promotionAuthority";
import type {
  TrainerFrameApprovedContentResolution,
  TrainerFrameResolution,
  TrainerFrameCoachCardCopy,
  TrainerFrameCoachCardAuthority,
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
    coachQuality: {
      qualityScore: finalCoachScore,
      qualityScoreSource,
      lowQualityTriggered,
      lowQualityThreshold,
      lowQualityBasedOn: renderedQualityScore != null ? "final_rendered" : pipelineQualityScore != null ? "fallback" : "none",
    },
    promotion,
    approvedContent: approvedContentResolution,
  };
}
