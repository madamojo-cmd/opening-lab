import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateTrainerBranchingContract } from "../../lib/blundr/trainingRuntime/trainerBranchingContract";
import { createRuntimeEvidenceIndices } from "../../lib/blundr/trainingRuntime/runtimeEvidenceIndices";
import { TRAINING_RUNTIME_PACKAGE_ROOT } from "../../lib/blundr/trainingRuntime/trainingRuntimeSchema";

const root = TRAINING_RUNTIME_PACKAGE_ROOT + "/";
const read = (file: string) =>
  readFileSync(root + file, "utf8")
    .trim()
    .split("\n")
    .map(JSON.parse);
const nodes = read("opening-book.nodes.runtime.v1.jsonl");
const candidates = read("opening-book.candidates.runtime.v1.jsonl");
const first = validateTrainerBranchingContract(nodes, candidates);
const shuffled = validateTrainerBranchingContract(
  [...nodes].reverse(),
  [...candidates].reverse(),
);
assert.equal(first.nodes, 8111);
assert.equal(first.roots, 21);
assert.equal(first.edges, 8090);
assert.equal(first.terminalOpenings, 1);
assert.deepEqual(first, shuffled);
assert.deepEqual(first.issues, []);
const indices = createRuntimeEvidenceIndices(nodes, candidates);
for (const [parentKey, moves] of indices.trainer.childMovesByParent) {
  const parent = indices.trainer.nodesByKey.get(parentKey)!;
  for (const move of moves)
    assert.ok(
      indices.trainer.nodesByKey.has(
        `${move.openingId}:${parent.playKey === "startpos" ? move.moveUci : `${parent.playKey},${move.moveUci}`}`,
      ),
    );
}
for (const [parentKey, moves] of indices.daily.candidatesByParent) {
  const parent = indices.trainer.nodesByKey.get(parentKey);
  if (parent?.ply === 12)
    assert.equal(
      indices.trainer.childMovesByParent.get(parentKey)?.length ?? 0,
      0,
    );
  assert.ok(moves.length > 0);
}
console.log("trainerBranchingContract.test.ts passed");
