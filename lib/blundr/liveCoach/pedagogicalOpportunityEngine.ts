import type { CandidateMoveProfile, CoachOpportunityScore, PositionEvidencePacket } from "./liveCoachTypes";

function scoreOpportunity(score: Omit<CoachOpportunityScore, "totalScore">): CoachOpportunityScore {
  const repetitionPenalty = 0;
  const totalScore =
    score.confidenceScore * 0.3 +
    score.pedagogicalValue * 0.25 +
    score.userRelevance * 0.2 +
    score.novelty * 0.15 -
    score.revealRisk * 0.2 -
    repetitionPenalty * 0.3;
  return { ...score, totalScore };
}

export function rankPedagogicalOpportunities(evidence: PositionEvidencePacket, candidates: CandidateMoveProfile[]): CoachOpportunityScore[] {
  if (evidence.stale) return [scoreOpportunity({ opportunity: "silence", intent: "stay_silent", confidenceScore: 0, pedagogicalValue: 0, userRelevance: 0, novelty: 0, revealRisk: 0, exactMoveAllowed: false, evidenceSources: ["position_features"], reason: "stale_position" })];

  const opportunities: CoachOpportunityScore[] = [];

  if (evidence.focusMove) {
    opportunities.push(scoreOpportunity({
      opportunity: "supported_continuation",
      intent: "explain_plan",
      confidenceScore: 0.98,
      pedagogicalValue: 0.9,
      userRelevance: 0.88,
      novelty: 0.55,
      revealRisk: 0.05,
      exactMoveAllowed: true,
      evidenceSources: ["position_features"],
      candidateMoveUci: evidence.focusMove.moveUci,
      candidateMoveSan: evidence.focusMove.moveSan,
      reason: "focus_move_from_instruction_target",
    }));
  }

  const mistake = candidates.find((c) => c.moveClass === "predictable_human_mistake");
  if (mistake) {
    opportunities.push(scoreOpportunity({
      opportunity: "predictable_human_mistake",
      intent: "warn",
      confidenceScore: 0.9,
      pedagogicalValue: 0.9,
      userRelevance: 0.8,
      novelty: 0.6,
      revealRisk: 0.2,
      exactMoveAllowed: false,
      evidenceSources: ["maia", "engine", "position_features"],
      candidateMoveUci: mistake.moveUci,
      candidateMoveSan: mistake.moveSan,
      reason: "high_human_temptation_but_bad_engine_safety",
    }));
  }

  const hard = candidates.find((c) => c.moveClass === "hard_to_find_good_move");
  if (hard) {
    opportunities.push(scoreOpportunity({
      opportunity: "hard_to_find_good_move",
      intent: "compare_instincts",
      confidenceScore: 0.85,
      pedagogicalValue: 0.88,
      userRelevance: 0.75,
      novelty: 0.7,
      revealRisk: 0.25,
      exactMoveAllowed: hard.exactRecommendationAllowed,
      evidenceSources: ["maia", "engine", "position_features"],
      candidateMoveUci: hard.moveUci,
      candidateMoveSan: hard.moveSan,
      reason: "low_human_probability_but_safe_engine_move",
    }));
  }

  if (evidence.patternSignals?.transferOpportunity) {
    opportunities.push(scoreOpportunity({
      opportunity: "pattern_transfer",
      intent: "connect_pattern",
      confidenceScore: 0.8,
      pedagogicalValue: 0.92,
      userRelevance: 0.85,
      novelty: 0.65,
      revealRisk: 0.1,
      exactMoveAllowed: false,
      evidenceSources: ["pattern_memory", "position_features", "user_memory"],
      reason: "position_matches_previously_trained_pattern",
    }));
  }

  if (evidence.positionFeatures.kingSafety === "watch_center" || evidence.positionFeatures.kingSafety === "exposed") {
    opportunities.push(scoreOpportunity({
      opportunity: "king_safety_urgent",
      intent: "warn",
      confidenceScore: 0.8,
      pedagogicalValue: 0.82,
      userRelevance: 0.8,
      novelty: 0.5,
      revealRisk: 0.1,
      exactMoveAllowed: false,
      evidenceSources: ["position_features"],
      reason: "king_safety_not_resolved",
    }));
  }

  if (evidence.positionFeatures.centerState === "tense") {
    opportunities.push(scoreOpportunity({
      opportunity: "center_decision",
      intent: "explain_plan",
      confidenceScore: 0.74,
      pedagogicalValue: 0.78,
      userRelevance: 0.7,
      novelty: 0.52,
      revealRisk: 0.08,
      exactMoveAllowed: false,
      evidenceSources: ["position_features"],
      reason: "center_tension_requires_decision",
    }));
  }

  if (evidence.positionFeatures.leastActivePieces.length) {
    opportunities.push(scoreOpportunity({
      opportunity: "least_active_piece",
      intent: "nudge",
      confidenceScore: 0.7,
      pedagogicalValue: 0.72,
      userRelevance: 0.68,
      novelty: 0.55,
      revealRisk: 0.05,
      exactMoveAllowed: false,
      evidenceSources: ["position_features"],
      reason: "piece_improvement_needed",
    }));
  }

  const continuation = candidates.find((c) => c.exactRecommendationAllowed && (c.bookSupport || c.repertoireSupport || c.patternSupport));
  if (continuation) {
    opportunities.push(scoreOpportunity({
      opportunity: "supported_continuation",
      intent: "explain_plan",
      confidenceScore: continuation.explanationConfidence,
      pedagogicalValue: 0.73,
      userRelevance: 0.69,
      novelty: 0.5,
      revealRisk: 0.2,
      exactMoveAllowed: true,
      evidenceSources: ["engine", "repertoire", "position_features"],
      candidateMoveUci: continuation.moveUci,
      candidateMoveSan: continuation.moveSan,
      reason: "legal_safe_supported_continuation_available",
    }));
  }

  if (!opportunities.length) {
    opportunities.push(scoreOpportunity({
      opportunity: "silence",
      intent: "stay_silent",
      confidenceScore: 0.2,
      pedagogicalValue: 0.1,
      userRelevance: 0.1,
      novelty: 0,
      revealRisk: 0,
      exactMoveAllowed: false,
      evidenceSources: ["position_features"],
      reason: "no_clear_opportunity",
    }));
  }

  return opportunities.sort((a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0));
}
