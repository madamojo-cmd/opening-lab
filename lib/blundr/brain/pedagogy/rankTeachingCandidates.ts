/**
 * rankTeachingCandidates - Production Pedagogical Ranking (Step 6+)
 * Per Brain V2 Production Spec.
 * Scores candidates for teaching value.
 */

import type { CandidateEvaluation } from "../types";

export function rankTeachingCandidates(candidates: CandidateEvaluation[]): CandidateEvaluation[] {
  return [...candidates]
    .map(c => ({
      ...c,
      // Basic pedagogical scoring for now (will be expanded)
      pedagogicalScore: (c.tacticalScore || 50) + (c.planFitScore || 40) - (c.riskScore || 30),
    }))
    .sort((a, b) => b.pedagogicalScore - a.pedagogicalScore);
}
