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

function entryMatchesHistory(entryUci: readonly string[], history: readonly string[]): boolean {
  if (!entryUci.length || entryUci.length > history.length) return false;
  return entryUci.every((move, index) => normalizeUci(move) === history[index]);
}

export function resolveLichessOpeningIdentity(input: {
  moveHistoryUci: readonly string[];
  minPly?: number;
}): LichessOpeningIdentity | null {
  const history = normalizeHistory(input.moveHistoryUci);
  const minPly = input.minPly ?? 2;
  if (history.length < minPly) return null;

  const match = LICHESS_OPENING_IDENTITY_MANIFEST
    .filter((entry) => entry.uci.length >= minPly)
    .filter((entry) => entryMatchesHistory(entry.uci, history))
    .sort((a, b) => {
      if (a.uci.length !== b.uci.length) return b.uci.length - a.uci.length;
      return a.name.localeCompare(b.name);
    })[0];

  if (!match) return null;

  return {
    eco: match.eco,
    name: match.name,
    familyName: match.familyName,
    variationName: match.variationName,
    ply: match.uci.length,
    matchedUci: match.uci.map(String),
    confidence: match.uci.length === history.length ? "exact" : "prefix",
  };
}
