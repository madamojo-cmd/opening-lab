import { selectWeakBranches } from "./weakBranchSelector";
import type { MasteryMapReadModel, MasteryMapNode } from "./masteryMapTypes";

export function buildMasteryMapReadModel(input: {
  openingId: string;
  openingName: string;
  side: "white" | "black" | "unknown";
  nodes: readonly MasteryMapNode[];
  importedGameMatchCount: number;
  state?: MasteryMapReadModel["state"];
}): MasteryMapReadModel {
  const firstAttemptNodes = input.nodes.filter(
    (node) => node.lastFirstAttemptResult,
  );
  const correct = firstAttemptNodes.filter(
    (node) => node.lastFirstAttemptResult === "correct",
  ).length;
  const count = (status: MasteryMapNode["status"]) =>
    input.nodes.filter((node) => node.status === status).length;
  const dates = input.nodes
    .map((node) => node.nextDueAt)
    .filter(Boolean) as string[];
  return {
    openingId: input.openingId,
    openingName: input.openingName,
    side: input.side,
    state: input.state ?? (input.nodes.length ? "ready" : "empty"),
    nodes: input.nodes,
    masteredPositions: count("mastered"),
    learningPositions: count("learning"),
    weakPositions: count("weak") + count("repeated_lapse"),
    unseenPositions: count("unseen"),
    firstAttemptUnaidedAccuracy: firstAttemptNodes.length
      ? correct / firstAttemptNodes.length
      : null,
    retention7d: null,
    retention30d: null,
    importedGameMatchCount: input.importedGameMatchCount,
    lastTrainedAt: null,
    nextDueAt: dates.sort()[0] ?? null,
    weakBranches: selectWeakBranches(input.nodes),
  };
}
