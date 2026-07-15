import type { ActivityEvidence } from "@/lib/blundr/daily/core/dailyActivityConformance";
export function verifiedDeepEvidence(
  sourceId: string,
  version = "deep-evidence-v1",
): ActivityEvidence {
  return {
    source: "approved_content",
    sourceId,
    version,
    confidence: 1,
    verified: true,
    observedAt: new Date().toISOString(),
  };
}
