import type { GeneratedMiniGameDifficulty, MiniGameGenerationCandidate } from "./miniGameGenerationTypes";

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export function classifyMiniGameDifficulty(candidate: MiniGameGenerationCandidate): GeneratedMiniGameDifficulty {
  const complexity = clamp(
    candidate.analysis.complexity * 1.2 +
      candidate.analysis.decoyCount * 8 +
      candidate.analysis.blockerCount * 6 +
      Math.max(0, candidate.analysis.routeLength - 1) * 10 +
      (candidate.analysis.forcing ? 12 : 0) +
      Math.abs(candidate.analysis.materialBalance) * 2 +
      candidate.analysis.candidateCount * 2,
  );

  if (complexity < 34) return "easy";
  if (complexity < 68) return "medium";
  return "hard";
}
