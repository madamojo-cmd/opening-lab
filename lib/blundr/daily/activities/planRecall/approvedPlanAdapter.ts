import type { ActivityEvidence } from "@/lib/blundr/daily/core/dailyActivityConformance";
import type { PlanQuestionType } from "./planRecallTypes";
export function approvedPlanEvidence(input: {
  sourceId: string;
  type: PlanQuestionType;
  version?: string;
}): ActivityEvidence {
  return {
    source: "approved_content",
    sourceId: input.sourceId,
    version: input.version ?? "approved-plan-v1",
    confidence: 1,
    verified: true,
    observedAt: new Date().toISOString(),
  };
}
