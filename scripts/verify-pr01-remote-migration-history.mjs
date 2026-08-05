import assert from "node:assert/strict";
import { execFile as execFileCallback } from "node:child_process";
import { readdir } from "node:fs/promises";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);
const supabaseVersion = "2.111.0";
const migrationHistoryModes = {
  "fresh-empty": {
    expectedMigrationCount: 0,
    expectedHead: null,
  },
  "fresh-final": {
    expectedMigrationCount: 23,
    expectedHead: "20260805130000",
  },
  "upgrade-initial": {
    expectedMigrationCount: 7,
    expectedHead: "20260715",
  },
  "upgrade-prior21": {
    expectedMigrationCount: 21,
    expectedHead: "20260804130000",
  },
  "upgrade-final": {
    expectedMigrationCount: 23,
    expectedHead: "20260805130000",
  },
};
const requiredEnvironmentNames = [
  "SUPABASE_ACCESS_TOKEN",
  "SUPABASE_DB_PASSWORD",
  "BLUNDR_RLS_TEST_PROJECT_REF",
  "BLUNDR_RLS_TEST_ENVIRONMENT_ROLE",
];

function migrationVersion(file) {
  return file.match(/^(\d{8}(?:\d{6})?)_/)?.[1];
}

function collectRemoteVersions(value) {
  if (Array.isArray(value)) return value.flatMap(collectRemoteVersions);
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, entry]) => {
    if (
      /^remote(?:_|[A-Z])?version$|^remote$/i.test(key) &&
      typeof entry === "string" &&
      /^\d{8}(?:\d{6})?$/.test(entry)
    ) {
      return [entry];
    }
    return collectRemoteVersions(entry);
  });
}

function assertContract(condition, message) {
  assert.ok(condition, `PR-01 remote migration history: ${message}`);
}

const missingEnvironmentNames = requiredEnvironmentNames.filter(
  (name) => !process.env[name],
);
const mode = process.env.BLUNDR_PR01_REMOTE_MIGRATION_HISTORY_MODE;
const expectation = migrationHistoryModes[mode];
assertContract(
  missingEnvironmentNames.length === 0,
  `missing required disposable configuration: ${missingEnvironmentNames.join(", ")}`,
);
assertContract(
  process.env.BLUNDR_RLS_TEST_ENVIRONMENT_ROLE === "disposable",
  "remote migration history may only inspect the disposable environment",
);
assertContract(
  expectation,
  "BLUNDR_PR01_REMOTE_MIGRATION_HISTORY_MODE must select a defined fresh or upgrade phase",
);

const localFiles = (await readdir("supabase/migrations"))
  .filter((file) => file.endsWith(".sql"))
  .sort();
const localVersions = localFiles.map(migrationVersion);
assertContract(
  localVersions.every(Boolean),
  "every local migration filename must begin with a valid Supabase version",
);
assert.equal(localVersions.length, 23);
assert.equal(localVersions.at(-1), "20260805130000");
assert.equal(new Set(localVersions).size, 23);
const expectedVersions = localVersions.slice(
  0,
  expectation.expectedMigrationCount,
);
assert.equal(expectedVersions.at(-1) ?? null, expectation.expectedHead);

let stdout;
try {
  ({ stdout } = await execFile(
    "npx",
    [
      "--yes",
      `supabase@${supabaseVersion}`,
      "migration",
      "list",
      "--linked",
      "--output",
      "json",
    ],
    { encoding: "utf8", maxBuffer: 1024 * 1024 },
  ));
} catch {
  throw new Error(
    "PR-01 remote migration history could not be read from the disposable target.",
  );
}

let parsed;
try {
  parsed = JSON.parse(stdout);
} catch {
  throw new Error(
    "PR-01 remote migration history returned an unsupported format.",
  );
}
const remoteVersions = collectRemoteVersions(parsed).sort();
assert.equal(remoteVersions.length, expectation.expectedMigrationCount);
assert.deepEqual(remoteVersions, [...expectedVersions].sort());
assert.equal(remoteVersions.at(-1) ?? null, expectation.expectedHead);
console.log(
  `Verified disposable remote migration history (${mode}): ${expectation.expectedMigrationCount} migrations${expectation.expectedHead ? ` through ${expectation.expectedHead}` : ""}.`,
);
