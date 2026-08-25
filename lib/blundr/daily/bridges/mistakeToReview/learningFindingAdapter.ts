import type {
  LearningEventV2,
  LearningFinding,
} from "@/lib/blundr/contracts";
import { classifyMistake } from "./mistakeClassifier";
export function adaptLearningEventToFinding(
  event: LearningEventV2,
): LearningFinding | null {
  const classified = classifyMistake(event);
  if (!classified || !event.position) return null;
  return {
    findingId: `${event.userId}:${classified.positionKey}:${classified.category}`,
    position: event.position,
    category: classified.category,
    confidence: classified.confidence,
    severity:
      classified.confidence >= 0.7
        ? "high"
        : classified.confidence >= 0.45
          ? "medium"
          : "low",
    source: {
      source: event.source,
      sourceId: event.eventId,
      observedAt: event.occurredAt,
      firstAttempt: event.firstAttempt,
    },
    explanation: `Review this ${classified.category.replaceAll("_", " ")} from the ${classified.reason.replaceAll("_", " ")} evidence.`,
    recommendedDailyIntervention: "review_position",
  };
}
