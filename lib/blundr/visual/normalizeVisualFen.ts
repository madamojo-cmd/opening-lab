import { canonicalPositionFen } from "@/lib/blundr/chess/canonicalPosition";

export function normalizeVisualFen(fen?: string | null): string {
  if (!fen || typeof fen !== "string") return "";
  try {
    return canonicalPositionFen(fen);
  } catch {
    const fields = fen.trim().split(/\s+/).filter(Boolean);
    return fields.slice(0, 4).join(" ");
  }
}

export function visualFenMatches(
  a?: string | null,
  b?: string | null,
): boolean {
  const left = normalizeVisualFen(a);
  const right = normalizeVisualFen(b);
  return Boolean(left && right && left === right);
}
