export type RealGameOpeningStats = {
  matchedGameCount: number;
  freshness: "empty" | "current" | "stale" | "partial";
  firstDivergence: string | null;
  repeatedOpponentReplies: readonly string[];
  repeatedCandidateErrors: readonly string[];
  punishmentOpportunities: number;
  moveOrderProblems: number;
  recentImprovement: number | null;
};

export function emptyRealGameOpeningStats(): RealGameOpeningStats {
  return {
    matchedGameCount: 0,
    freshness: "empty",
    firstDivergence: null,
    repeatedOpponentReplies: [],
    repeatedCandidateErrors: [],
    punishmentOpportunities: 0,
    moveOrderProblems: 0,
    recentImprovement: null,
  };
}
