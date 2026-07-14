import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { glob } from "node:fs/promises";

async function main() {
  const files = [];
  for await (const file of glob("{app,components,lib}/**/*.{ts,tsx}", {
    exclude: (entry) => entry.includes("node_modules"),
  })) {
    files.push(file);
  }
  for (const file of files) {
    const source = await readFile(file, "utf8");
    assert.equal(
      /opening-nodes|candidate-moves/.test(source),
      false,
      `forbidden_external_dataset_import:${file}`,
    );
  }
  console.log(`security baseline scanned ${files.length} source files`);
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
