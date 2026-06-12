import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const APP_PAGE = path.join(REPO_ROOT, "app", "page.tsx");
const RUNTIME_BOOK_DIR = path.join(REPO_ROOT, "lib", "blundr", "runtimeBook");
const LIB_DIR = path.join(REPO_ROOT, "lib", "blundr");

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

export function testRuntimeBookNoRuntimeWiring(): void {
  const appPageContent = fs.readFileSync(APP_PAGE, "utf8");
  assert.equal(/lib\/blundr\/runtimeBook/.test(appPageContent), false, "app_page_imports_runtime_book");

  const runtimeBookFiles = listCodeFiles(RUNTIME_BOOK_DIR);
  const forbiddenRuntimeBookImports = [
    "react",
    "next",
    "stockfish",
    "maia",
    "continuation",
    "continuedplay",
    "livecoach",
    "tests/fixtures",
  ];

  for (const filePath of runtimeBookFiles) {
    const content = fs.readFileSync(filePath, "utf8");
    const specs = importSpecifiers(content).map((spec) => spec.toLowerCase());
    for (const forbidden of forbiddenRuntimeBookImports) {
      const hit = specs.some((spec) => spec.includes(forbidden));
      assert.equal(hit, false, `runtime_book_forbidden_import:${path.basename(filePath)}:${forbidden}`);
    }
  }

  const allLibFiles = listCodeFiles(LIB_DIR);
  for (const filePath of allLibFiles) {
    if (filePath.includes(`${path.sep}runtimeBook${path.sep}`)) continue;
    if (!/(coach|liveCoach|runtime|continuedPlay)/.test(filePath)) continue;
    const content = fs.readFileSync(filePath, "utf8");
    assert.equal(
      /runtimeBook/.test(content),
      false,
      `coach_runtime_files_must_not_import_runtime_book_yet:${filePath}`,
    );
  }
}

testRuntimeBookNoRuntimeWiring();
console.log("runtimeBookNoRuntimeWiring ok");
