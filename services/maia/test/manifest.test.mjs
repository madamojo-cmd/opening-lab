import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { SKILLS } from "../src/contracts.mjs";
import { loadManifest } from "../src/manifest.mjs";

describe("model manifest", () => {
  it("pins every supported rating exactly once", async () => {
    const manifest = await loadManifest();
    assert.deepEqual(
      manifest.models.map((model) => model.skillLevel),
      [...SKILLS],
    );
    assert.equal(new Set(manifest.models.map((model) => model.sha256)).size, 9);
    assert.equal(manifest.engine.nodes, 1);
    assert.equal(manifest.engine.search, "classic");
  });
});
