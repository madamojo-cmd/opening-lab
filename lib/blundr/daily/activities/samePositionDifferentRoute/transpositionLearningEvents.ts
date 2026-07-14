import { activityLearningEvent } from "../activityUtils";
import type { LearningEventV2 } from "@/lib/blundr/contracts";
export function transpositionLearningEvents(input: {
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
      activityId: "daily_same_position_different_route",
      positionKey: input.positionKey,
      taxonomy: input.retry ? "daily_retried" : "daily_answered",
      firstAttempt: !input.retry,
      now: input.now,
      sourceId: input.positionKey,
      position: input.position,
    }),
  ];
}
