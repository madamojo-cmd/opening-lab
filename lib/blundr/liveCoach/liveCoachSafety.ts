const BANNED = ["stockfish", "maia", "probability", "centipawn", "verified_top2", "repertoire_supported", "engine_close", "engine delta", "severe_warning", "top two"];

export function validateLiveCoachCopy(text: string): { allowed: boolean; warnings: string[] } {
  const lower = text.toLowerCase();
  const warnings = BANNED.filter((token) => lower.includes(token));
  return { allowed: warnings.length === 0, warnings };
}
