import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

function readJson(path: string) {
  return JSON.parse(readFileSync(join(root, path), "utf8"));
}

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

function runScript(path: string) {
  return spawnSync(process.execPath, [path], {
    cwd: root,
    encoding: "utf8",
  });
}

test("registry structure command accepts partial and blocked entries with blockers", () => {
  const pkg = readJson("package.json");
  assert.equal(
    pkg.scripts["verify:registry:structure"],
    "node scripts/validate-blundr-system-registry.mjs",
  );

  const result = runScript("scripts/validate-blundr-system-registry.mjs");
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const source = read("scripts/validate-blundr-system-registry.mjs");
  assert.match(source, /entry\.status === "blocked"/);
  assert.match(source, /blocked without blocker/);
  assert.match(source, /entry\.status === "partial"/);
});

test("registry release command remains strict and fail-closed", () => {
  const pkg = readJson("package.json");
  assert.equal(
    pkg.scripts["verify:registry:release"],
    "node scripts/validate-blundr-release-registry.mjs",
  );

  const source = read("scripts/validate-blundr-release-registry.mjs");
  assert.match(source, /entry\.status !== "verified"/);
  assert.match(source, /exact-SHA staging evidence is missing/);
  assert.doesNotMatch(source, /BLUNDR_RELEASE_REGISTRY_STRICT/);

  const result = runScript("scripts/validate-blundr-release-registry.mjs");
  assert.notEqual(result.status, 0);
  const output = `${result.stdout}\n${result.stderr}`;
  assert.match(output, /RELEASE-001: status is blocked/);
  assert.match(output, /AUTH-ACCOUNT-001: status is partial/);
  assert.match(output, /exact verified SHA is missing/);
  assert.match(output, /exact-SHA staging evidence is missing/);
});
