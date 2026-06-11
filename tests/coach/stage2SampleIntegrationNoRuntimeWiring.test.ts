import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const SAMPLE_MODULE_DIR = path.join(REPO_ROOT, "lib", "blundr", "stage2", "sample");

const SAMPLE_FILES = [
  "sampleStage2Types.ts",
  "selectSampleStage2Copy.ts",
  "buildSampleStage2Packet.ts",
  "index.ts",
].map((name) => path.join(SAMPLE_MODULE_DIR, name));

const FORBIDDEN_IMPORT_SPECIFIERS = [
  "react",
  "next",
  "maia",
  "stockfish",
  "livecoach",
  "visualrecipe",
  "coachdecisionengine",
  "coachexplanationpipeline",
  "tests/fixtures",
  "sample-crawl-bundle",
  "sample-copy-bundle",
  "app/page",
];

function importSpecifiers(content: string): string[] {
  const out: string[] = [];
  const re = /\bfrom\s+["']([^"']+)["']/g;
  let match: RegExpExecArray | null = re.exec(content);
  while (match) {
    out.push(match[1]);
    match = re.exec(content);
  }
  return out;
}

function listCodeFiles(baseDir: string): string[] {
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

export function testStage2SampleIntegrationNoRuntimeWiring(): void {
  const appPagePath = path.join(REPO_ROOT, "app", "page.tsx");
  const appPage = fs.readFileSync(appPagePath, "utf8");
  assert.equal(/lib\/blundr\/stage2\/sample/.test(appPage), false, "app_page_imports_sample_harness");

  for (const filePath of SAMPLE_FILES) {
    const content = fs.readFileSync(filePath, "utf8");
    const specs = importSpecifiers(content).map((s) => s.toLowerCase());

    for (const forbidden of FORBIDDEN_IMPORT_SPECIFIERS) {
      const hit = specs.some((spec) => spec.includes(forbidden));
      assert.equal(hit, false, `forbidden_import_in_${path.basename(filePath)}:${forbidden}`);
    }

    assert.equal(/readFileSync\(|readFile\(|writeFileSync\(|writeFile\(/.test(content), false, `sample_harness_reads_or_writes_files:${path.basename(filePath)}`);
    assert.equal(/tests\/fixtures\/stage2\/sample/.test(content), false, `sample_harness_imports_fixture_path:${path.basename(filePath)}`);
  }

  const runtimeFiles = [...listCodeFiles(path.join(REPO_ROOT, "app")), ...listCodeFiles(path.join(REPO_ROOT, "lib"))];
  for (const filePath of runtimeFiles) {
    const content = fs.readFileSync(filePath, "utf8");
    assert.equal(/tests\/fixtures\/stage2\/sample/.test(content), false, `runtime_module_imports_sample_fixture:${filePath}`);
  }

  const nonTestFiles = [...listCodeFiles(path.join(REPO_ROOT, "app")), ...listCodeFiles(path.join(REPO_ROOT, "lib"))];
  for (const filePath of nonTestFiles) {
    const content = fs.readFileSync(filePath, "utf8");
    assert.equal(/sample-crawl-bundle\.json|sample-copy-bundle\.json/.test(content), false, `non_test_references_sample_fixture:${filePath}`);
  }
}

testStage2SampleIntegrationNoRuntimeWiring();
console.log("stage2SampleIntegrationNoRuntimeWiring ok");
