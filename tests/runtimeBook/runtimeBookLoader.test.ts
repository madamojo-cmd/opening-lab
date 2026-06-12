import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const PACKAGE_ROOT = path.join(REPO_ROOT, "data", "blundr", "stage2-21-opening-stepdown-runtime-v1");
const RUNTIME_DIR = path.join(PACKAGE_ROOT, "runtime");
const NODE_JSONL = path.join(RUNTIME_DIR, "opening-book.nodes.runtime.v1.jsonl");
const MOVE_JSONL = path.join(RUNTIME_DIR, "opening-book.moves.runtime.v1.jsonl");

function copyFile(source: string, target: string): void {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, fs.readFileSync(source));
}

async function testRuntimeBookLoader(): Promise<void> {
  assert.equal(fs.existsSync(NODE_JSONL), true, "node_jsonl_missing");
  assert.equal(fs.existsSync(MOVE_JSONL), true, "move_jsonl_missing");

  const fsModule = await import("node:fs");
  const originalCreateReadStream = fsModule.default.createReadStream;
  const importReadPaths: string[] = [];
  (fsModule.default as any).createReadStream = (...args: any[]) => {
    importReadPaths.push(String(args[0]));
    return originalCreateReadStream.apply(fsModule.default, args as [any, any]);
  };

  const runtimeBook = await import("../../lib/blundr/runtimeBook");

  (fsModule.default as any).createReadStream = originalCreateReadStream;
  assert.equal(importReadPaths.length, 0, "runtime_book_module_auto_load_detected");

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "blundr-runtimebook-loader-"));
  const tempPackageRoot = path.join(tempRoot, "runtime-package");
  const tempRuntimeDir = path.join(tempPackageRoot, "runtime");
  copyFile(NODE_JSONL, path.join(tempRuntimeDir, "opening-book.nodes.runtime.v1.jsonl"));
  copyFile(MOVE_JSONL, path.join(tempRuntimeDir, "opening-book.moves.runtime.v1.jsonl"));
  fs.writeFileSync(path.join(tempPackageRoot, "normalized-full-crawl.json"), "{not-valid-json");
  fs.writeFileSync(path.join(tempRuntimeDir, "opening-book.nodes.runtime.v1.csv"), "should-not-be-read");

  const loadReadPaths: string[] = [];
  (fsModule.default as any).createReadStream = (...args: any[]) => {
    loadReadPaths.push(path.resolve(String(args[0])));
    return originalCreateReadStream.apply(fsModule.default, args as [any, any]);
  };

  const result = await runtimeBook.loadStage2RuntimeBook({ packageRoot: tempPackageRoot });

  (fsModule.default as any).createReadStream = originalCreateReadStream;
  fs.rmSync(tempRoot, { recursive: true, force: true });

  assert.equal(result.nodes.length, 49_232, "node_count_mismatch");
  assert.equal(result.moves.length, 116_508, "move_count_mismatch");
  assert.equal(new Set(result.nodes.map((n) => n.openingId)).size, 21, "opening_count_mismatch");
  assert.equal(loadReadPaths.some((p) => p.endsWith(".csv")), false, "loader_must_not_read_csv");
  assert.equal(loadReadPaths.some((p) => /normalized|full.?crawl|crawl.?full/i.test(p)), false, "loader_must_not_read_normalized_data");
}

testRuntimeBookLoader()
  .then(() => {
    console.log("runtimeBookLoader ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
