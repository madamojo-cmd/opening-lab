import { Chess } from "chess.js";

import { buildEvidenceGraph } from "../brain/buildEvidenceGraph";
import { extractAdvancedFeatures } from "../features/advancedFeatureExtractor";
import { mapFeaturesToOpportunities } from "../opportunity/featureOpportunityMapper";
import { scoreOpportunity } from "../opportunity/multiLayerOpportunityRanker";
import { recognizeStrategicPlans } from "../plans/planRecognitionEngine";
import { selectRenderedCoachCardCopyAuthority } from "../presentation/renderedCoachCopyAuthority";
import { mapVisibleSurfaceModeToStage2CoachingSurface, buildStage2CoachContext, resolveStage2CoachingPacket } from "../stage2Coaching";
import { STAGE2_APPROVED_CONTENT_ENABLED, STAGE2_COACHING_RESOLVER_ENABLED, STAGE2_SAFE_FALLBACK_ENABLED } from "../stage2Coaching/stage2CoachingFlags";
import { getStage2OpeningAvailability } from "../openings/openingAvailability";
import { normalizeVisualFen } from "../visual/normalizeVisualFen";
import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
import type { TeachingOpportunity } from "../opportunity/opportunityTypes";
import { buildTrainerFrameResolution } from "./buildTrainerFrameResolution";
import {
  resolveStage2ProviderWarnings,
  summarizeStage2ProviderWarnings,
} from "../providers/providerWarningPolicy";
import type {
  Stage2FeatureTraceBundle,
  Stage2FeatureTraceCoachCardResult,
  Stage2FeatureTraceDetectedConcept,
  Stage2FeatureTraceDetectedFeature,
  Stage2FeatureTraceMissingReason,
  Stage2FeatureTrace,
  Stage2FeatureTraceFrameKind,
  Stage2FeatureTraceRankedOpportunity,
  Stage2FeatureTraceReviewCandidateEventPreview,
  Stage2FeatureTraceTimelineEntry,
  Stage2FeatureTraceVisualRecipeResult,
} from "./stage2FeatureTraceTypes";
import type { TrainerFrameResolution, TrainerFrameVisualResult } from "./trainerFrameResolutionTypes";

type FeatureTraceInput = Record<string, any>;

type DerivedMoveFacts = {
  legal: boolean;
  moveUci: string | null;
  moveSan: string | null;
  from: string | null;
  to: string | null;
  pieceType: string | null;
  isPromotion: boolean;
  promotionPiece: string | null;
  isCentralPawnAdvance: boolean;
  isMinorPieceDevelopment: boolean;
  isKingSafetyMove: boolean;
  isCastle: boolean;
  isCapture: boolean;
  isCheck: boolean;
  isForcingMove: boolean;
  conceptIds: string[];
  featureClaims: Stage2FeatureTraceDetectedFeature[];
  boardFacts: Record<string, unknown>;
};

const FOCUS_CONCEPT_PRIORITY = [
  "capture",
  "material",
  "forcing_move",
  "check",
  "center_control",
  "minor_piece_development",
  "king_safety",
  "castling",
  "development",
];

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeTextOrNull(value: unknown): string | null {
  const text = normalizeText(value);
  return text.length > 0 ? text : null;
}

function normalizeUci(value: unknown): string | null {
  const text = normalizeText(value).toLowerCase();
  return /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(text) ? text : null;
}

function dedupeByKey<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const value = key(item);
    if (seen.has(value)) continue;
    seen.add(value);
    out.push(item);
  }
  return out;
}

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((entry) => String(entry)).filter((entry) => entry.length > 0) : [];
}

function deriveFrameKind(input: FeatureTraceInput, trainerFrameResolution: TrainerFrameResolution): Stage2FeatureTraceFrameKind {
  const resolvedKind = normalizeText(input.currentInstructionFrame?.kind ?? input.currentInstructionFrameKind ?? null);
  if (resolvedKind === "branch_complete") return "branch_complete";
  if (resolvedKind === "terminal") return "terminal";
  if (resolvedKind === "opponent_replying") return "opponent_replying";
  if (resolvedKind === "transitioning") return "system";
  if (
    trainerFrameResolution.terminalProof?.proven &&
    String(input.trainingMode ?? "") === "restricted" &&
    Boolean(input.isUserTurn) &&
    String(input.trainerPhase ?? "") === "ready_for_user" &&
    input.instructionTargetUci == null
  ) {
    return "terminal_continuation_pause";
  }
  if (resolvedKind === "continuation_candidate") return "continuation_user_turn";
  if (resolvedKind === "guided_move" || resolvedKind === "lichess_branch_move" || resolvedKind === "adaptive_branch_move") return "instructional_user_turn";
  if (String(input.trainingMode ?? "").toLowerCase() === "continuation" && Boolean(input.isUserTurn)) return "continuation_user_turn";
  if (Boolean(input.isUserTurn) && String(input.trainerPhase ?? "") === "ready_for_user") return "instructional_user_turn";
  if (String(input.trainerPhase ?? "") === "terminal") return "terminal";
  if (String(input.trainerPhase ?? "") === "opponent_replying") return "opponent_replying";
  if (trainerFrameResolution.approvedContent.packetKind === "safe_fallback" && Boolean(input.isUserTurn)) return "instructional_user_turn";
  return "system";
}

function deriveCoachCardSource(trainerFrameResolution: TrainerFrameResolution, approvedContentMatched: boolean, fallbackUsed: boolean): "approved" | "live" | "safe_fallback" {
  if (approvedContentMatched) return "approved";
  if (fallbackUsed) return "safe_fallback";
  return trainerFrameResolution.coachCard.finalRendered.source === "surfaceCoachCardDecision" || trainerFrameResolution.coachCard.finalRendered.source === "displayedCoachDecision"
    ? "live"
    : "live";
}

function derivePlainViewLeakSafe(input: FeatureTraceInput, coachCardResult: Stage2FeatureTraceCoachCardResult, moveFacts: DerivedMoveFacts): boolean {
  const visibleMode = normalizeText(input.visibleTeachingSurface?.mode ?? input.v28VisibleSurface?.mode ?? input.presentationFrame?.coach?.owner ?? "");
  if (!String(input.trainerView ?? "").includes("plain")) return true;
  const title = `${coachCardResult.visibleTitle ?? ""} ${coachCardResult.visibleBody ?? ""}`.toLowerCase();
  const san = normalizeText(moveFacts.moveSan ?? "").toLowerCase();
  const uci = normalizeText(moveFacts.moveUci ?? "").toLowerCase();
  const preShowMore = visibleMode === "plain_before_show_more";
  if (!preShowMore) return true;
  return !title.includes(san) && !title.includes(uci);
}

function deriveReviewCandidateEventPreview(params: {
  openingId: string | null;
  lineId: string | null;
  fen4: string;
  moveFacts: DerivedMoveFacts;
  selectedTheme: string | null;
  selectedOpportunity: Stage2FeatureTraceRankedOpportunity | null;
  frameKind: Stage2FeatureTraceFrameKind;
  showMoreShown: boolean;
  coachCardSource: "approved" | "live" | "safe_fallback";
  visualRecipeResult: Stage2FeatureTraceVisualRecipeResult;
  plainViewLeakSafe: boolean;
  approvedContentMatched: boolean;
  fallbackUsed: boolean;
  traceStatus: Stage2FeatureTrace["traceStatus"];
}): Stage2FeatureTraceReviewCandidateEventPreview | null {
  const instructionalFrame = params.frameKind === "instructional_user_turn" || params.frameKind === "continuation_user_turn";
  const eligible =
    instructionalFrame &&
    params.approvedContentMatched &&
    !params.fallbackUsed &&
    params.plainViewLeakSafe &&
    params.visualRecipeResult.targetMatchesMoveUci === true &&
    params.selectedOpportunity != null &&
    params.traceStatus !== "missing";

  if (!eligible) return null;
  return {
    openingId: params.openingId,
    lineId: params.lineId,
    fen4: params.fen4,
    targetUci: params.moveFacts.moveUci,
    targetSan: params.moveFacts.moveSan,
    conceptIds: params.moveFacts.conceptIds.slice(),
    selectedTheme: params.selectedTheme,
    selectedOpportunityId: params.selectedOpportunity?.id ?? null,
    viewMode: params.showMoreShown ? "assisted" : "plain",
    usedHint: Boolean(params.showMoreShown),
    usedShowMore: Boolean(params.showMoreShown),
    result: params.showMoreShown ? "revealed" : "not_attempted",
    coachCardSource: params.coachCardSource,
    visualRecipeId: params.visualRecipeResult.recipeId,
  };
}

