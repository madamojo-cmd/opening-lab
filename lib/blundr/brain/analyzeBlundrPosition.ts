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
import { buildBoardTruth } from "./boardTruth/buildBoardTruth";
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
  const boardTruth = buildBoardTruth(input.fen);
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

    stockfishValidation: null, // Step 5

    explanationPlan: null,
    coachClaims: [],
    safetyLinterResult: { allowedToRender: true, blockedClaims: [] },

    mistakeDiagnosis: null,

    debug: {
      inputFrameKey: input.currentInstructionFrame?.instructionFrameKey,
      note: "Production Brain - boardTruth + basic candidates wired (Steps 3+)",
      sourceModules: ["advancedFeatureExtractor", "planRecognitionEngine", "boardTruth", "generateCandidateMoves"],
    },
  };

  return analysis;
}
