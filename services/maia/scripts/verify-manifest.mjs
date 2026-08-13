import assert from "node:assert/strict";

import { SKILLS } from "../src/contracts.mjs";
import { loadManifest } from "../src/manifest.mjs";

const manifest = await loadManifest();
assert.equal(manifest.source.commit.length, 40);
assert.equal(manifest.engine.commit.length, 40);
assert.equal(manifest.engine.search, "classic");
assert.equal(manifest.engine.nodes, 1);
assert.deepEqual(
  manifest.models.map((model) => model.skillLevel),
  [...SKILLS],
);
for (const model of manifest.models) {
  assert.ok(model.url.includes(manifest.source.commit));
  assert.equal(model.rating, Number(model.skillLevel.slice(-4)));
}
console.log(`Verified ${manifest.models.length} pinned Maia models.`);
