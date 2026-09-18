import { spawn } from "node:child_process";
import { relative, resolve } from "node:path";
import { discoverUnitTests } from "./unit-test-discovery.mjs";

const root = resolve(process.cwd());
const cliArgs = process.argv.slice(2);
const shardArgument = cliArgs.find((argument) =>
  argument.startsWith("--shard="),
);
const listJson = cliArgs.includes("--list-json");
const explicitRoots = cliArgs.filter(
  (argument) => argument !== "--list-json" && !argument.startsWith("--shard="),
);
const shardMatch = shardArgument?.match(/^--shard=(\d+)\/(\d+)$/);
if (shardArgument && !shardMatch) {
  throw new Error("--shard must use the one-based INDEX/TOTAL form");
}
const shardCount = shardMatch
  ? Number.parseInt(shardMatch[2], 10)
  : Number.parseInt(process.env.BLUNDR_TEST_SHARD_COUNT ?? "1", 10);
const shardIndex = shardMatch
  ? Number.parseInt(shardMatch[1], 10) - 1
  : Number.parseInt(process.env.BLUNDR_TEST_SHARD_INDEX ?? "0", 10);

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

const discoveredFiles = await discoverUnitTests({ root, explicitRoots });
const files = discoveredFiles.filter(
  (_, index) => index % shardCount === shardIndex,
);
if (files.length === 0) {
  console.error("No unit test files were discovered for this shard.");
  process.exit(1);
}

if (listJson) {
  console.log(
    JSON.stringify({ shardIndex: shardIndex + 1, shardCount, files }),
  );
  process.exit(0);
}
if (explicitRoots.length === 0) {
  console.log(
    "Unit runner excludes the exhaustive dailyMiniGameGeneratorDepth gate; run npm run test:mini-game-depth.",
  );
}
if (shardCount > 1) {
  console.log(
    `Unit shard ${shardIndex + 1}/${shardCount}: ${files.length}/${discoveredFiles.length} files (sorted index modulo).`,
  );
}
console.log("Assigned test files:");
for (const file of files) console.log(`- ${file}`);

const child = spawn(
  process.execPath,
  [
    "--preserve-symlinks",
    "--import",
    "./scripts/node-test-server-only-register.mjs",
    "--import",
    "tsx",
    "--test",
    "--test-concurrency=1",
    ...files.map((file) => relative(root, file)),
  ],
  { stdio: "inherit" },
);
child.on("exit", (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
