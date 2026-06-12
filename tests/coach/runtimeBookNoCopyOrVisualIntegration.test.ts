import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const RUNTIME_BOOK_DIR = path.join(REPO_ROOT, "lib", "blundr", "runtimeBook");
const RUNTIME_BOOK_ROUTE = path.join(REPO_ROOT, "app", "api", "runtime-book", "candidates", "route.ts");
const APP_PAGE = path.join(REPO_ROOT, "app", "page.tsx");

function listCodeFiles(baseDir: string): string[] {
  const out: string[] = [];
  const stack = [baseDir];
  while (stack.length > 0) {
    const dir = stack.pop();
    if (!dir) continue;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile() && /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) out.push(full);
    }
  }
  return out.sort();
}

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

export function testRuntimeBookNoCopyOrVisualIntegration(): void {
  assert.equal(fs.existsSync(RUNTIME_BOOK_ROUTE), true, "runtime_book_candidates_route_missing");

  const appPage = fs.readFileSync(APP_PAGE, "utf8");
  assert.equal(/\/api\/runtime-book\/candidates/.test(appPage), true, "app_page_missing_runtime_book_api_seam");
  assert.equal(/lib\/blundr\/runtimeBook/.test(appPage), false, "app_page_must_not_import_fs_runtime_loader");

  const forbiddenImportSpecifiers = [
    "tests/fixtures",
    "imports/stage2-sample",
    "stage2/sample",
    "visualrecipe",
    "livecoach",
    "coachdecisionengine",
    "stockfish",
    "maia",
    "continuedplay",
    "normalized",
    "full-crawl",
  ];

  const files = listCodeFiles(RUNTIME_BOOK_DIR).concat(RUNTIME_BOOK_ROUTE);
  for (const filePath of files) {
    const content = fs.readFileSync(filePath, "utf8");
    const specs = importSpecifiers(content).map((s) => s.toLowerCase());
    for (const forbidden of forbiddenImportSpecifiers) {
      const hit = specs.some((spec) => spec.includes(forbidden));
      assert.equal(hit, false, `runtime_book_forbidden_import:${path.basename(filePath)}:${forbidden}`);
    }
    assert.equal(/tests\/fixtures|imports\/stage2-sample/.test(content), false, `runtime_book_references_sample_fixtures:${filePath}`);
  }
}

testRuntimeBookNoCopyOrVisualIntegration();
console.log("runtimeBookNoCopyOrVisualIntegration ok");
