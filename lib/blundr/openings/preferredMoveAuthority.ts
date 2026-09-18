import preferredMoveAuthority from "./preferredMoveAuthority.generated.json";
import { normalizeVisualFen } from "../visual/normalizeVisualFen";

export const PREFERRED_MOVE_AUTHORITY_SCHEMA_VERSION =
  "blundr-preferred-move-authority.v1" as const;
export const PREFERRED_MOVE_AUTHORITY_KEY =
  "openingId+canonicalFen4+repertoireSide" as const;
export const PREFERRED_MOVE_STOCKFISH_VERSION = "18.0.7" as const;
export const PREFERRED_MOVE_STOCKFISH_DEPTH = 10 as const;
export const PREFERRED_MOVE_STOCKFISH_MULTIPV = 2 as const;

export type PreferredMoveAuthoritySide = "white" | "black";

export type PreferredMoveAuthorityEntry = {
  key: string;
  openingId: string;
  canonicalFen4: string;
  repertoireSide: PreferredMoveAuthoritySide;
  selectedUci: string;
  stockfishRank: 1 | 2;
  approvedCandidateUcis?: string[];
  sourcePlayKeys?: string[];
};

export type PreferredMoveAuthorityIndex = {
  schemaVersion: string;
  authorityKey: string;
  engine: {
    name: "stockfish";
    version: string;
    depth: number;
    multiPv: number;
  };
  runtime: {
    packageId: string;
    schemaVersion: string;
    sourceFiles: Record<string, unknown>;
    artifactFiles?: Record<string, string>;
  };
  generatedAt: string;
  counts: {
    positionGroupsAnalyzed: number;
    rankOneSelections: number;
    rankTwoSelections: number;
    omittedNoApprovedMatch: number;
    illegalOrMalformedGroups: number;
    duplicateCandidatesCollapsed: number;
  };
  openings: string[];
  entries: PreferredMoveAuthorityEntry[];
};

export type PreferredContinuationSelection<T extends { uci: string }> =
  | {
      status: "selected";
      selected: T;
      entry: PreferredMoveAuthorityEntry;
    }
  | {
      status: "authority_not_indexed";
    }
  | {
      status: "preferred_missing";
      key: string;
    }
  | {
      status: "preferred_not_in_candidates";
      key: string;
      selectedUci: string;
    };

export type StockfishTopTwoLine = {
  rank: 1 | 2;
  uci: string;
};

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeUci(value: unknown): string {
  return clean(value).toLowerCase();
}

export function normalizePreferredMoveAuthoritySide(
  value: unknown,
): PreferredMoveAuthoritySide | null {
  const side = clean(value).toLowerCase();
  if (side === "white" || side === "w") return "white";
  if (side === "black" || side === "b") return "black";
  return null;
}

export function buildPreferredMoveAuthorityKey(input: {
  openingId: string | null | undefined;
  canonicalFen: string;
  repertoireSide:
    | PreferredMoveAuthoritySide
    | "w"
    | "b"
    | "unknown"
    | null
    | undefined;
}): string | null {
  const openingId = clean(input.openingId);
  const repertoireSide = normalizePreferredMoveAuthoritySide(
    input.repertoireSide,
  );
  const canonicalFen4 = normalizeVisualFen(input.canonicalFen);
  if (!openingId || !repertoireSide || !canonicalFen4) return null;
  return `${openingId}|${canonicalFen4}|${repertoireSide}`;
}

const DEFAULT_INDEX = preferredMoveAuthority as PreferredMoveAuthorityIndex;

function entryMap(
  index: PreferredMoveAuthorityIndex,
): ReadonlyMap<string, PreferredMoveAuthorityEntry> {
  return new Map(index.entries.map((entry) => [entry.key, entry]));
}

const DEFAULT_ENTRY_MAP = entryMap(DEFAULT_INDEX);
const DEFAULT_OPENINGS = new Set(DEFAULT_INDEX.openings);

