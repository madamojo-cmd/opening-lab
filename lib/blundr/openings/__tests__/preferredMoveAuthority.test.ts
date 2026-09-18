import assert from "node:assert/strict";

import {
  buildPreferredMoveAuthorityKey,
  selectApprovedStockfishTopTwoMove,
  selectPreferredContinuation,
  type PreferredMoveAuthorityIndex,
} from "../preferredMoveAuthority";

const fen4 = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -";

function index(entries: PreferredMoveAuthorityIndex["entries"]): PreferredMoveAuthorityIndex {
  return {
    schemaVersion: "blundr-preferred-move-authority.v1",
    authorityKey: "openingId+canonicalFen4+repertoireSide",
    engine: { name: "stockfish", version: "18.0.7", depth: 10, multiPv: 2 },
    runtime: { packageId: "fixture", schemaVersion: "fixture", sourceFiles: {} },
    generatedAt: "2026-08-03T00:00:00.000Z",
    counts: {
      positionGroupsAnalyzed: entries.length,
      rankOneSelections: entries.filter((entry) => entry.stockfishRank === 1).length,
      rankTwoSelections: entries.filter((entry) => entry.stockfishRank === 2).length,
      omittedNoApprovedMatch: 0,
      illegalOrMalformedGroups: 0,
      duplicateCandidatesCollapsed: 0,
    },
    openings: [...new Set(entries.map((entry) => entry.openingId))].sort(),
    entries,
  };
}

export function testPreferredMoveAuthority(): void {
  const key = buildPreferredMoveAuthorityKey({
    openingId: "italian-white",
    canonicalFen: fen4,
    repertoireSide: "white",
  });
  assert.equal(
    key,
    "italian-white|rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -|white",
  );

  assert.deepEqual(
    selectApprovedStockfishTopTwoMove({
      approvedCandidateUcis: ["e2e4", "d2d4"],
      topMoves: [
        { rank: 1, uci: "e2e4" },
        { rank: 2, uci: "d2d4" },
      ],
    }),
    { rank: 1, uci: "e2e4" },
  );
  assert.deepEqual(
    selectApprovedStockfishTopTwoMove({
      approvedCandidateUcis: ["d2d4"],
      topMoves: [
        { rank: 1, uci: "e2e4" },
        { rank: 2, uci: "d2d4" },
      ],
    }),
    { rank: 2, uci: "d2d4" },
  );
  assert.equal(
    selectApprovedStockfishTopTwoMove({
      approvedCandidateUcis: ["c2c4"],
      topMoves: [
        { rank: 1, uci: "e2e4" },
        { rank: 2, uci: "d2d4" },
      ],
    }),
    null,
  );

  const authority = index([
    {
      key: key!,
      openingId: "italian-white",
      canonicalFen4: fen4,
      repertoireSide: "white",
      selectedUci: "e2e4",
      stockfishRank: 1,
      approvedCandidateUcis: ["d2d4", "e2e4"],
      sourcePlayKeys: ["startpos"],
    },
  ]);
  const selected = selectPreferredContinuation({
    openingId: "italian-white",
    canonicalFen: fen4,
    repertoireSide: "white",
    candidates: [
      { uci: "d2d4", san: "d4" },
      { uci: "e2e4", san: "e4" },
    ],
    index: authority,
  });
  assert.equal(selected.status, "selected");
  if (selected.status === "selected") assert.equal(selected.selected.uci, "e2e4");
}

testPreferredMoveAuthority();
console.log("preferredMoveAuthority ok");
