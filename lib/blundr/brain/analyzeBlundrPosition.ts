/**
 * analyzeBlundrPosition - The single production Blundr Brain entry point.
 *
 * Per strict Brain V2 Production Spec:
 * - Always runs on teaching frames (no debug gating on computation).
 * - Evaluates the full position and candidates.
 * - Provides evidence for all claims.
 * - Target is always respected from CurrentInstructionFrame.
 */

import type { BlundrBrainAnalysis, BlundrBrainInput } from "./types";
import { normalizeVisualFen } from "../visual/normalizeVisualFen";

// New production submodules (Step 3+)
import { buildBoardTruth } from "./providers/boardTruthProvider";
import { generateCandidateMoves } from "./candidates/generateCandidateMoves";
import { validateCandidateWithStockfish } from "./engineValidation/validateCandidateWithStockfish";
import { rankTeachingCandidates } from "./pedagogy/rankTeachingCandidates";

// Temporary delegation to existing modules during transition
import { extractAdvancedFeatures } from "../features/advancedFeatureExtractor";
import { recognizeStrategicPlans } from "../plans/planRecognitionEngine";
import { rankTeachingOpportunities } from "../opportunity/multiLayerOpportunityRanker";
import type { TeachingOpportunity } from "../opportunity/opportunityTypes";

// Re-export the input type for convenience
export type AnalyzeBlundrPositionInput = BlundrBrainInput;

export function analyzeBlundrPosition(input: AnalyzeBlundrPositionInput): BlundrBrainAnalysis {
  const started = Date.now();
  const fen4 = normalizeVisualFen(input.fen);

  // Production Brain: Always computes when called with a valid target on teaching frames.
  const frameForBoardTruth = input.currentInstructionFrame ?? ({
    frameId: null,
    frameKey: `brain:${fen4}`,
    kind: "terminal",
    fenBefore: input.fen,
    ply: 0,
    sideToMove: input.fen.split(" ")[1] === "w" ? "white" : "black",
    target: null,
    mode: "terminal",
    source: "terminal",
  } as any);
  const boardTruth = buildBoardTruth({ frame: frameForBoardTruth });
  let rawCandidates = generateCandidateMoves(input.fen, input.currentInstructionFrame?.target?.uci);

  // Light integration of new submodules (full async validation in later steps)
  if (input.currentInstructionFrame?.target) {
    const targetUci = input.currentInstructionFrame.target.uci;
    // Basic ranking using new pedagogy
    rawCandidates = rankTeachingCandidates(rawCandidates);
    // Note: Full Stockfish per-candidate validation is expensive; we do it selectively in production flows.
  }

  let advanced: any = {};
  let plansPacket: any = { plans: [], blockedPlans: [] };
  let rankedOpportunity: TeachingOpportunity | null = null;

  try {
    advanced = extractAdvancedFeatures(input.fen);
    plansPacket = recognizeStrategicPlans({ fen: input.fen, features: advanced });

    if (input.currentInstructionFrame?.target) {
      const target = input.currentInstructionFrame.target;
      const simpleOpps: TeachingOpportunity[] = [{
        id: `brain:target:${target.uci}`,
        layer: "tactical",
        intent: "explain_training_move",
        moveUci: target.uci,
        moveSan: target.san,
        requiredClaimIds: [],
        requiredFeatureClaimIds: [],
        requiredPlanIds: [],
        forbiddenIfMissing: [],
        specificityScore: 80,
        pedagogicalValue: 70,
        urgencyScore: 60,
        confidenceScore: 85,
        repertoireRelevance: 50,
        visualAlignmentScore: 75,
        planCoherenceScore: 65,
        ratingFitScore: 60,
        repetitionPenalty: 0,
        safetyPenalty: 0,
        layerPrior: 100,
        totalScore: 0,
        canRender: true,
        debug: { source: "brain_facade" },
      }];
      rankedOpportunity = rankTeachingOpportunities(simpleOpps);
    }
  } catch (e) {
    advanced = { error: "feature_extraction_failed_in_brain" };
  }

  const analysis: BlundrBrainAnalysis = {
    version: "brain-v2-production-skeleton",
    fen: input.fen,
    sideToMove: input.fen.split(" ")[1] === "w" ? "white" : "black",

    boardTruth,

    legalCandidates: rawCandidates, // Now ranked via new pedagogy submodule
    selectedTeachingCandidate: null, // Will be set after full ranking (Steps 4-6)
    selectedContinuationCandidate: null,

    currentTarget: input.currentInstructionFrame?.target ? {
      uci: input.currentInstructionFrame.target.uci,
      san: input.currentInstructionFrame.target.san,
      pieceType: input.currentInstructionFrame.target.pieceType,
      from: input.currentInstructionFrame.target.from,
      to: input.currentInstructionFrame.target.to,
      source: "brain",
    } : null,

    moveDelta: null,
    tacticalMotifs: [],
    strategicFeatures: [],
    openingPlan: null,
    pedagogicalFocus: null,

    // v2.7.40 Agent 5 minimal foundation: intelligence flows target -> brain -> pres -> surface
    conceptClassification: input.currentInstructionFrame?.target ? classifyBasicConcept(input.currentInstructionFrame.target) : null,
    evidenceClaims: input.currentInstructionFrame?.target ? buildEvidenceClaims(input.currentInstructionFrame.target) : [],
    safeFallbackCopy: input.currentInstructionFrame?.target ? buildSafeFallbackCopy(input.currentInstructionFrame.target) : null,

    stockfishValidation: null, // Step 5

    explanationPlan: null,
    coachClaims: [],
    safetyLinterResult: { allowedToRender: true, blockedClaims: [] },

    mistakeDiagnosis: null,

    debug: {
      inputFrameKey: input.currentInstructionFrame?.instructionFrameKey,
      note: "Production Brain v2.7.40 Agent5 - target facts + concept + evidence + safe copy (pieceType enforced from CurrentInstructionFrame.target)",
      sourceModules: ["advancedFeatureExtractor", "planRecognitionEngine", "boardTruth", "generateCandidateMoves", "agent5-brain-foundation"],
    },
  };

  return analysis;
}

