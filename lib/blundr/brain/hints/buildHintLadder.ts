/**
 * BLUNDR v2.7.40 Progressive Hint Ladder (Agent 4)
 * Single source for non-answer-leaking, progressive hints in Plain View.
 *
 * Strict contract per v2.7.40:
 * - Only called/used before showMoreShown for Plain teaching frames.
 * - Hint 1 (concept): Broad only. Never mentions piece if it gives away, no SAN/UCI/from-to/"Play X"/target square.
 * - Hint 2 (piece/category): May mention piece type or purpose safely.
 * - Hint 3 (directional/plan): Zone/plan/idea. Still no direct move.
 * - Evidence-backed from CurrentInstructionTarget facts + optional brainAnalysis (claims/features).
 * - leaksAnswer=false for all pre-showMore.
 * - Reset via hintCount reset on new instruction frame (upstream).
 * - Never leaks target move before showMoreShown.
 */

import type { CurrentInstructionTarget } from "../../runtime/currentInstructionFrame";
import type { BlundrBrainAnalysis } from "../types";

export interface HintLadderInput {
  target: CurrentInstructionTarget | null;
  brainAnalysis?: BlundrBrainAnalysis | null;
  selectedTeachingConcept?: string | null;
  userLevel?: string;
  hintCount: number;
  trainerView: "plain" | "assisted";
  showMoreShown: boolean;
}

export interface HintLevel {
  level: "concept" | "piece_or_category" | "directional_or_plan";
  text: string;
  leaksAnswer: boolean;
  evidenceIds?: string[];
}

export interface HintLadderOutput {
  currentHint: string | null;
  hintIndex: number;
  maxHints: number; // 3
  hints: HintLevel[];
}

/**
 * Build progressive 3-rung hint ladder + select current based on hintCount.
 * Safe, non-leaking by construction: all texts avoid direct target identifiers (san, uci, from, to, squares, "play e4" etc).
 */
export function buildHintLadder(input: HintLadderInput): HintLadderOutput {
  const {
    target,
    brainAnalysis = null,
    hintCount = 0,
    showMoreShown = false,
    trainerView = "plain",
  } = input;

  const maxHints = 3;

  if (!target || showMoreShown) {
    return {
      currentHint: null,
      hintIndex: 0,
      maxHints,
      hints: [],
    };
  }

  // Safe piece name (never used for leak in concept level)
  const pieceNameMap: Record<string, string> = {
    p: "pawn",
    n: "knight",
    b: "bishop",
    r: "rook",
    q: "queen",
    k: "king",
  };
  const piece = pieceNameMap[target.pieceType] || "piece";

  // Evidence from target (always available) + brain if present
  const evidenceIds: string[] = [
    `target_kind:${target.kind}`,
    `target_piece:${target.pieceType}`,
  ];
  if (target.isDevelopment) evidenceIds.push("target_is_development");
  if (target.isCentralPawnAdvance) evidenceIds.push("target_central_pawn");
  if (target.isKingSafetyMove || target.isCastle) evidenceIds.push("target_king_safety");
  if (brainAnalysis) {
    evidenceIds.push("brain_analysis_available");
    if (brainAnalysis.coachClaims && Array.isArray(brainAnalysis.coachClaims) && brainAnalysis.coachClaims.length > 0) {
      evidenceIds.push("brain_coach_claims");
    }
    if (brainAnalysis.strategicFeatures && Array.isArray(brainAnalysis.strategicFeatures) && brainAnalysis.strategicFeatures.length > 0) {
      evidenceIds.push("brain_strategic_features");
    }
    if (brainAnalysis.pedagogicalFocus) {
      evidenceIds.push("brain_pedagogical_focus");
    }
    if (brainAnalysis.selectedTeachingCandidate) {
      evidenceIds.push("brain_selected_teaching_candidate");
    }
  }

  // Level 1: Concept only (broad, no piece even if dev)
  let conceptText = "Look for a developing move or a move that improves your overall position.";
  if (target.isCentralPawnAdvance) {
    conceptText = "Look for a central advance or a move that fights for the center.";
  } else if (target.isKingSafetyMove || target.isCastle) {
    conceptText = "Look for a move that improves king safety or completes development.";
  } else if (brainAnalysis?.pedagogicalFocus?.focus) {
    // safe extraction, no move details
    const focus = String((brainAnalysis.pedagogicalFocus as any).focus || "").toLowerCase();
    if (focus.includes("center") || focus.includes("central")) {
      conceptText = "Look for a move that improves central control or stability.";
    } else if (focus.includes("develop")) {
      conceptText = "Look for a developing move that follows opening principles.";
    }
  }

  // Level 2: Piece/category (safe to name type/purpose now)
  let pieceText = `Consider ${piece} development or repositioning the ${piece} to support your plan.`;
  if (target.isCentralPawnAdvance) {
    pieceText = "Consider a central pawn advance or pawn move that gains space or control.";
  } else if (target.isCastle || target.isKingSafetyMove) {
    pieceText = "Consider a king or rook move that secures the king or completes castling ideas.";
  }

  // Level 3: Directional/plan (zone or idea, still no concrete move)
  let planText = "Identify the key zone (center, kingside, queenside) and the plan (development, pressure, or safety) that fits.";
  if (target.isCentralPawnAdvance) {
    planText = "Plan to increase central influence, support with pieces, or prepare a central break.";
  } else if (target.isKingSafetyMove || target.isCastle) {
    planText = "Focus on the king safety zone and completing your defensive or castling plan.";
  } else if (target.isDevelopment) {
    planText = "Focus on the development plan: get the remaining pieces active and coordinated.";
  }
  if (brainAnalysis?.strategicFeatures?.length) {
    // append safe plan flavor without specifics
    planText = planText + " Align with the main strategic theme in the position.";
  }

  const hints: HintLevel[] = [
    {
      level: "concept",
      text: conceptText,
      leaksAnswer: false,
      evidenceIds: [...evidenceIds, "level:concept"],
    },
    {
      level: "piece_or_category",
      text: pieceText,
      leaksAnswer: false,
      evidenceIds: [...evidenceIds, "level:piece_or_category"],
    },
    {
      level: "directional_or_plan",
      text: planText,
      leaksAnswer: false,
      evidenceIds: [...evidenceIds, "level:directional_or_plan"],
    },
  ];

  // Progressive selection: hintCount 0 = no hint yet (current null)
  // count=1 shows level 0 (first hint), count=2 level1, count>=3 level2
  const effectiveCount = Math.max(0, Math.floor(hintCount || 0));
  const hintIndex = effectiveCount > 0 ? Math.min(effectiveCount - 1, maxHints - 1) : 0;
  const currentHint = effectiveCount > 0 && !showMoreShown ? hints[hintIndex].text : null;

  return {
    currentHint,
    hintIndex,
    maxHints,
    hints,
  };
}

export default buildHintLadder;
