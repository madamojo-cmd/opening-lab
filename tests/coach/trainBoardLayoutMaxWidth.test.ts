import assert from "node:assert/strict";

import { resolveTrainBoardWorkspaceMaxWidth } from "../../lib/blundr/presentation/trainBoardLayout";

assert.equal(
  resolveTrainBoardWorkspaceMaxWidth(true),
  "min(100%, calc(100dvh - 21.5rem))",
);
assert.equal(
  resolveTrainBoardWorkspaceMaxWidth(false),
  "min(100%, calc(100dvh - 17.5rem))",
);
assert.notEqual(
  resolveTrainBoardWorkspaceMaxWidth(true),
  resolveTrainBoardWorkspaceMaxWidth(false),
);

console.log("trainBoardLayoutMaxWidth ok");
