import type { ActivityEvidence } from "@/lib/blundr/daily/core/dailyActivityConformance";
export function continuationEvidence(
  sourceId: string,
  source: ActivityEvidence["source"] = "continuation",
): ActivityEvidence {
  return {
    source,
    sourceId,
    version: "continuation-challenge-evidence-v1",
    confidence: 0.8,
    verified: true,
    observedAt: new Date().toISOString(),
  };
}
