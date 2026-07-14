import type {
  LearningEventV2,
  OpeningAccessSnapshot,
} from "@/lib/blundr/contracts";

export function reprocessEligibleOnUnlock(
  events: readonly LearningEventV2[],
  openingId: string,
  side: "white" | "black",
  access: OpeningAccessSnapshot,
): LearningEventV2[] {
  if (
    access.decision !== "active" ||
    access.openingId !== openingId ||
    access.repertoireSide !== side
  )
    return [];
  return events.filter(
    (event) =>
      event.position?.openingId === openingId &&
      event.position.repertoireSide === side &&
      event.deletedAt === null,
  );
}
