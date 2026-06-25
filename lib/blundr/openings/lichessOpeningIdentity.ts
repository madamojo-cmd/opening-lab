import { LICHESS_OPENING_IDENTITY_MANIFEST } from "./lichessOpeningIdentity.generated";

export type LichessOpeningIdentity = {
  eco: string;
  name: string;
  familyName: string;
  variationName: string | null;
  ply: number;
  matchedUci: string[];
  confidence: "exact" | "prefix";
};

function normalizeUci(move: string | null | undefined): string {
  return String(move ?? "").trim().toLowerCase();
}

function normalizeHistory(moves: readonly string[]): string[] {
  return moves.map(normalizeUci).filter(Boolean);
}

export function resolveLichessOpeningIdentity(input: {
  moveHistoryUci: readonly string[];
  minPly?: number;
}): LichessOpeningIdentity | null {
  const history = normalizeHistory(input.moveHistoryUci);
  const minPly = input.minPly ?? 2;
  if (history.length < minPly) return null;

  const historyKey = history.join(",");

  const match = LICHESS_OPENING_IDENTITY_MANIFEST
    .filter((entry) => entry.ply >= minPly)
    .filter((entry) => historyKey === entry.uciKey || historyKey.startsWith(`${entry.uciKey},`))
    .sort((a, b) => {
      if (a.ply !== b.ply) return b.ply - a.ply;
      return a.name.localeCompare(b.name);
    })[0];

  if (!match) return null;

  return {
    eco: match.eco,
    name: match.name,
    familyName: match.familyName,
    variationName: match.variationName,
    ply: match.ply,
    matchedUci: match.uciKey.split(",").filter(Boolean),
    confidence: match.ply === history.length ? "exact" : "prefix",
  };
}
