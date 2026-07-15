import type { LearningEventV2 } from "@/lib/blundr/contracts";
import { activityLearningEvent } from "../activityUtils";
export function mixedTestLearningEvent(input: {
  userId: string;
  sessionId: string;
  positionKey: string;
  now: string;
  firstAttempt: boolean;
  position?: LearningEventV2["position"];
}): LearningEventV2 {
  return activityLearningEvent({
    ...input,
    activityId: "daily_mixed_test",
    taxonomy: input.firstAttempt ? "daily_answered" : "daily_retried",
    sourceId: input.positionKey,
  });
}
