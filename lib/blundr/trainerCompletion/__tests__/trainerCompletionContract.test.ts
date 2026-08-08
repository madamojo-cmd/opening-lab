import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const service = readFileSync(
  path.join(
    root,
    "lib/blundr/trainerCompletion/trainerCompletionService.server.ts",
  ),
  "utf8",
);
const resolver = readFileSync(
  path.join(root, "lib/blundr/trainerCompletion/trainerRuntimeLine.server.ts"),
  "utf8",
);
const createRoute = readFileSync(
  path.join(root, "app/api/blundr/trainer/sessions/route.ts"),
  "utf8",
);
const actionRoute = readFileSync(
  path.join(
    root,
    "app/api/blundr/trainer/sessions/[sessionId]/actions/route.ts",
  ),
  "utf8",
);
const client = readFileSync(
  path.join(root, "lib/blundr/trainerCompletion/trainerCompletionClient.ts"),
  "utf8",
);
const page = readFileSync(path.join(root, "app/page.tsx"), "utf8");

// The contract deliberately has no browser-provided sequence, cursor, FEN,
// terminal flag, completion ID, or learning projection values.
assert.match(resolver, /loadStage2RuntimeTrainableRepertoire/);
assert.match(resolver, /buildRuntimeOpeningIdentityLines/);
assert.match(resolver, /validateRestrictedRuntimeLineSession/);
assert.match(service, /randomUUID/);
assert.match(service, /blundr_reserve_trainer_session_v2/);
assert.match(service, /blundr_commit_trainer_action_v2/);
assert.match(service, /learning_event/);
assert.doesNotMatch(service, /completionId|terminalClaim|lineCursor/);
assert.match(service, /resolveAuthoritativeTarget/);
assert.doesNotMatch(service, /expectedMoveUci,\n    canonicalFen,/);
assert.match(createRoute, /requireGameDataUser/);
assert.match(actionRoute, /requireGameDataUser/);
assert.doesNotMatch(createRoute, /sequenceUci|terminalFen|userColor/);
assert.doesNotMatch(actionRoute, /cursor|terminal|completionId/);
assert.match(actionRoute, /code\.includes\("conflict"\)/);

// Refresh retains only an opaque session identity; explicit restart clears it.
assert.match(client, /resumeSessionId/);
assert.match(client, /payload\.session\.sessionId/);
assert.doesNotMatch(
  client,
  /localStorage\.setItem\([^\n]*(cursor|terminal|completion)/i,
);
assert.match(page, /clearAuthoritativeTrainerSessionResumes\(\)/);

// The terminal identity is server-originated and a failed reward call releases
// the in-flight guard so interruption retry can reuse that exact identity.
assert.match(
  page,
  /const terminalCompletionId\s*=\s*authoritativeTrainerSession\?\.terminalCompletionId\s*\?\?\s*null;/,
);
assert.match(page, /const completionKey\s*=\s*terminalCompletionId/);
assert.match(page, /openingRunAwardKeyRef\.current\s*=\s*""/);

console.log("trainerCompletionContract ok");
