import type { MasteryMapNode, WeakBranch } from "./masteryMapTypes";

export function selectWeakBranches(
  nodes: readonly MasteryMapNode[],
  limit = 3,
): WeakBranch[] {
  return [...nodes]
    .filter(
      (node) =>
        node.access === "active" &&
        (node.status === "weak" || node.status === "repeated_lapse"),
    )
    .sort((a, b) => {
      const score = (node: MasteryMapNode) =>
        (node.status === "repeated_lapse" ? 2 : 1) *
        (1 - node.confidence) *
        Math.max(1, node.evidenceCount);
      return score(b) - score(a) || a.positionKey.localeCompare(b.positionKey);
    })
    .slice(0, Math.max(0, limit))
    .map((node) => ({
      positionKey: node.positionKey,
      openingId: node.openingId,
      sanSequence: node.sanSequence,
      explanation:
        node.weaknessExplanation ??
        "More first-attempt practice is recommended.",
      confidence: node.confidence,
      evidenceCount: node.evidenceCount,
      recommendedActivity:
        node.recommendedDailyIntervention ?? "review_position",
      recentResult: node.lastFirstAttemptResult,
    }));
}