function toFeatureClaimRecord(claim: any, source: Stage2FeatureTraceDetectedFeature["source"]): Stage2FeatureTraceDetectedFeature {
  return {
    id: String(claim.id ?? `${source}:${claim.type ?? "feature"}`),
    label: String(claim.type ?? claim.label ?? claim.id ?? "feature"),
    source,
    confidence: claim.confidence ?? claim.risk ?? null,
    conceptId: claim.conceptId ?? null,
    evidence: Array.isArray(claim.evidence) ? claim.evidence.map(String) : [],
    canMention: Boolean(claim.canMention),
    canDominate: Boolean(claim.canDominate),
  };
}

function createMoveFactFeatureClaim(params: {
  id: string;
  label: string;
  conceptId: string;
  evidence: string[];
  canDominate?: boolean;
}): Stage2FeatureTraceDetectedFeature {
  return {
    id: params.id,
    label: params.label,
    source: "move_fact",
    confidence: "high",
    conceptId: params.conceptId,
    evidence: params.evidence,
    canMention: true,
    canDominate: Boolean(params.canDominate),
  };
}

function buildDerivedMoveFacts(input: FeatureTraceInput): DerivedMoveFacts {
  const fen = normalizeText(input.fen);
  const requestedMoveUci = normalizeUci(
    input.instructionTargetUci ??
      input.expectedMoveUci ??
      input.selectedCandidateUci ??
      input.visualRecipeMoveUci ??
      input.visualMoveUci,
  );
  const requestedMoveSan = normalizeText(
    input.expectedMoveSan ??
      input.instructionTargetSan ??
      input.selectedCandidateSan ??
      input.coachDecision?.debug?.coachSelectedCandidateMove ??
      input.visualRecipeMoveSan ??
      input.visualMoveSan,
  ) || null;

  if (!fen || !requestedMoveUci) {
    return {
      legal: false,
      moveUci: requestedMoveUci,
      moveSan: requestedMoveSan,
      from: null,
      to: null,
      pieceType: null,
      isPromotion: false,
      promotionPiece: null,
      isCentralPawnAdvance: false,
      isMinorPieceDevelopment: false,
      isKingSafetyMove: false,
      isCastle: false,
      isCapture: false,
      isCheck: false,
      isForcingMove: false,
      conceptIds: [],
      featureClaims: [],
      boardFacts: {
        targetLegal: false,
        reason: !fen ? "missing_fen" : "missing_move_uci",
      },
    };
  }

  try {
    const chess = new Chess(fen);
    const from = requestedMoveUci.slice(0, 2);
    const to = requestedMoveUci.slice(2, 4);
    const promotion = requestedMoveUci.length > 4 ? requestedMoveUci.slice(4, 5) : undefined;
    const move = chess.move({ from, to, promotion: promotion ?? "q" });
    if (!move) {
      return {
        legal: false,
        moveUci: requestedMoveUci,
        moveSan: requestedMoveSan,
        from,
        to,
        pieceType: null,
        isPromotion: false,
        promotionPiece: null,
        isCentralPawnAdvance: false,
        isMinorPieceDevelopment: false,
        isKingSafetyMove: false,
        isCastle: false,
        isCapture: false,
        isCheck: false,
        isForcingMove: false,
        conceptIds: [],
        featureClaims: [],
        boardFacts: {
          targetLegal: false,
          reason: "illegal_move",
        },
      };
    }

    const moveSan = normalizeText(move.san ?? requestedMoveSan ?? requestedMoveUci) || requestedMoveUci;
    const pieceType = String(move.piece ?? "").toLowerCase() || null;
    const isCentralPawnAdvance =
      pieceType === "p" &&
      ["d", "e"].includes(from[0]) &&
      ["d", "e"].includes(to[0]) &&
      Math.abs(Number(from[1]) - Number(to[1])) >= 1;
    const isMinorPieceDevelopment =
      ["n", "b"].includes(pieceType ?? "") &&
      ((move.color === "w" && ["1", "2"].includes(from[1])) || (move.color === "b" && ["7", "8"].includes(from[1])));
    const isCastle = pieceType === "k" && Math.abs(from.charCodeAt(0) - to.charCodeAt(0)) >= 2;
    const isKingSafetyMove = isCastle || pieceType === "k" || Boolean(move.san?.includes("O-O"));
    const isCapture = Boolean(move.captured);
    const isCheck = Boolean(move.san?.includes("+"));
    const isForcingMove = isCheck || isCapture;
    const conceptIds: string[] = [];
    const featureClaims: Stage2FeatureTraceDetectedFeature[] = [];

    if (isCentralPawnAdvance) {
      conceptIds.push("central_pawn_advance", "center_control");
      featureClaims.push(createMoveFactFeatureClaim({
        id: "move_fact:central_pawn_advance",
        label: "central_pawn_advance",
        conceptId: "center_control",
        evidence: [requestedMoveUci, "central_file_advance"],
        canDominate: true,
      }));
      featureClaims.push(createMoveFactFeatureClaim({
        id: "move_fact:center_control",
        label: "center_control",
        conceptId: "center_control",
        evidence: [requestedMoveUci, "central_control"],
      }));
    }
    if (isMinorPieceDevelopment) {
      conceptIds.push("minor_piece_development", "development");
      featureClaims.push(createMoveFactFeatureClaim({
        id: "move_fact:minor_piece_development",
        label: "minor_piece_development",
        conceptId: "development",
        evidence: [requestedMoveUci, "minor_piece_left_back_rank"],
        canDominate: true,
      }));
    }
    if (isCastle) {
      conceptIds.push("castling", "king_safety");
      featureClaims.push(createMoveFactFeatureClaim({
        id: "move_fact:castling",
        label: "castling",
        conceptId: "king_safety",
        evidence: [requestedMoveUci, "king_castled"],
        canDominate: true,
      }));
      featureClaims.push(createMoveFactFeatureClaim({
        id: "move_fact:king_safety",
        label: "king_safety",
        conceptId: "king_safety",
        evidence: [requestedMoveUci, "king_activated_safely"],
      }));
    }
    if (isCapture) {
      conceptIds.push("capture", "material");
      featureClaims.push(createMoveFactFeatureClaim({
        id: "move_fact:capture",
        label: "capture",
        conceptId: "material",
        evidence: [requestedMoveUci, "piece_taken"],
        canDominate: true,
      }));
      featureClaims.push(createMoveFactFeatureClaim({
        id: "move_fact:material",
        label: "material",
        conceptId: "material",
        evidence: [requestedMoveUci, "material_balance_changes"],
      }));
    }
    if (isCheck) {
      conceptIds.push("forcing_move", "check");
      featureClaims.push(createMoveFactFeatureClaim({
        id: "move_fact:forcing_move",
        label: "forcing_move",
        conceptId: "check",
        evidence: [requestedMoveUci, "check"],
        canDominate: true,
      }));
      featureClaims.push(createMoveFactFeatureClaim({
        id: "move_fact:check",
        label: "check",
        conceptId: "check",
        evidence: [requestedMoveUci, "king_in_check"],
      }));
    }

    const boardFacts: Record<string, unknown> = {
      targetLegal: true,
      moveSan,
      moveUci: requestedMoveUci,
      acceptedTargetUci: requestedMoveUci,
      from,
      to,
      pieceType,
      isPromotion: Boolean(move.promotion),
      promotionPiece: normalizeText(move.promotion) || null,
      isCentralPawnAdvance,
      isMinorPieceDevelopment,
      isKingSafetyMove,
      isCastle,
      isCapture,
      isCheck,
      isForcingMove,
      resultingFen: chess.fen(),
    };

    return {
      legal: true,
      moveUci: requestedMoveUci,
      moveSan,
      from,
      to,
      pieceType,
      isPromotion: Boolean(move.promotion),
      promotionPiece: normalizeText(move.promotion) || null,
      isCentralPawnAdvance,
      isMinorPieceDevelopment,
      isKingSafetyMove,
      isCastle,
      isCapture,
      isCheck,
      isForcingMove,
      conceptIds,
      featureClaims,
      boardFacts,
    };
  } catch {
    return {
      legal: false,
      moveUci: requestedMoveUci,
      moveSan: requestedMoveSan,
      from: null,
      to: null,
      pieceType: null,
      isPromotion: false,
      promotionPiece: null,
      isCentralPawnAdvance: false,
      isMinorPieceDevelopment: false,
      isKingSafetyMove: false,
      isCastle: false,
      isCapture: false,
      isCheck: false,
      isForcingMove: false,
      conceptIds: [],
      featureClaims: [],
      boardFacts: {
        targetLegal: false,
        reason: "move_parsing_error",
      },
    };
  }
}

