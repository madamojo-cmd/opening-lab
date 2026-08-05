import { readdir } from "node:fs/promises";
import { join } from "node:path";

const EXCLUDED_DEFAULT_ROOTS = [
  "tests/architecture",
  "tests/integration",
  "tests/security",
  "tests/e2e",
];

export async function discoverUnitTests({ root, explicitRoots = [] }) {
  const testRoots = explicitRoots.length > 0 ? explicitRoots : ["lib", "tests"];

  async function collect(directory) {
    if (
      explicitRoots.length === 0 &&
      EXCLUDED_DEFAULT_ROOTS.some(
        (prefix) => directory === prefix || directory.startsWith(`${prefix}/`),
      )
    ) {
      return [];
    }
    const entries = await readdir(join(root, directory), {
      withFileTypes: true,
    });
    const files = [];
    for (const entry of entries) {
      const path = join(directory, entry.name).replaceAll("\\", "/");
      if (entry.isDirectory()) files.push(...(await collect(path)));
      else if (/\.(test|spec)\.ts$/.test(entry.name)) {
        if (
          explicitRoots.length === 0 &&
          entry.name === "dailyMiniGameGeneratorDepth.test.ts"
        )
          continue;
        files.push(path);
      }
    }
    return files;
  }

  return (await Promise.all(testRoots.map(collect))).flat().sort();
}
