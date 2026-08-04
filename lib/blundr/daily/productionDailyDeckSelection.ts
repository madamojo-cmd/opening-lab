type BoardCard = {
  publicCard: {
    activityId: string;
    positionKey: string;
    interaction: "move" | "choice";
  };
  priority: number;
  stableKey: string;
};

export function selectProductionDailyBoardCards<T extends BoardCard>(
  cards: readonly T[],
  limit = 5,
): T[] {
  const ordered = cards
    .filter((card) => card.publicCard.interaction === "move")
    .sort(
      (a, b) =>
        b.priority - a.priority || a.stableKey.localeCompare(b.stableKey),
    );
  const selected: T[] = [];
  const selectedPositions = new Set<string>();
  const selectedActivities = new Set<string>();

  for (const card of ordered) {
    if (
      selectedActivities.has(card.publicCard.activityId) ||
      selectedPositions.has(card.publicCard.positionKey)
    )
      continue;
    selected.push(card);
    selectedActivities.add(card.publicCard.activityId);
    selectedPositions.add(card.publicCard.positionKey);
    if (selected.length >= limit) return selected;
  }

  for (const card of ordered) {
    if (selectedPositions.has(card.publicCard.positionKey)) continue;
    selected.push(card);
    selectedPositions.add(card.publicCard.positionKey);
    if (selected.length >= limit) return selected;
  }

  throw new Error("daily_board_deck_incomplete");
}
