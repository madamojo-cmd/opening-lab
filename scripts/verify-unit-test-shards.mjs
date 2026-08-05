import { resolve } from "node:path";
import { discoverUnitTests } from "./unit-test-discovery.mjs";

const all = await discoverUnitTests({ root: resolve(process.cwd()) });
const shards = Array.from({ length: 4 }, (_, shardIndex) =>
  all.filter((_, index) => index % 4 === shardIndex),
);
const flattened = shards.flat();
const unique = new Set(flattened);

if (flattened.length !== all.length || unique.size !== all.length) {
  throw new Error("Unit shard assignments overlap or omit discovered files");
}
for (const file of all) {
  if (!unique.has(file))
    throw new Error(`Unit shard assignment missing ${file}`);
}

console.log(
  `Verified 4 deterministic unit shards: ${all.length} files assigned exactly once.`,
);
shards.forEach((files, index) =>
  console.log(`- ${index + 1}/4: ${files.length} files`),
);
