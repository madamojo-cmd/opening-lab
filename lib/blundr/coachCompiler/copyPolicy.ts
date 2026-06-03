const STRONG_TERMS = [
  "best",
  "only move",
  "forced",
  "winning",
  "wins",
  "checkmate",
  "mate",
  "refutes",
  "trap",
  "blunder",
];

export function getSafeMoveVerb(input: {
  pieceType: string | null;
  evidenceClaimTypes: string[];
}): string {
  const piece = String(input.pieceType ?? "").toLowerCase();
  if (input.evidenceClaimTypes.includes("castling") || piece === "king") return "improves king safety";
  if (input.evidenceClaimTypes.includes("center_control")) return "improves central control";
  if (input.evidenceClaimTypes.includes("development")) return "improves development";
  if (input.evidenceClaimTypes.includes("pressure")) return "adds pressure";
  if (piece === "pawn") return "improves structure";
  return "improves your position";
}

export function containsUnsafeStrongClaim(text: string): boolean {
  const lower = String(text).toLowerCase();
  return STRONG_TERMS.some((term) => lower.includes(term));
}

export function downgradeUnsafeStrongClaim(text: string): string {
  let out = String(text);
  const replacements: Array<[RegExp, string]> = [
    [/\bbest\b/gi, "solid"],
    [/\bonly move\b/gi, "reliable choice"],
    [/\bforced\b/gi, "strong"],
    [/\bwinning\b/gi, "favorable"],
    [/\bwins\b/gi, "improves"],
    [/\bcheckmate\b/gi, "strong pressure"],
    [/\bmate\b/gi, "pressure"],
    [/\brefutes\b/gi, "challenges"],
    [/\btrap\b/gi, "tactical idea"],
    [/\bblunder\b/gi, "mistake"],
  ];
  for (const [pattern, replacement] of replacements) {
    out = out.replace(pattern, replacement);
  }
  return out;
}
