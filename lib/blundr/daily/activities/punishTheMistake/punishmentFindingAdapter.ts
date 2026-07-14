import type { ActivityEvidence } from "@/lib/blundr/daily/core/dailyActivityConformance";
export function punishmentFindingEvidence(input: {
  sourceId: string;
  source: "imported_game" | "continuation";
}): ActivityEvidence {
  return {
    source: input.source,
    sourceId: input.sourceId,
    version: "punishment-finding-v1",
    confidence: 0.8,
    verified: true,
    observedAt: new Date().toISOString(),
  };
}
