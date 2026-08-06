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
  limit: number,
): T[] {
  if (!Number.isInteger(limit) || limit < 1)
    throw new Error("daily_task_count_invalid");
  const ordered = [...cards].sort(
    (a, b) => b.priority - a.priority || a.stableKey.localeCompare(b.stableKey),
  );
  const selected: T[] = [];
  const selectedPositions = new Set<string>();

  // Every playable Daily keeps one canonical Missing Move card. The remaining
  // slots may be any approved reservation task, including Candidate Choice.
  const recall = ordered.find(
    (card) => card.publicCard.activityId === "daily_move_recall",
  );
  if (recall) {
    selected.push(recall);
    selectedPositions.add(recall.publicCard.positionKey);
    if (selected.length >= limit) return selected;
  }

  const priorities = [...new Set(ordered.map((card) => card.priority))].sort(
    (a, b) => b - a,
  );
  for (const priority of priorities) {
    const tier = ordered.filter((card) => card.priority === priority);
    const selectedActivities = new Set<string>();
    for (const card of tier) {
      if (
        selectedPositions.has(card.publicCard.positionKey) ||
        selectedActivities.has(card.publicCard.activityId)
      )
        continue;
      selected.push(card);
      selectedPositions.add(card.publicCard.positionKey);
      selectedActivities.add(card.publicCard.activityId);
      if (selected.length >= limit) return selected;
    }
    for (const card of tier) {
      if (selectedPositions.has(card.publicCard.positionKey)) continue;
      selected.push(card);
      selectedPositions.add(card.publicCard.positionKey);
      if (selected.length >= limit) return selected;
    }
  }

  throw new Error("daily_runtime_fallback_insufficient");
}
