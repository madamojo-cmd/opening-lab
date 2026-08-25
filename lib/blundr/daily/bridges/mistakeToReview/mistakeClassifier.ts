import type {
  LearningEventV2,
  LearningFindingCategory,
} from "../../../contracts/index.ts";
import type { ReviewReason } from "./reviewReason.ts";

export type ClassifiedMistake = {
  positionKey: string;
  category: LearningFindingCategory;
  reason: ReviewReason;
  confidence: number;
  sourceEventId: string;
  openingId: string | null;
};
export function classifyMistake(
  event: LearningEventV2,
): ClassifiedMistake | null {
  if (
    !event.position ||
    (event.taxonomy !== "move_incorrect" &&
      event.taxonomy !== "continuation_completed")
  )
    return null;
  const category =
    event.finding?.category ??
    (event.position.openingId ? "opening_move" : "unknown");
  return {
    positionKey: event.position.positionKey,
    category,
    reason:
      event.taxonomy === "continuation_completed"
        ? "continuation_mistake"
        : event.firstAttempt
          ? "first_attempt_miss"
          : "repeated_miss",
    confidence: event.finding?.confidence ?? (event.firstAttempt ? 0.55 : 0.35),
    sourceEventId: event.eventId,
    openingId: event.position.openingId,
  };
}
