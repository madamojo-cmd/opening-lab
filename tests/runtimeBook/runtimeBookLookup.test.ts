import assert from "node:assert/strict";

import { buildStage2RuntimeBookIndex, getRuntimeBookMoves, loadStage2RuntimeBook } from "../../lib/blundr/runtimeBook";

const EXPECTED_OPENING_IDS = [
  "caro-kann-black",
  "colle-white",
  "english-white",
  "french-black",
  "italian-black",
  "italian-white",
  "kings-indian-black",
  "london-white",
  "nimzo-indian-black",
  "petroff-black",
  "pirc-black",
  "qgd-black",
  "queens-gambit-white",
  "queens-indian-black",
  "reti-white",
  "ruy-lopez-white",
  "scandinavian-black",
  "scotch-white",
  "sicilian-black",
  "slav-black",
  "vienna-white",
].sort();

const ROOT_SMOKE_OPENINGS = ["english-white", "london-white", "sicilian-black", "caro-kann-black"];

function moveGroupSortIsValid(moves: Array<{ rank?: number; totalGames?: number }>): boolean {
  for (let i = 1; i < moves.length; i += 1) {
    const prev = moves[i - 1];
    const curr = moves[i];
    const prevRank = typeof prev.rank === "number" ? prev.rank : Number.POSITIVE_INFINITY;
    const currRank = typeof curr.rank === "number" ? curr.rank : Number.POSITIVE_INFINITY;
    if (currRank < prevRank) return false;
    if (currRank === prevRank) {
      const prevGames = typeof prev.totalGames === "number" ? prev.totalGames : Number.NEGATIVE_INFINITY;
      const currGames = typeof curr.totalGames === "number" ? curr.totalGames : Number.NEGATIVE_INFINITY;
      if (currGames > prevGames) return false;
    }
  }
  return true;
}

function minPlayKeyBeforeForOpening(openingId: string, keys: string[]): string | null {
  const openingPrefix = `${openingId}::`;
  const openingKeys = keys.filter((key) => key.startsWith(openingPrefix));
  if (openingKeys.length === 0) return null;
  const parsed = openingKeys.map((key) => {
    const playKeyBefore = key.slice(openingPrefix.length);
    const length = playKeyBefore.split(",").filter(Boolean).length;
    return { playKeyBefore, length };
  });
  parsed.sort((a, b) => a.length - b.length || a.playKeyBefore.localeCompare(b.playKeyBefore));
  return parsed[0]?.playKeyBefore ?? null;
}

async function testRuntimeBookLookup(): Promise<void> {
  const loaded = await loadStage2RuntimeBook();
  const index = buildStage2RuntimeBookIndex(loaded);

  assert.equal(index.nodeCount, 49_232, "node_count_mismatch");
  assert.equal(index.moveCount, 116_508, "move_count_mismatch");
  assert.deepEqual(index.openingIds, EXPECTED_OPENING_IDS, "opening_ids_mismatch");

  for (const openingId of EXPECTED_OPENING_IDS) {
    assert.equal(index.maxPlyByOpening[openingId], 12, `max_ply_mismatch:${openingId}`);
  }

  const moveGroupKeys = [...index.moveIndexByOpeningAndPlayKeyBefore.keys()];
  for (const openingId of ROOT_SMOKE_OPENINGS) {
    const playKeyBefore = minPlayKeyBeforeForOpening(openingId, moveGroupKeys);
    assert.equal(Boolean(playKeyBefore), true, `missing_opening_move_groups:${openingId}`);
    const candidates = getRuntimeBookMoves(index, { openingId, playKeyBefore: playKeyBefore! });
    assert.equal(candidates.length > 0, true, `missing_root_candidates:${openingId}`);
  }

  const sampleOpening = "caro-kann-black";
  const samplePlayKeyBefore = minPlayKeyBeforeForOpening(sampleOpening, moveGroupKeys);
  assert.equal(Boolean(samplePlayKeyBefore), true, "sample_playkey_missing");
  const sampleQuery = { openingId: sampleOpening, playKeyBefore: samplePlayKeyBefore! };
  const sampleMovesA = getRuntimeBookMoves(index, sampleQuery);
  const sampleMovesB = getRuntimeBookMoves(index, sampleQuery);

  assert.equal(sampleMovesA.length > 0, true, "sample_candidates_missing");
  assert.equal(moveGroupSortIsValid(sampleMovesA), true, "sample_candidates_not_sorted");
  assert.deepEqual(sampleMovesA, sampleMovesB, "candidate_order_not_stable");

  const sourceGroup = index.moveIndexByOpeningAndPlayKeyBefore.get(`${sampleOpening}::${samplePlayKeyBefore!}`) ?? [];
  assert.equal(sourceGroup.length > 0, true, "source_group_missing");
  const fromQuery = sampleMovesA[0];
  const fromIndex = sourceGroup[0];
  assert.equal(fromQuery.openingId, fromIndex.openingId, "metadata_opening_id_not_preserved");
  assert.equal(fromQuery.playKeyBefore, fromIndex.playKeyBefore, "metadata_playkeybefore_not_preserved");
  assert.equal(fromQuery.moveUci, fromIndex.moveUci, "metadata_moveuci_not_preserved");
  assert.equal(fromQuery.rank, fromIndex.rank, "metadata_rank_not_preserved");
  assert.equal(fromQuery.totalGames, fromIndex.totalGames, "metadata_totalgames_not_preserved");
  assert.equal(fromQuery.playPct, fromIndex.playPct, "metadata_playpct_not_preserved");

  assert.deepEqual(
    getRuntimeBookMoves(index, { openingId: "nonexistent-opening", playKeyBefore: "e2e4" }),
    [],
    "unknown_opening_must_return_empty",
  );
  assert.deepEqual(
    getRuntimeBookMoves(index, { openingId: "caro-kann-black", playKeyBefore: "unknown-playkey-before" }),
    [],
    "unknown_playkey_before_must_return_empty",
  );
}

testRuntimeBookLookup()
  .then(() => {
    console.log("runtimeBookLookup ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
