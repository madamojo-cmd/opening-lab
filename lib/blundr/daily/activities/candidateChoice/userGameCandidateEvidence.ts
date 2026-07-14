import type { ActivityEvidence } from "@/lib/blundr/daily/core/dailyActivityConformance";
export function userGameCandidateEvidence(
  userId: string,
  move: string,
  confidence = 0.35,
): ActivityEvidence {
  return {
    source: "imported_game",
    sourceId: `${userId}:${move}`,
    version: "game-candidate-evidence-v1",
    confidence,
    verified: confidence >= 0.25,
    observedAt: new Date().toISOString(),
  };
}