function buildTraceOpportunities(input: {
  moveFacts: DerivedMoveFacts;
  features: ReturnType<typeof extractAdvancedFeatures>;
  plans: ReturnType<typeof recognizeStrategicPlans>;
  trainerView: string;
  visualRecipeId?: string | null;
  conceptId?: string | null;
  expectedMoveUci?: string | null;
  expectedMoveSan?: string | null;
}): TeachingOpportunity[] {
  const opportunities: TeachingOpportunity[] = [];
  const moveFacts = input.moveFacts;

  if (moveFacts.isCentralPawnAdvance && !moveFacts.isCapture) {
    opportunities.push({
      id: "trace:central_pawn_advance",
      layer: "expected_move",
      intent: "explain_training_move",
      moveUci: moveFacts.moveUci ?? undefined,
      moveSan: moveFacts.moveSan ?? undefined,
      conceptId: "center_control",
      requiredClaimIds: [],
      requiredFeatureClaimIds: [],
      requiredPlanIds: [],
      forbiddenIfMissing: [],
      specificityScore: 100,
      pedagogicalValue: 96,
      urgencyScore: 92,
      confidenceScore: 100,
      repertoireRelevance: 94,
      visualAlignmentScore: input.visualRecipeId ? 90 : 70,
      planCoherenceScore: 88,
      ratingFitScore: 95,
      repetitionPenalty: 0,
      safetyPenalty: 0,
      layerPrior: 120,
      totalScore: 0,
      canRender: true,
      debug: { source: "trace_move_fact" },
    });
  }

  if (moveFacts.isMinorPieceDevelopment) {
    opportunities.push({
      id: "trace:minor_piece_development",
      layer: "expected_move",
      intent: "explain_training_move",
      moveUci: moveFacts.moveUci ?? undefined,
      moveSan: moveFacts.moveSan ?? undefined,
      conceptId: "minor_piece_development",
      requiredClaimIds: [],
      requiredFeatureClaimIds: [],
      requiredPlanIds: [],
      forbiddenIfMissing: [],
      specificityScore: 96,
      pedagogicalValue: 94,
      urgencyScore: 84,
      confidenceScore: 100,
      repertoireRelevance: 92,
      visualAlignmentScore: input.visualRecipeId ? 90 : 70,
      planCoherenceScore: 86,
      ratingFitScore: 94,
      repetitionPenalty: 0,
      safetyPenalty: 0,
      layerPrior: 110,
      totalScore: 0,
      canRender: true,
      debug: { source: "trace_move_fact" },
    });
  }

  if (moveFacts.isCastle) {
    opportunities.push({
      id: "trace:castling",
      layer: "expected_move",
      intent: "explain_training_move",
      moveUci: moveFacts.moveUci ?? undefined,
      moveSan: moveFacts.moveSan ?? undefined,
      conceptId: "king_safety",
      requiredClaimIds: [],
      requiredFeatureClaimIds: [],
      requiredPlanIds: [],
      forbiddenIfMissing: [],
      specificityScore: 99,
      pedagogicalValue: 95,
      urgencyScore: 90,
      confidenceScore: 100,
      repertoireRelevance: 92,
      visualAlignmentScore: input.visualRecipeId ? 88 : 68,
      planCoherenceScore: 90,
      ratingFitScore: 95,
      repetitionPenalty: 0,
      safetyPenalty: 0,
      layerPrior: 118,
      totalScore: 0,
      canRender: true,
      debug: { source: "trace_move_fact" },
    });
  }

  if (moveFacts.isCapture) {
    opportunities.push({
      id: "trace:capture_material",
      layer: "expected_move",
      intent: "explain_training_move",
      moveUci: moveFacts.moveUci ?? undefined,
      moveSan: moveFacts.moveSan ?? undefined,
      conceptId: "material",
      requiredClaimIds: [],
      requiredFeatureClaimIds: [],
      requiredPlanIds: [],
      forbiddenIfMissing: [],
      specificityScore: 98,
      pedagogicalValue: 93,
      urgencyScore: 91,
      confidenceScore: 100,
      repertoireRelevance: 90,
      visualAlignmentScore: input.visualRecipeId ? 88 : 66,
      planCoherenceScore: 86,
      ratingFitScore: 92,
      repetitionPenalty: 0,
      safetyPenalty: 0,
      layerPrior: 112,
      totalScore: 0,
      canRender: true,
      debug: { source: "trace_move_fact" },
    });
  }

  if (moveFacts.isCheck) {
    opportunities.push({
      id: "trace:forcing_move_check",
      layer: "tactical",
      intent: "explain_training_move",
      moveUci: moveFacts.moveUci ?? undefined,
      moveSan: moveFacts.moveSan ?? undefined,
      conceptId: "check",
      requiredClaimIds: [],
      requiredFeatureClaimIds: [],
      requiredPlanIds: [],
      forbiddenIfMissing: [],
      specificityScore: 100,
      pedagogicalValue: 97,
      urgencyScore: 98,
      confidenceScore: 100,
      repertoireRelevance: 92,
      visualAlignmentScore: input.visualRecipeId ? 94 : 70,
      planCoherenceScore: 90,
      ratingFitScore: 95,
      repetitionPenalty: 0,
      safetyPenalty: 0,
      layerPrior: 125,
      totalScore: 0,
      canRender: true,
      debug: { source: "trace_move_fact" },
    });
  }

  const mapOpportunities = mapFeaturesToOpportunities({
    features: input.features,
    plans: input.plans,
    expectedMoveUci: moveFacts.moveUci ?? input.expectedMoveUci ?? undefined,
    expectedMoveSan: moveFacts.moveSan ?? input.expectedMoveSan ?? undefined,
    visualRecipeId: input.visualRecipeId ?? undefined,
    conceptId: input.conceptId ?? moveFacts.conceptIds[0] ?? undefined,
    trainerView:
      input.trainerView === "plain"
        ? "plain"
        : input.trainerView === "assisted"
          ? "assisted"
          : "freeplay",
  });

  opportunities.push(...mapOpportunities);
  return dedupeByKey(opportunities, (opportunity) => opportunity.id);
}

function summarizeRankedOpportunity(opportunity: TeachingOpportunity, rank: number, selected: boolean): Stage2FeatureTraceRankedOpportunity {
  return {
    rank,
    id: opportunity.id,
    layer: opportunity.layer,
    intent: opportunity.intent,
    totalScore: Number.isFinite(opportunity.totalScore) ? Number(opportunity.totalScore) : 0,
    canRender: Boolean(opportunity.canRender),
    selected,
    rejectedReason: selected ? null : opportunity.blockedReason ?? "lower_ranked",
    moveUci: opportunity.moveUci ?? null,
    moveSan: opportunity.moveSan ?? null,
    conceptId: opportunity.conceptId ?? null,
    planId: opportunity.planId ?? null,
    recipeId: opportunity.recipeId ?? null,
  };
}

function pickConceptId(
  moveFacts: DerivedMoveFacts,
  opportunities: Array<{ conceptId?: string | null }>,
  plans: ReturnType<typeof recognizeStrategicPlans>,
): string | null {
  for (const conceptId of FOCUS_CONCEPT_PRIORITY) {
    if (moveFacts.conceptIds.includes(conceptId)) return conceptId;
  }
  const fromOpportunity = opportunities.find((opportunity) => opportunity.conceptId)?.conceptId ?? null;
  if (fromOpportunity) return fromOpportunity;
  const fromPlans = plans.plans.find((plan) => plan.conceptId)?.conceptId ?? null;
  return fromPlans ?? null;
}

