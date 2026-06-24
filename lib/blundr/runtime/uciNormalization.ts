function normalizeText(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

export function normalizeRuntimeCastlingUci(uci: unknown): string | null {
  const normalized = normalizeText(uci);
  if (!normalized) return null;
  if (normalized === "e1h1") return "e1g1";
  if (normalized === "e1a1") return "e1c1";
  if (normalized === "e8h8") return "e8g8";
  if (normalized === "e8a8") return "e8c8";
  return normalized;
}

export function normalizeRuntimePlayKey(playKey: unknown): string | null {
  const normalized = String(playKey ?? "")
    .split(",")
    .map((entry) => normalizeRuntimeCastlingUci(entry))
    .filter((entry): entry is string => Boolean(entry));
  return normalized.length > 0 ? normalized.join(",") : null;
}

export function normalizeRuntimePlaySequenceUci(playSequenceUci: unknown): string[] {
  if (!Array.isArray(playSequenceUci)) return [];
  return playSequenceUci
    .map((entry) => normalizeRuntimeCastlingUci(entry))
    .filter((entry): entry is string => Boolean(entry));
}
