function normalizeUci(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
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
