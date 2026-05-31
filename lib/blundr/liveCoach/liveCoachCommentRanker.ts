import type { CoachOpportunityScore } from "./liveCoachTypes";

export function selectBestLiveComment(scores: CoachOpportunityScore[]): CoachOpportunityScore | null {
  if (!scores.length) return null;
  return scores
    .slice()
    .sort((a, b) => {
      if ((b.totalScore ?? 0) !== (a.totalScore ?? 0)) return (b.totalScore ?? 0) - (a.totalScore ?? 0);
      if (b.pedagogicalValue !== a.pedagogicalValue) return b.pedagogicalValue - a.pedagogicalValue;
      return b.confidenceScore - a.confidenceScore;
    })[0];
}
