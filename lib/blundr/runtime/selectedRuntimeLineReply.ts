function normalizeUci(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export function resolvePlyFromFen(fen: string): number | null {
  const fields = String(fen ?? "")
    .trim()
    .split(/\s+/);
  if (fields.length < 6 || (fields[1] !== "w" && fields[1] !== "b"))
    return null;
  const fullMove = Number(fields[5]);
  if (!Number.isInteger(fullMove) || fullMove < 1) return null;
  return (fullMove - 1) * 2 + (fields[1] === "b" ? 1 : 0);
}

export function resolveSelectedRuntimeLineOpponentReply(input: {
  trainingMode: "restricted" | "continuation";
  selectedPlaySequenceUci: readonly string[];
  currentPly: number;
  legalMoveUcis: readonly string[];
}): string | null {
  if (input.trainingMode !== "restricted") return null;
  const currentPly = Math.max(0, Math.floor(Number(input.currentPly) || 0));
  const selected = normalizeUci(input.selectedPlaySequenceUci[currentPly]);
  if (!selected) return null;
  const legal = new Set(input.legalMoveUcis.map(normalizeUci).filter(Boolean));
  return legal.has(selected) ? selected : null;
}
