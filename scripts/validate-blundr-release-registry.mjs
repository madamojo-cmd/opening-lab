import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const path = new URL(
  "../docs/product/blundr-system-registry.json",
  import.meta.url,
);
const registry = JSON.parse(await readFile(path, "utf8"));
const releaseEntries = registry.entries.filter(
  (entry) => entry.releaseRequired,
);
const failures = [];

for (const entry of releaseEntries) {
  if (entry.status !== "verified")
    failures.push(`${entry.id}: status is ${entry.status}`);
  if (!/^[a-f0-9]{40}$/.test(entry.lastVerifiedSha ?? ""))
    failures.push(`${entry.id}: exact verified SHA is missing`);
  if (
    !entry.evidence.some(
      (item) =>
        item &&
        item.kind === "exact_sha_staging" &&
        item.sha === entry.lastVerifiedSha &&
        typeof item.url === "string" &&
        item.url.startsWith("https://"),
    )
  )
    failures.push(`${entry.id}: exact-SHA staging evidence is missing`);
}

assert.equal(
  failures.length,
  0,
  `Blundr release registry is not ready:\n- ${failures.join("\n- ")}`,
);
console.log(
  `Blundr release registry valid: ${releaseEntries.length} release contracts are exact-SHA verified.`,
);