function buildTraceTimeline(featureTrace: Stage2FeatureTrace, selectedOpportunity: Stage2FeatureTraceRankedOpportunity | null): Stage2FeatureTraceTimelineEntry[] {
  return [
    {
      stage: "detected",
      frameId: featureTrace.frameId,
      details: {
        fen4: featureTrace.fen4,
        openingId: featureTrace.openingId,
        lineId: featureTrace.lineId,
        frameKind: featureTrace.frameKind,
        detectedFeatureIds: featureTrace.detectedFeatures.map((feature) => feature.id),
        detectedConceptIds: featureTrace.detectedConcepts.map((concept) => concept.id),
        selectedFeatureIds: featureTrace.selectedFeatureIds,
        selectedConceptId: featureTrace.selectedConceptId,
      },
    },
    {
      stage: "ranked",
      frameId: featureTrace.frameId,
      details: {
        rankedOpportunityIds: featureTrace.rankedOpportunities.map((opportunity) => opportunity.id),
        selectedOpportunityId: selectedOpportunity?.id ?? null,
        rejectedOpportunityIds: featureTrace.rankedOpportunities.filter((opportunity) => !opportunity.selected).map((opportunity) => opportunity.id),
      },
    },
    {
      stage: "rendered",
      frameId: featureTrace.frameId,
      details: {
        coachCardAuthority: featureTrace.coachCardResult.renderedCopyAuthority,
        coachCardFallbackUsed: featureTrace.coachCardResult.fallbackUsed,
        approvedContentMatched: featureTrace.approvedContentMatched,
        approvedPacketKind: featureTrace.approvedPacketKind,
        visualSource: featureTrace.visualSource,
        visualResult: featureTrace.visualResult,
        visualRecipeRendered: featureTrace.visualRecipeResult.rendered,
        traceStatus: featureTrace.traceStatus,
        missingReasons: featureTrace.missingReasons,
        reviewCandidateEventEligible: featureTrace.reviewCandidateEventEligible,
      },
    },
  ];
}

function buildPseudoFrame(input: FeatureTraceInput, moveFacts: DerivedMoveFacts): CurrentInstructionFrame {
  const fen = normalizeText(input.fen);
  const sideToMoveColor = String(fen.split(" ")[1] ?? "w") === "b" ? "b" : "w";
  const sideToMoveBlundrColor = sideToMoveColor === "b" ? "black" : "white";
  return {
    frameKey: `feature-trace:${String(input.trainerFrameId ?? input.frameId ?? "unknown")}`,
    kind: "guided_move" as const,
    fenBefore: fen,
    fenAfterTarget: fen,
    ply: Number(input.ply ?? input.trainerFrameId ?? 0) || 0,
    sideToMove: sideToMoveBlundrColor,
    target: moveFacts.moveUci
      ? {
          kind: "guided_move",
          uci: moveFacts.moveUci,
          san: moveFacts.moveSan ?? moveFacts.moveUci,
          from: moveFacts.from ?? moveFacts.moveUci.slice(0, 2),
          to: moveFacts.to ?? moveFacts.moveUci.slice(2, 4),
          color: sideToMoveColor,
          blundrColor: sideToMoveBlundrColor,
          pieceType: moveFacts.pieceType ?? "p",
          flags: {
            isCapture: moveFacts.isCapture,
          isCheck: moveFacts.isCheck,
          isCheckmate: false,
          isCastle: moveFacts.isCastle,
          isPromotion: moveFacts.isPromotion,
          isEnPassant: false,
          },
          provenance: {
            source: "opening_tree",
            reason: "feature_trace",
            confidence: "locked",
          },
          capture: moveFacts.isCapture,
          check: moveFacts.isCheck,
          mate: false,
          isCapture: moveFacts.isCapture,
          isCheck: moveFacts.isCheck,
          isMate: false,
          isCheckmate: false,
          isPromotion: false,
          isDevelopment: moveFacts.isMinorPieceDevelopment,
          isDiagonalMove: false,
          isKingSafetyMove: moveFacts.isKingSafetyMove,
          isCentralPawnAdvance: moveFacts.isCentralPawnAdvance,
          isCastle: moveFacts.isCastle,
          isEnPassant: false,
          promotionPiece: moveFacts.promotionPiece,
          fenBefore: fen,
        }
      : null,
    mode: "guided",
    source: "opening_tree",
    debug: {
      issues: [],
      targetSignature: null,
      createdAt: new Date().toISOString(),
    },
    frameId: input.trainerFrameId ?? input.frameId ?? "unknown",
    fen,
    normalizedFen: normalizeVisualFen(fen),
    trainingMode: String(input.trainingMode ?? "restricted"),
    trainerPhase: String(input.trainerPhase ?? "ready_for_user"),
    trainerView: String(input.trainerView ?? "assisted"),
    isUserTurn: Boolean(input.isUserTurn),
    targetSource: "opening_tree",
    nullReason: null,
    invariantKey: `feature-trace:${String(input.trainerFrameId ?? input.frameId ?? "unknown")}`,
    instructionFrameKey: `feature-trace:${String(input.trainerFrameId ?? input.frameId ?? "unknown")}`,
  } as CurrentInstructionFrame;
}

function buildDetectedConcepts(
  moveFacts: DerivedMoveFacts,
  featureClaims: Stage2FeatureTraceDetectedFeature[],
  plans: ReturnType<typeof recognizeStrategicPlans>,
  selectedOpportunity: Stage2FeatureTraceRankedOpportunity | null,
): Stage2FeatureTraceDetectedConcept[] {
  const concepts: Stage2FeatureTraceDetectedConcept[] = [];
  for (const conceptId of moveFacts.conceptIds) {
    const relatedFeatureIds = featureClaims.filter((feature) => feature.conceptId === conceptId).map((feature) => feature.id);
    concepts.push({
      id: conceptId,
      label: conceptId,
      source: "move_fact",
      featureIds: relatedFeatureIds,
      evidence: relatedFeatureIds.length ? relatedFeatureIds : [moveFacts.moveUci ?? conceptId],
    });
  }
  for (const feature of featureClaims) {
    if (!feature.conceptId) continue;
    if (concepts.some((concept) => concept.id === feature.conceptId)) continue;
    concepts.push({
      id: feature.conceptId,
      label: feature.conceptId,
      source: feature.source === "board_feature" ? "board_feature" : "move_fact",
      featureIds: [feature.id],
      evidence: feature.evidence,
    });
  }
  for (const plan of plans.plans) {
    if (!plan.conceptId) continue;
    if (concepts.some((concept) => concept.id === plan.conceptId)) continue;
    concepts.push({
      id: plan.conceptId,
      label: plan.conceptId,
      source: "plan",
      featureIds: plan.relatedFeatures.slice(),
      evidence: plan.evidence.map(String),
    });
  }
  if (selectedOpportunity?.conceptId && !concepts.some((concept) => concept.id === selectedOpportunity.conceptId)) {
    concepts.push({
      id: selectedOpportunity.conceptId,
      label: selectedOpportunity.conceptId,
      source: "selected_opportunity",
      featureIds: selectedOpportunity.id ? [selectedOpportunity.id] : [],
      evidence: [selectedOpportunity.id],
    });
  }
  return dedupeByKey(concepts, (concept) => concept.id);
}

