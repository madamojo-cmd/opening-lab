import { normalizeVisualFen } from "../visual/normalizeVisualFen";
import type { OpeningTree, RepertoireNode } from "./openingTypes";
import { transpositionKeyForFen } from "./openingTree";

export interface TranspositionMatch {
  nodes: RepertoireNode[];
  transpositionKey: string;
  exactFen4: string;
}

export function findTranspositionNodes(tree: OpeningTree, fen: string): TranspositionMatch {
  const exactFen4 = normalizeVisualFen(fen);
  const transpositionKey = transpositionKeyForFen(fen);
  return {
    nodes: tree.nodesByTranspositionKey[transpositionKey] ?? [],
    transpositionKey,
    exactFen4,
  };
}
