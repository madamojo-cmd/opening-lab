import type { RuntimeOpeningNode } from "./trainingRuntimeSchema";
import { Chess } from "chess.js";

export type TranspositionGroup = { positionKey: string; routes: string[] };

export function buildTranspositionGroups(
  nodes: readonly RuntimeOpeningNode[],
): TranspositionGroup[] {
  const byPosition = new Map<string, Set<string>>();
  for (const node of nodes) {
    const chess = new Chess();
    for (const move of node.playSequenceUci.split(",").filter(Boolean))
      chess.move({
        from: move.slice(0, 2),
        to: move.slice(2, 4),
        promotion: move[4] as "q" | "r" | "b" | "n" | undefined,
      });
    const positionKey = chess.fen();
    const routes = byPosition.get(positionKey) ?? new Set<string>();
    routes.add(`${node.openingId}:${node.playKey}`);
    byPosition.set(positionKey, routes);
  }
  return [...byPosition.entries()]
    .filter(([, routes]) => routes.size >= 2)
    .map(([positionKey, routes]) => ({
      positionKey,
      routes: [...routes].sort(),
    }))
    .sort((a, b) => a.positionKey.localeCompare(b.positionKey));
}
