import { normalizeVisualFen } from "../visual/normalizeVisualFen";

export function normalizedFenCacheKey(fen: string): string {
  return normalizeVisualFen(fen);
}
