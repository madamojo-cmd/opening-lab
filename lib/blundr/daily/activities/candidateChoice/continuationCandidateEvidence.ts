import type { ActivityEvidence } from "@/lib/blundr/daily/core/dailyActivityConformance";
export function continuationCandidateEvidence(
  sourceId: string,
): ActivityEvidence {
  return {
    source: "continuation",
    sourceId,
    version: "continuation-candidate-evidence-v1",
    confidence: 0.7,
    verified: true,
    observedAt: new Date().toISOString(),
  };
}
