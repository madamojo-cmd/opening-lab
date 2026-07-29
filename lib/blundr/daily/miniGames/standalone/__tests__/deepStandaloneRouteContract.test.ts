import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const advanceRoute = readFileSync(
  fileURLToPath(
    new URL(
      "../../../../../../app/api/blundr/minigames/instances/[instanceId]/advance/route.ts",
      import.meta.url,
    ),
  ),
  "utf8",
);
const repository = readFileSync(
  fileURLToPath(
    new URL("../standaloneMiniGameRepository.server.ts", import.meta.url),
  ),
  "utf8",
);

test("deep advance branches before any legacy card dereference", () => {
  const deepBranch = advanceRoute.indexOf(
    'record.kind === "deep" && record.scenario',
  );
  const legacyDereference = advanceRoute.indexOf("card.miniGame.miniGameId");
  assert.ok(deepBranch >= 0, "deep branch missing");
  assert.ok(legacyDereference >= 0, "legacy branch missing");
  assert.ok(
    deepBranch < legacyDereference,
    "legacy card shape is touched before deep routing",
  );
});

test("all standalone mutations use optimistic revision compare-and-swap", () => {
  assert.match(advanceRoute, /revision_required/);
  assert.match(advanceRoute, /stale_instance_state/);
  assert.match(repository, /\.eq\("revision", expectedRevision\)/);
  assert.match(repository, /revision: nextRevision/);
  assert.match(repository, /standalone_minigame_revision_conflict/);
});