function buildCoachCardResult(
  input: FeatureTraceInput,
  moveFacts: DerivedMoveFacts,
  selectedOpportunity: Stage2FeatureTraceRankedOpportunity | null,
  trainerFrameResolution: TrainerFrameResolution,
): Stage2FeatureTraceCoachCardResult {
  const coachDecision = input.coachDecision ?? {};
  const visibleCoach = input.visibleTeachingSurface?.coach ?? input.presentationFrame?.coach ?? null;
  const selection = selectRenderedCoachCardCopyAuthority({
    trainerPhase: String(input.trainerPhase ?? ""),
    isUserTurn: Boolean(input.isUserTurn),
    visibleSurfaceMode: String(input.visibleTeachingSurface?.mode ?? input.v28VisibleSurface?.mode ?? input.visibleSurfaceMode ?? input.presentationFrame?.coach?.owner ?? "unknown"),
    instructionTargetUci: moveFacts.moveUci,
    surfaceSafetyBlocked: Boolean(input.visibleTeachingSurface?.safety?.blocked ?? false),
    surfaceCopy: {
      title: normalizeText(trainerFrameResolution.coachCard.preAuthority.title ?? visibleCoach?.title ?? input.coachDecision?.title ?? ""),
      body: normalizeText(trainerFrameResolution.coachCard.preAuthority.body ?? visibleCoach?.body ?? input.coachDecision?.body ?? ""),
      bullets: Array.isArray(visibleCoach?.bullets)
        ? visibleCoach.bullets.map(String)
        : Array.isArray(input.visibleTeachingSurface?.coach?.buttons)
          ? input.visibleTeachingSurface.coach.buttons.map(String)
          : [],
    },
    pipelineCopy: {
      title: normalizeText(trainerFrameResolution.coachCard.pipeline.title ?? coachDecision.title ?? ""),
      body: normalizeText(trainerFrameResolution.coachCard.pipeline.body ?? coachDecision.body ?? ""),
      bullets: Array.isArray(coachDecision.buttons) ? coachDecision.buttons.map(String) : [],
    },
    pipelineTargetAligned: input.coachQuality?.targetAligned ?? (moveFacts.moveUci ? (String(input.coachMoveUci ?? coachDecision.debug?.coachSelectedCandidateMove ?? "") === moveFacts.moveUci) : true),
    pipelinePieceAligned: input.coachQuality?.pieceAligned ?? (input.instructionTargetPieceType && input.coachPieceType ? String(input.instructionTargetPieceType) === String(input.coachPieceType) : true),
    pipelineContainsDebugLeak: Boolean(input.coachQuality?.containsDebugLeak),
    pipelinePassedSafety: Array.isArray(coachDecision.debug?.coachSafetyWarnings) ? coachDecision.debug.coachSafetyWarnings.length === 0 : true,
  });

  const fallbackUsed = Boolean(
    input.runtimeSafeFallbackUsed ??
      coachDecision.debug?.verifiedFallbackUsed ??
      coachDecision.debug?.candidateCoachFallbackUsed ??
      input.coachQuality?.usedFallback ??
      input.coachDecision?.debug?.coachDecisionSource === "verified_safe_fallback",
  );
  const fallbackReason = normalizeText(
    input.runtimeSafeFallbackReason ??
      coachDecision.debug?.fallbackReason ??
      input.coachQuality?.fallbackReason ??
      coachDecision.debug?.candidateCoachFallbackReason ??
      "",
  ) || null;

  return {
    preAuthority: trainerFrameResolution.coachCard.preAuthority,
    pipeline: trainerFrameResolution.coachCard.pipeline,
    finalRendered: trainerFrameResolution.coachCard.finalRendered,
    renderedCopyAuthority: selection.renderedCopyAuthority,
    pipelineCopyRejected: selection.pipelineCopyRejected,
    pipelineCopyRejectedReason: selection.pipelineCopyRejectedReason,
    fallbackUsed,
    fallbackReason,
    visibleCoachOwner: String(input.visibleTeachingSurface?.owner ?? input.presentationFrame?.coach?.owner ?? "none") || null,
    visibleTitle: trainerFrameResolution.coachCard.finalRendered.title,
    visibleBody: trainerFrameResolution.coachCard.finalRendered.body,
    visibleButtons: trainerFrameResolution.coachCard.finalRendered.buttons,
    moveUci: moveFacts.moveUci,
    moveSan: moveFacts.moveSan,
    targetMatchesMoveUci: moveFacts.moveUci ? (String(input.coachMoveUci ?? input.instructionTargetUci ?? input.expectedMoveUci ?? "") === moveFacts.moveUci) : "unknown",
    targetMatchesMoveSan: moveFacts.moveSan ? (normalizeText(input.expectedMoveSan ?? input.instructionTargetSan ?? input.coachDecision?.debug?.coachSelectedCandidateMove ?? "") === moveFacts.moveSan) : "unknown",
    finalRenderedTitle: trainerFrameResolution.coachCard.finalRendered.title,
    finalRenderedBody: trainerFrameResolution.coachCard.finalRendered.body,
  };
}

function buildVisualRecipeResult(input: FeatureTraceInput, moveFacts: DerivedMoveFacts, trainerFrameResolution: TrainerFrameResolution): Stage2FeatureTraceVisualRecipeResult {
  const visualRecipe = input.visualRecipe ?? null;
  const visualRecipeOverlay = input.visualRecipeOverlay ?? null;
  const visualTruth = trainerFrameResolution.visualResult ?? deriveVisualTruthFallback(input, trainerFrameResolution);
  const rendered = visualTruth.rendered;
  const targetMatchesMoveUci = visualTruth.targetMatchesInstruction === "not_applicable"
    ? "unknown"
    : visualTruth.targetMatchesInstruction;

  return {
    authority: visualTruth.visualSource,
    approvedRecipeRendered: visualTruth.approvedRecipeMatched,
    generatedRecipeRendered: visualTruth.generatedRecipeRendered,
    fallbackCurrentSurfaceRendered: visualTruth.fallbackSurfaceVisualsRendered,
    noVisualsRendered: trainerFrameResolution.visual.noVisualsRendered,
    rendered,
    recipeId: visualTruth.approvedRecipeId ?? trainerFrameResolution.visual.recipeId,
    patternId: trainerFrameResolution.visual.patternId,
    moveUci: visualTruth.finalVisualTargetUci ?? normalizeUci(input.visualRecipeMoveUci ?? visualRecipe?.moveUci ?? input.visualMoveUci) ?? null,
    moveSan: visualTruth.finalVisualTargetSan ?? (normalizeText(input.visualRecipeMoveSan ?? visualRecipe?.moveSan ?? "") || null),
    targetMatchesMoveUci,
    blockedByTargetMismatch: Boolean(input.visualRecipeBlockedByTargetMismatch),
    adapterAllowed: typeof visualRecipeOverlay?.adapterAllowed === "boolean" ? Boolean(visualRecipeOverlay.adapterAllowed) : null,
    adapterSuppressedReason: normalizeText(visualRecipeOverlay?.adapterSuppressedReason ?? input.overlaySuppressedReason ?? "") || null,
    primitiveIds: Array.isArray(input.visualRecipePrimitiveIds) ? input.visualRecipePrimitiveIds.map(String) : Array.isArray(visualRecipe?.beats) ? visualRecipe.beats.flatMap((beat: any) => beat.primitives.map((primitive: any) => String(primitive.id))) : [],
    source: String(input.presentationFrame?.visual?.source ?? input.overlaySource ?? visualTruth.visualSource ?? "none") || null,
  };
}

