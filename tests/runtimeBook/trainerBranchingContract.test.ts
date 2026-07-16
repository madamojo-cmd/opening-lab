import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateTrainerBranchingContract } from "../../lib/blundr/trainingRuntime/trainerBranchingContract";

const root = "data/blundr/stage2-21-opening-stepdown-runtime-v1/runtime/";
const read = (file: string) => readFileSync(root + file, "utf8").trim().split("\n").map(JSON.parse);
const nodes = read("opening-book.nodes.runtime.v1.jsonl");
const candidates = read("opening-book.moves.runtime.v1.jsonl");
const first = validateTrainerBranchingContract(nodes, candidates);
const shuffled = validateTrainerBranchingContract([...nodes].reverse(), [...candidates].reverse());
assert.equal(first.nodes, 49232);
assert.equal(first.roots, 21);
assert.equal(first.edges, 49211);
assert.equal(first.terminalOpenings, 21);
assert.deepEqual(first, shuffled);
assert.deepEqual(first.issues, []);
console.log("trainerBranchingContract.test.ts passed");
