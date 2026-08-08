import assert from "node:assert/strict";
import { execFile as execFileCallback } from "node:child_process";
import { readdir } from "node:fs/promises";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);
const expectedCount = Number(process.env.BLUNDR_EXPECTED_MIGRATION_COUNT);
const expectedHead = process.env.BLUNDR_EXPECTED_MIGRATION_HEAD || null;
assert.equal(process.env.BLUNDR_RLS_TEST_ENVIRONMENT_ROLE, "disposable");
assert.ok(Number.isInteger(expectedCount) && expectedCount >= 0);
assert.equal(expectedCount === 0, expectedHead === null);

const localVersions = (await readdir("supabase/migrations"))
  .filter((file) => file.endsWith(".sql"))
  .sort()
  .map((file) => file.match(/^(\d{8}(?:\d{6})?)_/)?.[1]);
assert.ok(localVersions.every(Boolean));
assert.ok(expectedCount <= localVersions.length);
assert.equal(
  localVersions.slice(0, expectedCount).at(-1) ?? null,
  expectedHead,
);

const { stdout } = await execFile(
  "npx",
  [
    "--yes",
    "supabase@2.111.0",
    "migration",
    "list",
    "--linked",
    "--output-format",
    "json",
  ],
  { encoding: "utf8", maxBuffer: 1024 * 1024 },
);
const parsed = JSON.parse(stdout);
const remote = [];
function collect(value) {
  if (Array.isArray(value)) return value.forEach(collect);
  if (!value || typeof value !== "object") return;
  for (const [key, entry] of Object.entries(value)) {
    if (
      /^remote(?:_|[A-Z])?version$|^remote$/i.test(key) &&
      typeof entry === "string" &&
      /^\d{8}(?:\d{6})?$/.test(entry)
    )
      remote.push(entry);
    else collect(entry);
  }
}
collect(parsed);
remote.sort();
assert.equal(remote.length, expectedCount);
assert.deepEqual(remote, localVersions.slice(0, expectedCount).sort());
assert.equal(remote.at(-1) ?? null, expectedHead);
console.log(
  `Verified disposable migration history: count=${expectedCount} head=${expectedHead ?? "none"}`,
);
