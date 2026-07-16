import { spawn } from "node:child_process";

const shardCount = 8;
const concurrency = 2;
const testFile =
  "lib/blundr/daily/__tests__/dailyMiniGameGeneratorDepth.test.ts";

function runShard(index) {
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      ["--preserve-symlinks", "--import", "tsx", "--test", testFile],
      {
        stdio: "inherit",
        env: {
          ...process.env,
          BLUNDR_MINIGAME_DEPTH_SHARD_INDEX: String(index),
          BLUNDR_MINIGAME_DEPTH_SHARD_COUNT: String(shardCount),
        },
      },
    );
    child.on("exit", (code, signal) =>
      resolve({ index, code: code ?? (signal ? 1 : 0) }),
    );
    child.on("error", () => resolve({ index, code: 1 }));
  });
}

const results = [];
let next = 0;
async function worker() {
  while (next < shardCount) {
    const index = next++;
    results.push(await runShard(index));
  }
}

await Promise.all(Array.from({ length: concurrency }, worker));
results.sort((a, b) => a.index - b.index);
const failed = results.filter((result) => result.code !== 0);
console.log(
  JSON.stringify({
    shardCount,
    concurrency,
    completed: results.length - failed.length,
    failed: failed.map((result) => result.index + 1),
  }),
);
process.exitCode = failed.length ? 1 : 0;
