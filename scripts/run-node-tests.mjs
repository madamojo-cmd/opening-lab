import { readdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { join, relative, resolve } from "node:path";

const root = resolve(process.cwd());
const explicitRoots = process.argv.slice(2);
const testRoots = explicitRoots.length > 0 ? explicitRoots : ["lib", "tests"];
const shardCount = Number.parseInt(
  process.env.BLUNDR_TEST_SHARD_COUNT ?? "1",
  10,
);
const shardIndex = Number.parseInt(
  process.env.BLUNDR_TEST_SHARD_INDEX ?? "0",
  10,
);

if (!Number.isInteger(shardCount) || shardCount < 1) {
  throw new Error("BLUNDR_TEST_SHARD_COUNT must be a positive integer");
}
if (
  !Number.isInteger(shardIndex) ||
  shardIndex < 0 ||
  shardIndex >= shardCount
) {
  throw new Error("BLUNDR_TEST_SHARD_INDEX must be within the shard count");
}

function stableShard(path) {
  let hash = 2166136261;
  for (const character of path) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % shardCount;
}

async function collect(directory) {
  if (
    explicitRoots.length === 0 &&
    ["tests/integration", "tests/security", "tests/e2e"].some(
      (prefix) => directory === prefix || directory.startsWith(`${prefix}/`),
    )
  ) {
    return [];
  }
  const entries = await readdir(join(root, directory), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
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

const discoveredFiles = (await Promise.all(testRoots.map(collect)))
  .flat()
  .sort();
const files = discoveredFiles.filter(
  (file) => stableShard(file) === shardIndex,
);
if (files.length === 0) {
  console.error("No unit test files were discovered for this shard.");
  process.exit(1);
}

if (explicitRoots.length === 0) {
  console.log(
    "Unit runner excludes the exhaustive dailyMiniGameGeneratorDepth gate; run npm run test:mini-game-depth.",
  );
}
if (shardCount > 1) {
  console.log(
    `Unit shard ${shardIndex + 1}/${shardCount}: ${files.length}/${discoveredFiles.length} files (stable FNV partition).`,
  );
}

const child = spawn(
  process.execPath,
  [
    "--preserve-symlinks",
    "--import",
    "tsx",
    "--test",
    "--test-concurrency=1",
    ...files.map((file) => relative(root, file)),
  ],
  { stdio: "inherit" },
);
child.on("exit", (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