function deriveVisualTruthFallback(input: FeatureTraceInput, trainerFrameResolution: TrainerFrameResolution): TrainerFrameVisualResult {
  const sourceRuntimeMoveUci = normalizeText(
    input.stage2ApprovedPacketSourceRuntimeMoveUci ??
      input.approvedPacketSourceRuntimeUci ??
      trainerFrameResolution.approvedContent.sourceRuntimeMoveUci ??
      input.visualRecipe?.sourceRuntimeMoveUci ??
      null,
  );
  const finalVisualTargetUci = normalizeText(
    trainerFrameResolution.visual.targetMoveUci ??
      input.instructionTargetUci ??
      input.visualRecipeMoveUci ??
      input.visualMoveUci ??
      null,
  );
  const finalVisualTargetSan = normalizeText(input.instructionTargetSan ?? input.visualRecipeMoveSan ?? input.visualRecipe?.moveSan ?? null);
  const visualSource = trainerFrameResolution.visual.authority;
  const plainViewSuppressed =
    String(input.trainerView ?? "").toLowerCase() === "plain" &&
    !Boolean(input.showMoreShown ?? input.showMoreRevealed ?? false);
  const rendered = trainerFrameResolution.visual.authority !== "none" && !plainViewSuppressed && input.presentationFrame?.visual?.shouldRender !== false;
  const approvedRecipeMatched =
    visualSource === "approved_recipe" &&
    Boolean(trainerFrameResolution.visual.recipeId) &&
    Boolean(finalVisualTargetUci) &&
    normalizeText(trainerFrameResolution.visual.targetMoveUci ?? null) === finalVisualTargetUci;
  const normalizedSourceRuntimeMoveUci = sourceRuntimeMoveUci?.toLowerCase() ?? null;
  const castlingNormalized = normalizedSourceRuntimeMoveUci
    ? (
        normalizedSourceRuntimeMoveUci === "e1h1" ? normalizeText(finalVisualTargetUci) === "e1g1" :
        normalizedSourceRuntimeMoveUci === "e8h8" ? normalizeText(finalVisualTargetUci) === "e8g8" :
        normalizedSourceRuntimeMoveUci === "e1c1" ? normalizeText(finalVisualTargetUci) === "e1c1" :
        normalizedSourceRuntimeMoveUci === "e8c8" ? normalizeText(finalVisualTargetUci) === "e8c8" :
        "not_applicable"
      )
    : "not_applicable";

  return {
    rendered,
    visualSource,
    finalVisualTargetUci,
    finalVisualTargetSan,
    approvedRecipeMatched,
    approvedRecipeId: trainerFrameResolution.visual.recipeId ?? null,
    approvedRecipeTargetMoveUci: trainerFrameResolution.visual.targetMoveUci ?? null,
    generatedRecipeRendered: trainerFrameResolution.visual.generatedRecipeRendered,
    fallbackSurfaceVisualsRendered: trainerFrameResolution.visual.fallbackCurrentSurfaceRendered,
    primitiveCount: trainerFrameResolution.visual.renderedPrimitiveCount,
    sourceSquare: finalVisualTargetUci ? finalVisualTargetUci.slice(0, 2) : null,
    destinationSquare: finalVisualTargetUci ? finalVisualTargetUci.slice(2, 4) : null,
    targetMatchesInstruction: finalVisualTargetUci && input.instructionTargetUci ? finalVisualTargetUci === normalizeText(input.instructionTargetUci) : "not_applicable",
    targetMatchesCoachCard: finalVisualTargetUci && normalizeText(input.coachMoveUci ?? input.displayedCoachDecision?.debug?.coachMoveUci ?? null)
      ? finalVisualTargetUci === normalizeText(input.coachMoveUci ?? input.displayedCoachDecision?.debug?.coachMoveUci ?? null)
      : "not_applicable",
    plainViewSuppressed,
    castlingNormalized,
    sourceRuntimeMoveUci,
    missingReasons: [
      ...(plainViewSuppressed ? ["plain_view_suppressed"] : []),
      ...(rendered ? [] : ["no_visuals_rendered"]),
      ...(approvedRecipeMatched ? [] : (visualSource === "approved_recipe" ? ["approved_recipe_target_mismatch"] : [])),
    ],
    warnings: [],
  };
}

function determineTraceStatus(
  input: FeatureTraceInput,
  trace: Pick<Stage2FeatureTrace, "detectedFeatures" | "rankedOpportunities" | "selectedOpportunity">,
  resolutionKind: string,
  reasons: Stage2FeatureTraceMissingReason[],
): Stage2FeatureTrace["traceStatus"] {
  if (!Boolean(input.trainerPhase === "ready_for_user" && input.isUserTurn)) return "missing";
  if (!trace.detectedFeatures.length) return "missing";
  if (!trace.selectedOpportunity || !trace.rankedOpportunities.length) return "missing";
  if (reasons.includes("approved_content_disabled") || reasons.includes("visual_recipe_not_connected") || reasons.includes("coachcard_fallback_used") || reasons.includes("legacy_surface_used")) {
    return "partial";
  }
  if (resolutionKind !== "approved_packet") return "partial";
  return "complete";
}

