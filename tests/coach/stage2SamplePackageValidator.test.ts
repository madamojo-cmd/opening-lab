import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { validateCopyBundle } from "../../lib/blundr/stage2/validation/validateCopyBundle";
import { validateCrawlBundle } from "../../lib/blundr/stage2/validation/validateCrawlBundle";

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const SAMPLE_DIR = path.join(REPO_ROOT, "tests", "fixtures", "stage2", "sample");
const CRAWL_PATH = path.join(SAMPLE_DIR, "sample-crawl-bundle.json");
const COPY_PATH = path.join(SAMPLE_DIR, "sample-copy-bundle.json");

function loadJson(filePath: string): any {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function listTsFiles(baseDir: string): string[] {
  const out: string[] = [];
  const stack = [baseDir];
  while (stack.length > 0) {
    const dir = stack.pop();
    if (!dir) continue;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.isFile() && /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) {
        out.push(fullPath);
      }
    }
  }
  return out;
}

export function testStage2SamplePackageValidator(): void {
  // Load only sample fixtures.
  const fixtureFiles = fs.readdirSync(SAMPLE_DIR).sort();
  assert.deepEqual(fixtureFiles, ["sample-copy-bundle.json", "sample-crawl-bundle.json"]);

  const crawlBundle = loadJson(CRAWL_PATH);
  const copyBundle = loadJson(COPY_PATH);

  const crawlResult = validateCrawlBundle(crawlBundle);
  assert.equal(crawlResult.ok, true, `crawl_errors=${JSON.stringify(crawlResult.errors)}`);

  const copyResult = validateCopyBundle(copyBundle);
  assert.equal(copyResult.ok, true, `copy_errors=${JSON.stringify(copyResult.errors)}`);

  // Cross-reference: opening/node/move pointers must resolve.
  const openingSet = new Set<string>((crawlBundle.openingIds ?? []).map((x: any) => String(x)));
  const nodeSet = new Set<string>();
  const candidateByNode = new Map<string, Set<string>>();

  for (const node of crawlBundle.nodes ?? []) {
    nodeSet.add(String(node.nodeKey));
  }

  for (const candidate of crawlBundle.candidateMoves ?? []) {
    const nodeKey = String(candidate.nodeKey);
    const moveUci = String(candidate.moveUci);
    if (!candidateByNode.has(nodeKey)) candidateByNode.set(nodeKey, new Set<string>());
    candidateByNode.get(nodeKey)!.add(moveUci);
  }

  for (const entry of copyBundle.entries ?? []) {
    if (entry.openingId != null) {
      assert.equal(openingSet.has(String(entry.openingId)), true, `missing_opening:${entry.entryId}`);
    }
    if (entry.nodeKey != null) {
      assert.equal(nodeSet.has(String(entry.nodeKey)), true, `missing_node:${entry.entryId}`);
    }
    if (entry.nodeKey != null && entry.moveUci != null) {
      const moves = candidateByNode.get(String(entry.nodeKey));
      assert.equal(Boolean(moves && moves.has(String(entry.moveUci))), true, `missing_move:${entry.entryId}`);
    }
  }

  // Sample fixture location/name constraints.
  assert.equal(CRAWL_PATH.includes(`${path.sep}tests${path.sep}fixtures${path.sep}stage2${path.sep}sample${path.sep}`), true);
  assert.equal(COPY_PATH.includes(`${path.sep}tests${path.sep}fixtures${path.sep}stage2${path.sep}sample${path.sep}`), true);

  for (const fileName of fixtureFiles) {
    const lowered = fileName.toLowerCase();
    assert.equal(/latest|canonical|approved|v1/.test(lowered), false, `forbidden_fixture_filename:${fileName}`);
  }

  // Synthetic IDs in sample copy must be prefixed sample_.
  for (const entry of copyBundle.entries ?? []) {
    assert.equal(typeof entry.entryId === "string" && entry.entryId.startsWith("sample_"), true, `bad_entry_id:${entry.entryId}`);
    if (Array.isArray(entry.evidenceIds)) {
      for (const evidenceId of entry.evidenceIds) {
        assert.equal(typeof evidenceId === "string" && evidenceId.startsWith("sample_"), true, `bad_evidence_id:${String(evidenceId)}`);
      }
    }
  }

  // Runtime modules and app/page.tsx must not import sample fixtures.
  const runtimeFiles = [...listTsFiles(path.join(REPO_ROOT, "lib")), ...listTsFiles(path.join(REPO_ROOT, "app"))];
  for (const runtimeFile of runtimeFiles) {
    const content = fs.readFileSync(runtimeFile, "utf8");
    assert.equal(/tests\/fixtures\/stage2\/sample/.test(content), false, `runtime_imports_sample_fixture:${runtimeFile}`);
    assert.equal(/imports\/stage2-sample/.test(content), false, `runtime_imports_sample_data:${runtimeFile}`);
  }

  const appPagePath = path.join(REPO_ROOT, "app", "page.tsx");
  const appPageContent = fs.readFileSync(appPagePath, "utf8");
  assert.equal(/tests\/fixtures\/stage2\/sample/.test(appPageContent), false, "app_page_imports_sample_fixture");
  assert.equal(/imports\/stage2-sample/.test(appPageContent), false, "app_page_imports_sample_data");
}

testStage2SamplePackageValidator();
console.log("stage2SamplePackageValidator ok");
