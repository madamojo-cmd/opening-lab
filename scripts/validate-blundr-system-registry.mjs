import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const path = new URL(
  "../docs/product/blundr-system-registry.json",
  import.meta.url,
);
const registry = JSON.parse(await readFile(path, "utf8"));
const statuses = new Set(["verified", "partial", "blocked", "deprecated"]);

assert.equal(registry.schemaVersion, 1, "Unsupported registry schema");
assert.match(registry.registryVersion, /^\d+\.\d+\.\d+$/);
assert.match(registry.baseCommit, /^[a-f0-9]{40}$/);
assert.ok(Array.isArray(registry.entries) && registry.entries.length >= 14);

const ids = new Set();
for (const entry of registry.entries) {
  assert.match(entry.id, /^[A-Z][A-Z0-9-]+-\d{3}$/);
  assert.equal(ids.has(entry.id), false, `Duplicate feature ID ${entry.id}`);
  ids.add(entry.id);
  assert.ok(entry.name);
  assert.ok(entry.contractVersion);
  assert.ok(entry.userPromise);
  assert.ok(statuses.has(entry.status), `${entry.id}: invalid status`);
  assert.equal(typeof entry.releaseRequired, "boolean");
  for (const field of [
    "authority",
    "entryPoints",
    "persistence",
    "dependencies",
    "featureFlags",
    "requiredTests",
    "evidence",
    "blockers",
  ]) {
    assert.ok(
      Array.isArray(entry[field]),
      `${entry.id}: ${field} must be array`,
    );
  }
  assert.ok(entry.authority.length, `${entry.id}: authority required`);
  assert.ok(entry.requiredTests.length, `${entry.id}: requiredTests required`);
  assert.ok(
    typeof entry.fallback === "string" && entry.fallback.length,
    `${entry.id}: fallback contract required`,
  );
  assert.ok(
    entry.lastVerifiedSha === null ||
      /^[a-f0-9]{40}$/.test(entry.lastVerifiedSha),
    `${entry.id}: invalid lastVerifiedSha`,
  );
  if (entry.status === "verified") {
    assert.ok(entry.lastVerifiedSha, `${entry.id}: verified without SHA`);
    assert.ok(entry.evidence.length, `${entry.id}: verified without evidence`);
  }
  if (entry.status === "blocked")
    assert.ok(entry.blockers.length, `${entry.id}: blocked without blocker`);
}

for (const requiredId of [
  "AUTH-ACCOUNT-001",
  "TRAIN-RUNTIME-001",
  "TRAIN-MAIA-001",
  "REWARD-001",
  "RINGS-001",
  "MINIGAME-DEEP-001",
  "DATA-OPENINGS-001",
  "RELEASE-001",
])
  assert.ok(
    ids.has(requiredId),
    `Missing required registry entry ${requiredId}`,
  );

const entryById = new Map(registry.entries.map((entry) => [entry.id, entry]));
const dailyAdaptive = entryById.get("DAILY-ADAPTIVE-001");
assert.ok(dailyAdaptive, "Missing Adaptive Daily contract");
assert.equal(dailyAdaptive.contractVersion, "1");
assert.deepEqual(dailyAdaptive.featureFlags, [
  "BLUNDR_FEATURE_DAILY_ADAPTIVE_V2",
]);
assert.match(dailyAdaptive.fallback, /Missing, false, or mismatched flags/);

const rewards = entryById.get("REWARD-001");
assert.ok(rewards, "Missing Rewards contract");
assert.equal(rewards.contractVersion, "2");
assert.deepEqual(rewards.featureFlags, [
  "BLUNDR_REWARDS_V2_ENABLED",
  "NEXT_PUBLIC_BLUNDR_REWARD_PRESENTATIONS_V2_ENABLED",
]);

for (const id of ["MINIGAME-PROCEDURAL-001", "MINIGAME-DEEP-001"]) {
  const entry = entryById.get(id);
  assert.ok(entry, `Missing ${id} contract`);
  assert.equal(entry.contractVersion, "2");
  assert.ok(
    entry.blockers.some((blocker) => /deprecated and disabled/.test(blocker)),
    `${id}: Daily deprecation must be recorded`,
  );
}

console.log(
  `Blundr system registry valid: ${registry.entries.length} unique feature contracts.`,
);
