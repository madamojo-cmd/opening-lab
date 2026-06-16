import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

import { STAGE2_RUNTIME_OPENING_IDS, STAGE2_RUNTIME_PACKAGE_ID, STAGE2_RUNTIME_PACKAGE_ROOT } from "../../lib/blundr/openings/openingAvailability";

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const PACKAGE_DIR = path.join(REPO_ROOT, "data", "blundr", STAGE2_RUNTIME_PACKAGE_ID);
const NODE_JSONL = path.join(PACKAGE_DIR, "runtime", "opening-book.nodes.runtime.v1.jsonl");
const MOVE_JSONL = path.join(PACKAGE_DIR, "runtime", "opening-book.moves.runtime.v1.jsonl");

async function readJsonl(filePath: string, onRow: (row: any) => void): Promise<void> {
  const stream = fs.createReadStream(filePath, "utf8");
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line.trim()) continue;
    onRow(JSON.parse(line));
  }
}

async function testRuntimeCanonical21Openings(): Promise<void> {
  assert.equal(PACKAGE_DIR, path.join(REPO_ROOT, STAGE2_RUNTIME_PACKAGE_ROOT), "runtime_package_root_mismatch");
  assert.equal(fs.existsSync(PACKAGE_DIR), true, "runtime_package_dir_missing");
  assert.equal(fs.existsSync(NODE_JSONL), true, "runtime_node_jsonl_missing");
  assert.equal(fs.existsSync(MOVE_JSONL), true, "runtime_move_jsonl_missing");

  const packageFiles = fs.readdirSync(path.join(PACKAGE_DIR, "runtime"));
  assert.equal(packageFiles.includes("opening-nodes.latest.csv"), false, "stale_opening_nodes_latest_csv_present");
  assert.equal(packageFiles.includes("candidate-moves.latest.csv"), false, "stale_candidate_moves_latest_csv_present");

  const nodeOpenings = new Set<string>();
  const nodeCounts = new Map<string, number>();
  const moveCounts = new Map<string, number>();

  await readJsonl(NODE_JSONL, (row) => {
    const openingId = String(row.openingId ?? "");
    nodeOpenings.add(openingId);
    nodeCounts.set(openingId, (nodeCounts.get(openingId) ?? 0) + 1);
  });
  await readJsonl(MOVE_JSONL, (row) => {
    const openingId = String(row.openingId ?? "");
    moveCounts.set(openingId, (moveCounts.get(openingId) ?? 0) + 1);
  });

  const openingIds = [...nodeOpenings].sort();
  assert.deepEqual(openingIds, [...STAGE2_RUNTIME_OPENING_IDS].sort(), "runtime_opening_ids_mismatch");

  for (const openingId of STAGE2_RUNTIME_OPENING_IDS) {
    assert.equal((nodeCounts.get(openingId) ?? 0) > 0, true, `runtime_nodes_missing:${openingId}`);
    assert.equal((moveCounts.get(openingId) ?? 0) > 0, true, `runtime_moves_missing:${openingId}`);
  }
}

testRuntimeCanonical21Openings()
  .then(() => {
    console.log("runtimeCanonical21Openings ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