export function buildStage2FeatureTrace(input: FeatureTraceInput): Stage2FeatureTraceBundle {
  const frameId = input.trainerFrameId ?? input.frameId ?? input.debugFrameId ?? null;
  const fen4 = normalizeVisualFen(String(input.fen ?? ""));
  const openingId = normalizeText(input.selectedOpeningId ?? input.openingId ?? input.repertoireId ?? "") || null;
  const lineId = normalizeText(input.selectedLineId ?? input.lineId ?? input.activeLineId ?? "") || null;
  const trainerFrameResolution = (input.trainerFrameResolution as TrainerFrameResolution | undefined) ?? buildTrainerFrameResolution(input);
  const frameKind = deriveFrameKind(input, trainerFrameResolution);
  const playKeyBefore = normalizeTextOrNull(input.playKeyBefore ?? input.runtimeBookPlayKeyBefore ?? input.continuation?.runtimeBookPlayKeyBefore ?? null);
  const playKey = normalizeTextOrNull(input.playKey ?? input.currentPlayKey ?? input.runtimeBookPlayKey ?? null);
  const moveFacts = buildDerivedMoveFacts(input);
  const features = extractAdvancedFeatures(String(input.fen ?? ""));
  const pseudoFrame = buildPseudoFrame(input, moveFacts);
  const evidenceGraph = buildEvidenceGraph({
    frame: pseudoFrame,
    openingKey: openingId ?? undefined,
    lineKey: lineId ?? undefined,
    branchComplete: Boolean(input.visibleTeachingSurface?.mode === "branch_complete" || input.presentationFrame?.coach?.owner === "branch_transition_surface"),
    continuationEligible: String(input.trainingMode ?? "") === "continuation",
  });
  const plans = recognizeStrategicPlans({
    fen: String(input.fen ?? ""),
    features,
    openingId: openingId ?? undefined,
    conceptId: input.selectedConceptId ?? moveFacts.conceptIds[0] ?? undefined,
    moveUci: moveFacts.moveUci ?? undefined,
    moveSan: moveFacts.moveSan ?? undefined,
  });

  const boardFeatureClaims = [
    ...features.featureClaims.map((claim) => toFeatureClaimRecord(claim, "board_feature")),
    ...evidenceGraph.deterministicClaims.map((claim) => toFeatureClaimRecord(claim, "evidence_graph")),
  ];
  const detectedFeatures = dedupeByKey([...boardFeatureClaims, ...moveFacts.featureClaims], (feature) => feature.id);

  const traceConceptId = pickConceptId(moveFacts, detectedFeatures, plans);
  const traceOpportunities = buildTraceOpportunities({
    moveFacts,
    features,
    plans,
    trainerView: String(input.trainerView ?? "assisted"),
    visualRecipeId: normalizeText(input.visualRecipe?.visualRecipeId ?? input.visualRecipe?.id ?? ""),
    conceptId: traceConceptId,
    expectedMoveUci: moveFacts.moveUci,
    expectedMoveSan: moveFacts.moveSan,
  });
  const scoredOpportunities = traceOpportunities.map(scoreOpportunity).filter((opportunity) => opportunity.canRender);
  scoredOpportunities.sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    if (b.visualAlignmentScore !== a.visualAlignmentScore) return b.visualAlignmentScore - a.visualAlignmentScore;
    if (b.specificityScore !== a.specificityScore) return b.specificityScore - a.specificityScore;
    if (b.planCoherenceScore !== a.planCoherenceScore) return b.planCoherenceScore - a.planCoherenceScore;
    if (b.repertoireRelevance !== a.repertoireRelevance) return b.repertoireRelevance - a.repertoireRelevance;
    if (a.repetitionPenalty !== b.repetitionPenalty) return a.repetitionPenalty - b.repetitionPenalty;
    return a.id.localeCompare(b.id);
  });

  const rankedOpportunities = scoredOpportunities.map((opportunity, index) =>
    summarizeRankedOpportunity(opportunity, index + 1, index === 0),
  );
  const selectedOpportunity = rankedOpportunities[0] ?? null;
  const selectedConceptId = selectedOpportunity?.conceptId ?? traceConceptId;
  const selectedTheme = normalizeTextOrNull(input.coachDecision?.debug?.selectedTheme ?? input.coachQuality?.selectedTheme ?? input.selectedTheme ?? selectedConceptId ?? null);
  const selectedFeatureIds = dedupeByKey(
    detectedFeatures
      .filter((feature) => feature.conceptId != null && feature.conceptId === selectedConceptId)
      .map((feature) => feature.id),
    (value) => value,
  );

  const detectedConcepts = buildDetectedConcepts(moveFacts, detectedFeatures, plans, selectedOpportunity);

  const coachCardResult = buildCoachCardResult(input, moveFacts, selectedOpportunity, trainerFrameResolution);
  const visualRecipeResult = buildVisualRecipeResult(input, moveFacts, trainerFrameResolution);
  const visualResult = trainerFrameResolution.visualResult ?? deriveVisualTruthFallback(input, trainerFrameResolution);
  const terminalProof = trainerFrameResolution.terminalProof ?? null;
  const finalSurfaceAuthority = trainerFrameResolution.finalSurfaceAuthority ?? null;
  const approvedPacketResolution = trainerFrameResolution.approvedContent ?? {
    matched: false,
    packetKind: "none",
    packetId: null,
    sourceBundle: null,
    sourceFile: null,
    packetStatus: null,
    approvalReadiness: null,
    missReason: null,
    fallbackReason: coachCardResult.fallbackReason ?? null,
    visualSource: visualRecipeResult.source,
  };
  const approvedContentMatched = Boolean(approvedPacketResolution.matched);
  const fallbackUsed = Boolean(coachCardResult.fallbackUsed);
  const fallbackReason = normalizeTextOrNull(coachCardResult.fallbackReason ?? approvedPacketResolution.fallbackReason ?? null);
  const coachCardSource = deriveCoachCardSource(trainerFrameResolution, approvedContentMatched, fallbackUsed);
  const copyAuthority = trainerFrameResolution.coachCard.finalRendered.authority ?? null;
  const visualSource = visualResult.visualSource;
  const visualRecipeId = trainerFrameResolution.visual.recipeId;
  const visualTargetUci = visualResult.finalVisualTargetUci;
  const visualFallbackUsed = visualResult.visualSource === "fallback_current_surface";
  const targetMatchesCoachCard = coachCardResult.targetMatchesMoveUci;
  const targetMatchesVisual = visualResult.targetMatchesInstruction === "not_applicable"
    ? "unknown"
    : visualResult.targetMatchesInstruction;
  const plainViewLeakSafe = derivePlainViewLeakSafe(input, coachCardResult, moveFacts);
  const reviewCandidateEventEligible = Boolean(
    frameKind === "instructional_user_turn" ||
    frameKind === "continuation_user_turn",
  ) &&
    approvedContentMatched &&
    !fallbackUsed &&
    plainViewLeakSafe &&
    targetMatchesCoachCard === true &&
    targetMatchesVisual === true &&
    detectedFeatures.length > 0 &&
    selectedOpportunity != null;
  const reviewCandidateEventPreview = deriveReviewCandidateEventPreview({
    openingId,
    lineId,
    fen4,
    moveFacts,
    selectedTheme,
    selectedOpportunity,
    frameKind,
    showMoreShown: Boolean(input.showMoreShown ?? input.showMoreRevealed ?? false),
    coachCardSource,
    visualRecipeResult,
    plainViewLeakSafe,
    approvedContentMatched,
    fallbackUsed,
    traceStatus: reviewCandidateEventEligible ? "complete" : "partial",
  });

  const stage2Context = buildStage2CoachContext({
    openingId: openingId ?? undefined,
    playKeyBefore: playKeyBefore ?? undefined,
    playKey: playKey ?? undefined,
    learnerSide: getStage2OpeningAvailability(openingId ?? "")?.learnerPerspective ?? undefined,
    sideToMove: fen4.split(" ")[1] === "b" ? "black" : "white",
    targetUci: moveFacts.moveUci ?? undefined,
    targetSan: moveFacts.moveSan ?? undefined,
    targetPieceType: moveFacts.pieceType ?? undefined,
    surface: mapVisibleSurfaceModeToStage2CoachingSurface(String(input.visibleTeachingSurface?.mode ?? input.presentationFrame?.coach?.owner ?? "debug_only")),
    runtimeBook: {
      status: normalizeText(input.runtimeBookStatus ?? input.continuation?.runtimeBookStatus ?? "") || undefined,
      candidateCount: Number.isFinite(Number(input.runtimeBookCandidateCount ?? input.continuation?.runtimeBookCandidateCount ?? Number.NaN))
        ? Number(input.runtimeBookCandidateCount ?? input.continuation?.runtimeBookCandidateCount)
        : undefined,
      topCandidateUci: normalizeText(input.runtimeBookTopCandidateUci ?? input.continuation?.runtimeBookTopCandidateUci ?? "") || undefined,
      topCandidateSan: normalizeText(input.runtimeBookTopCandidateSan ?? input.continuation?.runtimeBookTopCandidateSan ?? "") || undefined,
      topCandidateRank: Number.isFinite(Number(input.runtimeBookTopCandidateRank ?? input.continuation?.runtimeBookTopCandidateRank ?? Number.NaN))
        ? Number(input.runtimeBookTopCandidateRank ?? input.continuation?.runtimeBookTopCandidateRank)
        : undefined,
      topCandidateTotalGames: Number.isFinite(Number(input.runtimeBookTopCandidateGames ?? input.runtimeBookTopCandidateTotalGames ?? input.continuation?.runtimeBookTopCandidateGames ?? Number.NaN))
        ? Number(input.runtimeBookTopCandidateGames ?? input.runtimeBookTopCandidateTotalGames ?? input.continuation?.runtimeBookTopCandidateGames)
        : undefined,
      bookExhausted: Boolean(input.runtimeBookBookExhausted ?? input.continuation?.runtimeBookBookExhausted ?? false),
    },
    plainRevealState:
      String(input.visibleTeachingSurface?.mode ?? "") === "plain_before_show_more"
        ? ((input.showMoreShown ?? input.showMoreRevealed) ? "show_more" : "hidden")
        : String(input.visibleTeachingSurface?.mode ?? "") === "plain_after_show_more"
          ? "show_more"
          : "revealed",
  });
  const stage2Resolution = resolveStage2CoachingPacket(stage2Context);
  const promotionSource = (input.trainerFrameResolution as TrainerFrameResolution | undefined)?.promotion;
  const promotion: Stage2FeatureTrace["promotion"] = {
    pendingPromotion: (promotionSource?.pendingPromotion ?? input.pendingPromotion ?? null) as Record<string, unknown> | null,
    promotionPickerRendered: Boolean(promotionSource?.promotionPickerRendered ?? input.promotionPickerRendered),
    promotionOptions: Array.isArray(promotionSource?.promotionOptions)
      ? promotionSource.promotionOptions.map(String)
      : Array.isArray(input.promotionOptions) ? input.promotionOptions.map(String) : [],
    selectedPromotionPiece: normalizeText(promotionSource?.selectedPromotionPiece ?? input.selectedPromotionPiece ?? "") || null,
    attemptedPromotionUci: normalizeText(promotionSource?.attemptedPromotionUci ?? input.attemptedPromotionUci ?? "") || null,
    acceptedPromotionUci: normalizeText(promotionSource?.acceptedPromotionUci ?? input.acceptedPromotionUci ?? "") || null,
    acceptedTargetUci: normalizeText(promotionSource?.acceptedTargetUci ?? input.acceptedTargetUci ?? input.acceptedPromotionUci ?? moveFacts.moveUci ?? "") || null,
    promotionAuthorityMatched: typeof (promotionSource?.promotionAuthorityMatched ?? input.promotionAuthorityMatched) === "boolean"
      ? Boolean(promotionSource?.promotionAuthorityMatched ?? input.promotionAuthorityMatched)
      : null,
    promotionAuthorityMismatchReason: normalizeText(promotionSource?.promotionAuthorityMismatchReason ?? input.promotionAuthorityMismatchReason ?? "") || null,
    promotionAuthorityTargetUci: normalizeText(promotionSource?.promotionAuthorityTargetUci ?? input.promotionAuthorityTargetUci ?? "") || null,
  };
  const acceptedTargetUci = normalizeText((input.trainerFrameResolution as TrainerFrameResolution | undefined)?.acceptedTargetUci ?? input.acceptedTargetUci ?? input.acceptedPromotionUci ?? moveFacts.moveUci ?? "") || null;
  const targetUci = moveFacts.moveUci;
  const targetSan = moveFacts.moveSan;
  const targetSource = normalizeTextOrNull(input.instructionTargetSource ?? input.currentInstructionFrame?.targetSource ?? input.expectedMoveResolution?.source ?? input.coachDecision?.debug?.coachDecisionSource ?? null);
  const criticalIssues = normalizeStringArray(input.criticalIssues ?? input.health?.criticalIssues);
  const warnings = normalizeStringArray(input.warnings ?? input.health?.warnings);
  const providerWarnings = resolveStage2ProviderWarnings({
    runtimeDataSource: input.runtimeDataSource ?? "local_crawled_package",
    liveLichessCalled: input.liveLichessCalled ?? false,
    runtimeAvailable: input.runtimeAvailable ?? input.selectedOpeningRuntimeAvailable ?? true,
    selectedOpeningRuntimeAvailable: input.selectedOpeningRuntimeAvailable ?? true,
    selectedOpeningContentStatus: input.selectedOpeningContentStatus ?? null,
    selectedOpeningApprovedContentAvailable: input.selectedOpeningApprovedContentAvailable ?? null,
    trainingMode: input.trainingMode ?? null,
    trainerPhase: input.trainerPhase ?? null,
    isUserTurn: input.isUserTurn ?? null,
    visibleSurfaceMode: String(input.visibleTeachingSurface?.mode ?? input.visibleSurfaceMode ?? input.presentationFrame?.coach?.owner ?? ""),
    stockfishProviderStatus: input.stockfishProviderStatus ?? null,
    stockfishValidationStatus: input.stockfishValidationStatus ?? null,
    stockfishValidationAvailable: input.stockfishValidationAvailable ?? null,
    maiaProviderStatus: input.maiaProviderStatus ?? null,
    maiaRuntimeStatus: input.maiaRuntimeStatus ?? null,
    maiaAllowedThisFrame: input.maiaAllowedThisFrame ?? null,
    maiaFallbackUsed: input.maiaFallbackUsed ?? null,
    maiaFallbackReason: input.maiaFallbackReason ?? null,
    stage2ApprovedContentEnabled: input.stage2ApprovedContentEnabled ?? null,
    stage2SafeFallbackEnabled: input.stage2SafeFallbackEnabled ?? null,
    approvedContentMatched,
    approvedPacketKind: approvedPacketResolution.packetKind,
    approvedPacketFallbackReason: approvedPacketResolution.fallbackReason,
    approvedPacketMissReason: approvedPacketResolution.missReason,
    stage2CoachingPacketKind: stage2Resolution.kind === "approved_packet" ? "approved_packet" : stage2Resolution.kind === "safe_fallback" ? "safe_fallback" : "none",
    stage2CoachingSafetyStatus: stage2Resolution.kind === "approved_packet" ? stage2Resolution.packet.safetyStatus : stage2Resolution.kind === "safe_fallback" ? stage2Resolution.packet.safetyStatus : null,
    stage2CoachingRuntimeMatched: stage2Resolution.kind === "approved_packet" ? stage2Resolution.packet.runtimeReconciliation.status === "matched" : stage2Resolution.kind === "safe_fallback" ? stage2Resolution.packet.runtimeReconciliation.status === "matched" : null,
    stage2CoachingResolverEnabled: input.stage2CoachingResolverEnabled ?? null,
    runtimeSafeFallbackUsed: fallbackUsed,
    runtimeSafeFallbackReason: fallbackReason,
    candidateSource: input.candidateSource ?? null,
  });
  const providerWarningSummary = summarizeStage2ProviderWarnings(providerWarnings);

  const missingReasons: Stage2FeatureTraceMissingReason[] = [];
  const instructionalFrame = Boolean(input.trainerPhase === "ready_for_user" && input.isUserTurn === true);

  if (!instructionalFrame) missingReasons.push("not_instructional_frame");
  if (!detectedFeatures.length) missingReasons.push("no_detected_features");
  if (!detectedConcepts.length) missingReasons.push("no_selected_concept");
  if (!rankedOpportunities.length) missingReasons.push("no_ranked_opportunities");
  if (rankedOpportunities.length === 1 && rankedOpportunities[0]?.layer === "fallback") missingReasons.push("no_ranked_opportunities");
  if (!STAGE2_APPROVED_CONTENT_ENABLED) {
    missingReasons.push("approved_content_disabled");
  } else if (!approvedContentMatched && stage2Resolution.kind !== "approved_packet") {
    missingReasons.push("approved_content_not_matched");
  }
  if (visualRecipeResult.rendered !== true || visualRecipeResult.targetMatchesMoveUci !== true) missingReasons.push("visual_recipe_not_connected");
  if (coachCardResult.fallbackUsed) missingReasons.push("coachcard_fallback_used");
  if (
    Boolean(input.legacyTrainingCardActuallyRendered) ||
    Boolean(input.legacyAnswerCardActuallyRendered) ||
    Boolean(input.legacyMoveImpactActuallyRendered) ||
    Boolean(input.legacyNextTextActuallyRendered)
  ) {
    missingReasons.push("legacy_surface_used");
  }
  if (!STAGE2_COACHING_RESOLVER_ENABLED || !STAGE2_SAFE_FALLBACK_ENABLED || stage2Resolution.kind === "none") {
    missingReasons.push("stage2_resolution_unavailable");
  }

  const featureTrace: Stage2FeatureTrace = {
    frameId,
    frameKind,
    fen4,
    openingId,
    lineId,
    playKeyBefore,
    playKey,
    moveUci: moveFacts.moveUci,
    moveSan: moveFacts.moveSan,
    targetUci,
    targetSan,
    targetSource,
    acceptedTargetUci,
    approvedPacket: approvedPacketResolution,
    boardFacts: {
      ...moveFacts.boardFacts,
      sideToMove: fen4.split(" ")[1] ?? null,
      openingId,
      lineId,
      frameId,
      playKeyBefore,
      playKey,
      targetUci,
      targetSan,
      targetSource,
      featureClaimsCount: detectedFeatures.length,
      featureDetectorContributed: detectedFeatures.length > 0,
      selectedFeatureIds,
      selectedConceptId,
      selectedTheme,
      evidenceGraph: {
        claimsCount: evidenceGraph.claims.length,
        deterministicClaimsCount: evidenceGraph.deterministicClaims.length,
        blockedClaimsCount: evidenceGraph.blockedClaims.length,
        contradictionCount: evidenceGraph.contradictions.length,
        targetLegal: evidenceGraph.boardTruth.targetLegal,
      },
      boardTruth: {
        normalizedFen: evidenceGraph.boardTruth.normalizedFen,
        targetLegal: evidenceGraph.boardTruth.targetLegal,
        sourcePiece: evidenceGraph.boardTruth.sourcePiece,
        destinationOccupancy: evidenceGraph.boardTruth.destinationOccupancy,
        inCheck: evidenceGraph.boardTruth.inCheck,
      },
      stage2ResolutionKind: stage2Resolution.kind,
      stage2ResolutionReason: stage2Resolution.kind === "none" ? stage2Resolution.reason : "approved_or_fallback",
    },
    detectedFeatures,
    detectedConcepts,
    featureDetectorContributed: detectedFeatures.length > 0,
    selectedFeatureIds,
    selectedConceptId,
    selectedTheme,
    rankedOpportunities,
    selectedOpportunity,
    coachCardResult,
    visualResult,
    terminalProof,
    finalSurfaceAuthority,
    approvedContentMatched,
    approvedPacketId: approvedPacketResolution.packetId,
    approvedPacketKind: approvedPacketResolution.packetKind,
    approvedPacketSourceBundle: approvedPacketResolution.sourceBundle,
    approvedPacketMissReason: approvedPacketResolution.missReason,
    approvedPacketFallbackReason: approvedPacketResolution.fallbackReason,
    coachCardSource,
    copyAuthority,
    visualRecipeResult,
    visualSource,
    visualRecipeId,
    visualTargetUci,
    visualFallbackUsed,
    targetMatchesCoachCard,
    targetMatchesVisual,
    plainViewLeakSafe,
    promotion,
    finalRenderedTitle: coachCardResult.finalRenderedTitle,
    finalRenderedBody: coachCardResult.finalRenderedBody,
    providerWarnings,
    providerWarningSummary,
    traceStatus: determineTraceStatus(input, {
      frameId,
      fen4,
      openingId,
      lineId,
      moveUci: moveFacts.moveUci,
      moveSan: moveFacts.moveSan,
      acceptedTargetUci,
      boardFacts: {},
      detectedFeatures,
      detectedConcepts,
      rankedOpportunities,
      selectedOpportunity,
      coachCardResult,
      visualRecipeResult,
      approvedPacket: approvedPacketResolution,
      promotion,
      finalRenderedTitle: coachCardResult.finalRenderedTitle,
      finalRenderedBody: coachCardResult.finalRenderedBody,
      traceStatus: "partial",
      missingReasons,
    } as any, stage2Resolution.kind, missingReasons),
    missingReasons: dedupeByKey(missingReasons, (reason) => reason),
    reviewCandidateEventEligible,
    reviewCandidateEventPreview,
    warnings,
    criticalIssues,
  };

  const timeline = buildTraceTimeline(featureTrace, selectedOpportunity);

  return {
    featureTrace,
    featureTraceTimeline: timeline,
  };
}
