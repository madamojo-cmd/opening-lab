import type { RuntimeOpeningNode } from "./trainingRuntimeSchema";

export function buildPositionIndex(
  nodes: readonly RuntimeOpeningNode[],
): Map<string, RuntimeOpeningNode[]> {
  const index = new Map<string, RuntimeOpeningNode[]>();
  for (const node of nodes)
    index.set(node.playKey, [...(index.get(node.playKey) ?? []), node]);
  return index;
}