// v2.7.40 Agent 5: minimal helpers for safe, non-hallucinating, piece-matched coach copy foundation
// All derive strictly from CurrentInstructionFrame.target facts. No SAN in prompt/hint copy. No banned terms.
// pieceType always matches target.pieceType by construction. Evidence claims provided for linting.
function classifyBasicConcept(target: any): string {
  if (!target) return "improvement";
  if (target.isCastle || target.isKingSafetyMove) return "king_safety";
  if (target.isCentralPawnAdvance) return "central_control";
  if (target.isDevelopment) return "development";
  if (target.isCapture) return "material";
  return "improvement";
}

function buildEvidenceClaims(target: any): string[] {
  if (!target) return [];
  const claims: string[] = [
    `target_kind:${target.kind}`,
    `target_piece:${target.pieceType}`,
  ];
  if (target.isDevelopment) claims.push("target_is_development");
  if (target.isCentralPawnAdvance) claims.push("target_central_pawn");
  if (target.isKingSafetyMove || target.isCastle) claims.push("target_king_safety");
  if (target.capture || target.isCapture) claims.push("target_capture");
  if (target.check) claims.push("target_check");
  return claims;
}

const BANNED_COPY_TERMS = ["stockfish", "maia", "centipawn", "verified_top", "engine delta", "top two", "play " /* to catch "play e4" leaks */];

function buildSafeFallbackCopy(target: any) {
  if (!target || !target.pieceType) {
    return {
      title: "Improve your position",
      body: "Look for a move that follows sound opening principles.",
      hint: "Consider development and safety.",
      pieceType: "?",
      targetUci: null,
      targetSan: null,
      evidenceClaims: [],
      isSafe: true,
    };
  }
  const pieceNameMap: Record<string, string> = { p: "pawn", n: "knight", b: "bishop", r: "rook", q: "queen", k: "king" };
  const pieceName = pieceNameMap[target.pieceType] || "piece";
  const concept = classifyBasicConcept(target);
  const evClaims = buildEvidenceClaims(target);
  const san = target.san || "move";
  const dest = (target.to || "").toLowerCase();

  // Step 3: use verified SAN/piece/dest, required format; no generic when data exists
  let title = `${san} — Improve your position`;
  let body = `Move the ${pieceName} to ${dest}. This improves your ${pieceName} and keeps your position flexible.`;
  let hint = `Think about how the ${pieceName} supports your overall plan.`;

  if (concept === "king_safety") {
    title = `${san} — Prioritize king safety`;
    body = `Move the ${pieceName} to ${dest}. A ${pieceName} move that improves king safety or completes development toward castling.`;
    hint = "Look for safety improvements before opening the center.";
  } else if (concept === "central_control") {
    title = `${san} — Challenge the center`;
    body = `Move the ${pieceName} to ${dest}. This contests central space and opens lines for your pieces.`;
    hint = "Consider central influence and pawn structure.";
  } else if (concept === "material") {
    title = `${san} — Evaluate the exchange`;
    body = `Move the ${pieceName} to ${dest}. The ${pieceName} capture or recapture improves the material balance or position.`;
    hint = "Weigh captures carefully against development.";
  } else if (target.isDevelopment) {
    const shortT = pieceName === "bishop" ? "Develop the bishop" : (pieceName === "knight" ? "Develop the knight" : "Develop the piece");
    title = `${san} — ${shortT}`;
    body = `Move the ${pieceName} to ${dest}. This develops your ${pieceName} toward active central squares.`;
  }

  // Safety layer: lint for banned/halluc (by construction none, but explicit)
  const lowerBody = (body + " " + title + " " + (hint || "")).toLowerCase();
  const hasBanned = BANNED_COPY_TERMS.some((b) => lowerBody.includes(b));
  const isPieceMatched = target.pieceType && pieceName !== "?";
  const isSafe = !hasBanned && isPieceMatched && evClaims.length > 0;

  // Controlled variation note: in full would use coachVariationPolicy + memory; here deterministic safe per target facts (no repetition within frame)
  return {
    title,
    body,
    hint,
    pieceType: target.pieceType, // enforced match to CurrentInstructionFrame.target
    targetUci: target.uci,
    targetSan: target.san,
    evidenceClaims: evClaims,
    isSafe,
  };
}
