import { activityLearningEvent } from "../activityUtils";
import type { LearningEventV2 } from "@/lib/blundr/contracts";
export function continuationLearningEvents(input: {
  userId: string;
  sessionId: string;
  positionKey: string;
  now: string;
  retry?: boolean;
  position?: LearningEventV2["position"];
}) {
  return [
    activityLearningEvent({
      userId: input.userId,
      sessionId: input.sessionId,
      activityId: "daily_continuation_challenge",
      positionKey: input.positionKey,
      taxonomy: input.retry ? "daily_retried" : "daily_answered",
      firstAttempt: !input.retry,
      now: input.now,
      sourceId: input.positionKey,
      position: input.position,
    }),
  ];
}
