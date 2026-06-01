import type { AdvancedFeaturePacket } from "../features/advancedFeatureTypes";
import type { TeachingOpportunity } from "../opportunity/opportunityTypes";
import type { RecognizedPlan, StrategicPlanPacket } from "../plans/planTypes";
import type { VerifiedMoveFacts } from "../runtime/currentInstructionFrame";

function includesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

function pieceNameFromType(pieceType: string): string {
  return pieceType === "p" ? "pawn" : pieceType === "n" ? "knight" : pieceType === "b" ? "bishop" : pieceType === "r" ? "rook" : pieceType === "q" ? "queen" : "king";
}

function hasFeature(input: { features: AdvancedFeaturePacket; plans: StrategicPlanPacket; plan?: RecognizedPlan; tokens: string[] }): boolean {
  const featureTypes = new Set<string>(input.features.featureClaims.map((claim) => claim.type));
  const planTypes = new Set<string>(input.plans.plans.map((plan) => plan.type));
  for (const token of input.tokens) {
    if (featureTypes.has(token) || planTypes.has(token)) return true;
  }
  if (input.plan && input.tokens.some((token) => input.plan?.type === token)) return true;
  return false;
}

export function validateRenderedCoachClaims(input: {
  body: string;
  moveFacts: VerifiedMoveFacts | null;
  features: AdvancedFeaturePacket;
  plans: StrategicPlanPacket;
  selectedPlan?: RecognizedPlan;
  selectedOpportunity?: TeachingOpportunity;
  selectedTemplateId?: string;
}): { allowed: boolean; verifiedClaims: string[]; unverifiedClaims: string[] } {
  const text = input.body.toLowerCase();
  const verifiedClaims: string[] = [];
  const unverifiedClaims: string[] = [];

  const move = input.moveFacts;

  const pieceRules: Array<{ word: string; type: VerifiedMoveFacts["pieceType"] }> = [
    { word: "bishop", type: "b" },
    { word: "knight", type: "n" },
    { word: "rook", type: "r" },
    { word: "queen", type: "q" },
    { word: "king", type: "k" },
    { word: "pawn", type: "p" },
  ];

  for (const rule of pieceRules) {
    if (!new RegExp(`\\b${rule.word}\\b`).test(text)) continue;
    if (move && move.pieceType === rule.type) verifiedClaims.push(`piece:${rule.word}`);
    else unverifiedClaims.push(`unverified_piece_claim:${rule.word}`);
  }

  if (/\bdevelops?\b|\bdevelopment\b/.test(text)) {
    if (move?.isDevelopment) verifiedClaims.push("development");
    else unverifiedClaims.push("unverified_development_claim");
  }

  if (/\bdiagonal\b/.test(text) || includesAny(text, [/active diagonal/])) {
    const allowed = Boolean(move && (move.pieceType === "b" || move.pieceType === "q") && move.isDiagonalMove);
    if (allowed) verifiedClaims.push("diagonal");
    else unverifiedClaims.push("unverified_diagonal_claim");
  }

  if (/\bfile\b|\brank\b/.test(text)) {
    const allowed = Boolean(move && (move.pieceType === "r" || move.pieceType === "q" || move.isFileMove));
    if (allowed) verifiedClaims.push("file_or_rank");
    else unverifiedClaims.push("unverified_file_rank_claim");
  }

  if (/\bcenter\b|\bcentral\b|center tension/.test(text)) {
    const allowed = move?.isCentralPawnAdvance || hasFeature({ features: input.features, plans: input.plans, plan: input.selectedPlan, tokens: ["center_tension", "maintain_center_tension", "central_break_preparation", "central_break_execution", "pawn_lever_support"] });
    if (allowed) verifiedClaims.push("center");
    else unverifiedClaims.push("unverified_center_tension_claim");
  }

  if (/\bpressure\b|\battack\b/.test(text)) {
    const allowed = hasFeature({ features: input.features, plans: input.plans, plan: input.selectedPlan, tokens: ["attacks_square", "active_bishop", "bishop_diagonal_pressure", "rook_on_open_file", "rook_on_semi_open_file"] });
    if (allowed) verifiedClaims.push("pressure");
    else unverifiedClaims.push("unverified_pressure_claim");
  }

  if (/king safety|castle|shelter/.test(text)) {
    const allowed = Boolean(move?.isKingSafetyMove) || hasFeature({ features: input.features, plans: input.plans, plan: input.selectedPlan, tokens: ["king_safety_urgent", "castle_and_connect_rooks"] });
    if (allowed) verifiedClaims.push("king_safety");
    else unverifiedClaims.push("unverified_king_safety_claim");
  }

  if (/\bcaptures?\b|\btakes\b/.test(text)) {
    if (move?.isCapture) verifiedClaims.push("capture");
    else unverifiedClaims.push("unverified_capture_claim");
  }

  if (/checkmate|\bmate\b/.test(text)) {
    if (move?.isMate) verifiedClaims.push("mate");
    else unverifiedClaims.push("unverified_mate_claim");
  }

  if (/\bcheck\b/.test(text) && !/checkmate|\bmate\b/.test(text)) {
    if (move?.isCheck) verifiedClaims.push("check");
    else unverifiedClaims.push("unverified_check_claim");
  }

  if (/promotion|=q|=r|=b|=n/.test(text)) {
    if (move?.isPromotion) verifiedClaims.push("promotion");
    else unverifiedClaims.push("unverified_promotion_claim");
  }

  if (!move) {
    unverifiedClaims.push("missing_verified_move_facts");
  }

  // Guard impossible template/move pairing explicitly.
  if (input.selectedTemplateId?.startsWith("bishop_activity") && move && move.pieceType !== "b") {
    unverifiedClaims.push(`template_claim_not_supported_by_move_fact:${input.selectedTemplateId}:${pieceNameFromType(move.pieceType)}`);
  }

  return {
    allowed: unverifiedClaims.length === 0,
    verifiedClaims,
    unverifiedClaims,
  };
}
