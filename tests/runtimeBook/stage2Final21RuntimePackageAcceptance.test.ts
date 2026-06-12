import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const PACKAGE_DIR = path.join(REPO_ROOT, "data", "blundr", "stage2-21-opening-stepdown-runtime-v1");
const RUNTIME_DIR = path.join(PACKAGE_DIR, "runtime");
const NODE_JSONL = path.join(RUNTIME_DIR, "opening-book.nodes.runtime.v1.jsonl");
const MOVE_JSONL = path.join(RUNTIME_DIR, "opening-book.moves.runtime.v1.jsonl");

const EXPECTED_NODE_COUNT = 49_232;
const EXPECTED_MOVE_COUNT = 116_508;
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

function walkFiles(baseDir: string): string[] {
  const out: string[] = [];
  const stack = [baseDir];
  while (stack.length > 0) {
    const dir = stack.pop();
    if (!dir) continue;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile()) out.push(full);
    }
  }
  return out.sort();
}

async function readJsonl(filePath: string, onRow: (row: any) => void): Promise<void> {
  const stream = fs.createReadStream(filePath, "utf8");
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line.trim()) continue;
    onRow(JSON.parse(line));
  }
}

async function testStage2Final21RuntimePackageAcceptance(): Promise<void> {
  assert.equal(fs.existsSync(PACKAGE_DIR), true, "runtime_package_dir_missing");
  assert.equal(PACKAGE_DIR.toLowerCase().includes("all23"), false, "runtime_package_name_must_not_include_all23");
  assert.equal(fs.existsSync(NODE_JSONL), true, "node_jsonl_missing");
  assert.equal(fs.existsSync(MOVE_JSONL), true, "move_jsonl_missing");

  const packageFiles = walkFiles(PACKAGE_DIR);
  assert.equal(packageFiles.some((f) => f.toLowerCase().endsWith(".tgz")), false, "runtime_package_must_not_include_tgz");
  assert.equal(
    packageFiles.some((f) => /(normalized|full.?crawl|crawl.?full)/i.test(path.basename(f))),
    false,
    "runtime_package_must_not_include_normalized_or_full_crawl_files",
  );

  const nodeOpenings = new Set<string>();
  const nodeMaxPlyByOpening = new Map<string, number>();
  let nodeCount = 0;

  await readJsonl(NODE_JSONL, (row) => {
    nodeCount += 1;
    const openingId = String(row.openingId ?? "");
    nodeOpenings.add(openingId);
    const ply = Number(row.ply ?? 0);
    const current = nodeMaxPlyByOpening.get(openingId) ?? Number.NEGATIVE_INFINITY;
    if (ply > current) nodeMaxPlyByOpening.set(openingId, ply);
  });

  assert.equal(nodeCount, EXPECTED_NODE_COUNT, "node_count_mismatch");

  let moveCount = 0;
  let canCheckRankOrdering = false;
  const ranksByGroup = new Map<string, number[]>();
  const rootOpeningSmoke = new Map<string, boolean>();
  for (const openingId of ROOT_SMOKE_OPENINGS) rootOpeningSmoke.set(openingId, false);

  await readJsonl(MOVE_JSONL, (row) => {
    moveCount += 1;
    const openingId = String(row.openingId ?? "");
    if (rootOpeningSmoke.has(openingId) && row.runtimeCandidate === true) {
      rootOpeningSmoke.set(openingId, true);
    }

    if (
      typeof row.rank === "number" &&
      typeof row.playKeyBefore === "string" &&
      typeof row.openingId === "string"
    ) {
      canCheckRankOrdering = true;
      const group = `${row.openingId}::${row.playKeyBefore}`;
      const ranks = ranksByGroup.get(group) ?? [];
      ranks.push(row.rank);
      ranksByGroup.set(group, ranks);
    }
  });

  assert.equal(moveCount, EXPECTED_MOVE_COUNT, "runtime_move_count_mismatch");

  const openingIdsSorted = [...nodeOpenings].sort();
  assert.equal(openingIdsSorted.length, 21, "opening_count_mismatch");
  assert.deepEqual(openingIdsSorted, EXPECTED_OPENING_IDS, "opening_ids_mismatch");

  for (const openingId of EXPECTED_OPENING_IDS) {
    assert.equal(nodeMaxPlyByOpening.get(openingId), 12, `max_ply_mismatch:${openingId}`);
  }

  for (const openingId of ROOT_SMOKE_OPENINGS) {
    assert.equal(rootOpeningSmoke.get(openingId), true, `missing_runtime_candidate_smoke:${openingId}`);
  }

  if (canCheckRankOrdering) {
    for (const [group, ranks] of ranksByGroup) {
      for (let i = 1; i < ranks.length; i += 1) {
        assert.equal(ranks[i] >= ranks[i - 1], true, `rank_not_sorted:${group}`);
      }
    }
  }

  const tracked = execSync(
    "git ls-files data/blundr/stage2-21-opening-stepdown-runtime-v1/runtime/opening-book.nodes.runtime.v1.jsonl data/blundr/stage2-21-opening-stepdown-runtime-v1/runtime/opening-book.moves.runtime.v1.jsonl",
    { cwd: REPO_ROOT, encoding: "utf8" },
  )
    .split(/\r?\n/)
    .filter(Boolean);
  assert.equal(
    tracked.includes("data/blundr/stage2-21-opening-stepdown-runtime-v1/runtime/opening-book.nodes.runtime.v1.jsonl"),
    true,
    "node_jsonl_not_tracked",
  );
  assert.equal(
    tracked.includes("data/blundr/stage2-21-opening-stepdown-runtime-v1/runtime/opening-book.moves.runtime.v1.jsonl"),
    true,
    "move_jsonl_not_tracked",
  );
}

testStage2Final21RuntimePackageAcceptance()
  .then(() => {
    console.log("stage2Final21RuntimePackageAcceptance ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
