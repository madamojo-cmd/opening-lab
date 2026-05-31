export const RAW_INTERNAL_TERMS = [
  "Stockfish",
  "verified_top2",
  "rule-only visual",
  "GPT manual/debug",
  "maia_safe_human_like",
  "moveTrust",
  "visualIntent",
  "fallback",
  "untrusted",
  "top two",
  "centipawn",
  "engine delta",
  "severe_warning",
];

export const BLOCKED_UNSUPPORTED_WORDS = ["screaming", "permanent", "permanently", "crushing", "winning", "forced", "brilliant", "many players", "tempting"];

export function sentenceCount(text: string): number {
  return text.split(/[.!?]+/).map((part) => part.trim()).filter(Boolean).length;
}

export function approxTokenCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
