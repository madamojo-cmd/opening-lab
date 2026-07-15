import type { MasteryMapNode } from "./masteryMapTypes";

export function summarizeOpeningDetail(nodes: readonly MasteryMapNode[]) {
  const trained = nodes.filter((node) => node.lastFirstAttemptResult !== null);
  return {
    mastered: nodes.filter((node) => node.status === "mastered").length,
    learning: nodes.filter((node) => node.status === "learning").length,
    weak: nodes.filter(
      (node) => node.status === "weak" || node.status === "repeated_lapse",
    ).length,
    unseen: nodes.filter((node) => node.status === "unseen").length,
    firstAttemptAccuracy: trained.length
      ? trained.filter((node) => node.lastFirstAttemptResult === "correct")
          .length / trained.length
      : null,
  };
}
