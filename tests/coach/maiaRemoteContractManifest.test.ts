import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  BLUNDR_MAIA_ENGINE_COMMIT,
  BLUNDR_MAIA_ENGINE_VERSION,
  BLUNDR_MAIA_MODEL_SHA256,
  BLUNDR_MAIA_MOVE_CONTRACT,
  BLUNDR_MAIA_PROVIDER_COMMIT,
  BLUNDR_MAIA_SERVICE_VERSION,
} from "../../lib/blundr/maia/maiaRemoteContract";

const manifest = JSON.parse(
  readFileSync("services/maia/model-manifest.json", "utf8"),
);

assert.equal(manifest.contractVersion, "blundr-maia-service.v1");
assert.equal(BLUNDR_MAIA_MOVE_CONTRACT, "blundr-maia-move.v1");
assert.equal(manifest.serviceVersion, BLUNDR_MAIA_SERVICE_VERSION);
assert.equal(manifest.source.commit, BLUNDR_MAIA_PROVIDER_COMMIT);
assert.equal(manifest.engine.version, BLUNDR_MAIA_ENGINE_VERSION);
assert.equal(manifest.engine.commit, BLUNDR_MAIA_ENGINE_COMMIT);
assert.equal(manifest.engine.search, "classic");
assert.equal(manifest.engine.nodes, 1);
assert.deepEqual(
  Object.fromEntries(
    manifest.models.map((model: { skillLevel: string; sha256: string }) => [
      model.skillLevel,
      model.sha256,
    ]),
  ),
  BLUNDR_MAIA_MODEL_SHA256,
);

console.log("maiaRemoteContractManifest ok");
