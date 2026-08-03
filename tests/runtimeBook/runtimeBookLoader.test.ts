import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { loadStage2RuntimeBook } from "../../lib/blundr/runtimeBook";
import { TRAINING_RUNTIME_FILES, TRAINING_RUNTIME_PACKAGE_ROOT } from "../../lib/blundr/trainingRuntime/trainingRuntimeSchema";

const packageRoot = path.resolve(TRAINING_RUNTIME_PACKAGE_ROOT);

test("runtime book loads only the checksum-verified canonical package", async () => {
  const tempRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "blundr-runtimebook-loader-"),
  );
  try {
    for (const file of Object.values(TRAINING_RUNTIME_FILES)) {
      fs.copyFileSync(path.join(packageRoot, file), path.join(tempRoot, file));
    }
    fs.writeFileSync(path.join(tempRoot, "reference-only.csv"), "ignored");
    const result = await loadStage2RuntimeBook({ packageRoot: tempRoot });
    assert.equal(result.nodes.length, 8_111);
    assert.equal(result.moves.length, 8_090);
    assert.equal(new Set(result.nodes.map((node) => node.openingId)).size, 21);
    assert.equal(result.nodeFilePath.endsWith(".jsonl"), true);
    assert.equal(result.moveFilePath.endsWith(".jsonl"), true);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
