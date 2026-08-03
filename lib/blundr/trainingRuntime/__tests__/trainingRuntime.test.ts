import assert from "node:assert/strict";
import test from "node:test";
import { buildCandidateIndex } from "../buildCandidateIndex";
import { buildTranspositionGroups } from "../buildTranspositionGroups";
import { validateCandidateMoves } from "../validateCandidateMoves";
import { validateOpeningNodes } from "../validateOpeningNodes";
import { appendRuntimeMove } from "../runtimePlayKey";
const nodes = [
  {
    nodeId: "a",
    openingId: "test",
    playKey: "e2e4",
    playSequenceUci: "e2e4",
    ply: 1,
    sideToMove: "black" as const,
  },
  {
    nodeId: "b",
    openingId: "test",
    playKey: "e2e4,e7e5",
    playSequenceUci: "e2e4,e7e5",
    ply: 2,
    sideToMove: "white" as const,
  },
];
test("runtime validation accepts legal nodes and rejects illegal candidates", () => {
  const validNodes = validateOpeningNodes(nodes);
  assert.equal(validNodes.accepted.length, 2);
  const candidates = validateCandidateMoves(
    [
      { openingId: "test", playKeyBefore: "e2e4", moveUci: "e7e5" },
      { openingId: "test", playKeyBefore: "e2e4", moveUci: "e1e8" },
    ],
    validNodes.accepted,
  );
  assert.equal(candidates.accepted.length, 1);
  assert.equal(candidates.rejected[0].reason, "illegal_move");
});
test("runtime indexes are deterministic and transpositions require distinct routes", () => {
  assert.deepEqual(
    buildCandidateIndex([
      { openingId: "test", playKeyBefore: "e2e4", moveUci: "g1f3", rank: 2 },
      { openingId: "test", playKeyBefore: "e2e4", moveUci: "d2d4", rank: 1 },
    ])
      .get("test:e2e4")
      ?.map((candidate) => candidate.moveUci),
    ["d2d4", "g1f3"],
  );
  assert.equal(buildTranspositionGroups(nodes).length, 0);
});

test("authoritative JSONL aliases preserve canonical startpos and ply translation", () => {
  const sourceNodes = validateOpeningNodes([
    {
      nodeId: "root",
      openingId: "test",
      learnerPerspective: "white",
      playKey: "startpos",
      playSequenceUci: "",
      ply: 0,
      sideToMove: "white",
      profileId: "profile",
    },
  ]);
  assert.equal(sourceNodes.rejected.length, 0);
  assert.equal(sourceNodes.accepted[0].playKey, "startpos");
  assert.equal(sourceNodes.accepted[0].playSequenceUci, "");
  const sourceCandidates = validateCandidateMoves(
    [
      {
        nodeId: "root",
        openingId: "test",
        playKey: "startpos",
        uci: "e2e4",
        san: "e4",
        ply: 0,
        sideToMove: "white",
        profileId: "profile",
        source: "lichess",
        totalGames: 1_000,
        playPct: 0.5,
        learnerToMove: true,
        isBookCandidate: true,
      },
    ],
    sourceNodes.accepted,
  );
  assert.equal(sourceCandidates.rejected.length, 0);
  assert.equal(sourceCandidates.accepted[0].playKeyBefore, "startpos");
  assert.equal(sourceCandidates.accepted[0].moveUci, "e2e4");
  assert.equal(appendRuntimeMove("startpos", "e2e4"), "e2e4");
  assert.equal(Number(sourceCandidates.accepted[0].ply) + 1, 1);
});
