import type { MasteryMapNode } from "./masteryMapTypes";

export function filterMasteryMapNodes(
  nodes: readonly MasteryMapNode[],
  query = "",
): MasteryMapNode[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [...nodes];
  return nodes.filter((node) =>
    node.sanSequence.join(" ").toLowerCase().includes(normalized),
  );
}