export function hasPreferredMoveAuthorityOpening(
  openingId: string | null | undefined,
  index: PreferredMoveAuthorityIndex = DEFAULT_INDEX,
): boolean {
  const id = clean(openingId);
  if (!id) return false;
  if (index === DEFAULT_INDEX) return DEFAULT_OPENINGS.has(id);
  return index.openings.includes(id);
}

export function getPreferredMoveAuthorityEntry(
  input: {
    openingId: string | null | undefined;
    canonicalFen: string;
    repertoireSide:
      | PreferredMoveAuthoritySide
      | "w"
      | "b"
      | "unknown"
      | null
      | undefined;
  },
  index: PreferredMoveAuthorityIndex = DEFAULT_INDEX,
): PreferredMoveAuthorityEntry | null {
  const key = buildPreferredMoveAuthorityKey(input);
  if (!key) return null;
  const map = index === DEFAULT_INDEX ? DEFAULT_ENTRY_MAP : entryMap(index);
  return map.get(key) ?? null;
}

export function selectPreferredContinuation<T extends { uci: string }>(
  input: {
    openingId: string | null | undefined;
    canonicalFen: string;
    repertoireSide:
      | PreferredMoveAuthoritySide
      | "w"
      | "b"
      | "unknown"
      | null
      | undefined;
    candidates: readonly T[];
    index?: PreferredMoveAuthorityIndex;
  },
): PreferredContinuationSelection<T> {
  const index = input.index ?? DEFAULT_INDEX;
  if (!hasPreferredMoveAuthorityOpening(input.openingId, index)) {
    return { status: "authority_not_indexed" };
  }
  const key = buildPreferredMoveAuthorityKey(input);
  if (!key) return { status: "preferred_missing", key: "" };
  const entry = getPreferredMoveAuthorityEntry(
    {
      openingId: input.openingId,
      canonicalFen: input.canonicalFen,
      repertoireSide: input.repertoireSide,
    },
    index,
  );
  if (!entry) return { status: "preferred_missing", key };
  const selected = input.candidates.find(
    (candidate) => normalizeUci(candidate.uci) === entry.selectedUci,
  );
  if (!selected) {
    return {
      status: "preferred_not_in_candidates",
      key,
      selectedUci: entry.selectedUci,
    };
  }
  return { status: "selected", selected, entry };
}

export function selectApprovedStockfishTopTwoMove(input: {
  approvedCandidateUcis: readonly string[];
  topMoves: readonly StockfishTopTwoLine[];
}): StockfishTopTwoLine | null {
  const approved = new Set(input.approvedCandidateUcis.map(normalizeUci));
  return (
    [...input.topMoves]
      .filter((line) => line.rank === 1 || line.rank === 2)
      .sort((left, right) => left.rank - right.rank)
      .find((line) => approved.has(normalizeUci(line.uci))) ?? null
  );
}

export function isPreferredMoveForAuthority(input: {
  openingId: string | null | undefined;
  canonicalFen: string;
  repertoireSide:
    | PreferredMoveAuthoritySide
    | "w"
    | "b"
    | "unknown"
    | null
    | undefined;
  expectedMoveUci: string | null | undefined;
}): boolean {
  if (!hasPreferredMoveAuthorityOpening(input.openingId)) return true;
  const entry = getPreferredMoveAuthorityEntry(input);
  return Boolean(entry && entry.selectedUci === normalizeUci(input.expectedMoveUci));
}

export function getPreferredMoveAuthorityIndexSummary() {
  return {
    schemaVersion: DEFAULT_INDEX.schemaVersion,
    authorityKey: DEFAULT_INDEX.authorityKey,
    stockfishVersion: DEFAULT_INDEX.engine.version,
    stockfishDepth: DEFAULT_INDEX.engine.depth,
    counts: DEFAULT_INDEX.counts,
    generatedAt: DEFAULT_INDEX.generatedAt,
    runtime: DEFAULT_INDEX.runtime,
    artifactPath: "lib/blundr/openings/preferredMoveAuthority.generated.json",
  };
}
