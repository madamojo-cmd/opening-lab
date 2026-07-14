import assert from "node:assert/strict";
import test from "node:test";
import { buildCandidateIndex } from "../buildCandidateIndex";
import { buildTranspositionGroups } from "../buildTranspositionGroups";
import { validateCandidateMoves } from "../validateCandidateMoves";
import { validateOpeningNodes } from "../validateOpeningNodes";
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
