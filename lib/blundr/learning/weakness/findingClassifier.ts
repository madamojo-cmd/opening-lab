import type {
  LearningEventV2,
  LearningFinding,
  LearningFindingCategory,
} from "@/lib/blundr/contracts";

function categoryForEvent(event: LearningEventV2): LearningFindingCategory {
  if (event.position?.openingId) return "opening_move";
  const text = JSON.stringify(
    event.finding?.source.metadata ?? {},
  ).toLowerCase();
  if (text.includes("king")) return "king_safety";
  if (text.includes("pawn")) return "pawn_structure";
  return "unknown";
}

export function classifyLearningEvent(
  event: LearningEventV2,
): LearningFinding | null {
  if (
    !event.position ||
    (event.taxonomy !== "move_incorrect" && event.taxonomy !== "daily_answered")
  )
    return null;
  const category = event.finding?.category ?? categoryForEvent(event);
  const findingId =
    event.finding?.findingId ??
    `${event.userId}:${event.position.positionKey}:${category}`;
  return {
    findingId,
    position: event.position,
    category,
    confidence:
      event.finding?.confidence ??
      (event.source === "imported_game" ? 0.2 : 0.45),
    severity: event.finding?.severity ?? "medium",
    source: event.finding?.source ?? {
      source: event.source,
      sourceId: event.eventId,
      observedAt: event.occurredAt,
      firstAttempt: event.firstAttempt,
    },
    explanation:
      event.finding?.explanation ??
      `Review ${category.replaceAll("_", " ")} at this position using a fresh first attempt.`,
    recommendedDailyIntervention:
      event.finding?.recommendedDailyIntervention ?? "review_position",
  };
}
