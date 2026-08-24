import assert from "node:assert/strict";

import { resolveTrainBoardWorkspaceMaxWidth } from "../../lib/blundr/presentation/trainBoardLayout";

assert.equal(
  resolveTrainBoardWorkspaceMaxWidth(true),
  "min(720px, 100%, calc(100dvh - 21rem))",
);
assert.equal(
  resolveTrainBoardWorkspaceMaxWidth(false),
  "min(720px, 100%, calc(100dvh - 17.5rem))",
);
assert.notEqual(
  resolveTrainBoardWorkspaceMaxWidth(true),
  resolveTrainBoardWorkspaceMaxWidth(false),
);
assert.equal(
  resolveTrainBoardWorkspaceMaxWidth(true).includes("100dvh"),
  true,
);
assert.equal(
  resolveTrainBoardWorkspaceMaxWidth(true).includes("720px"),
  true,
);

console.log("trainBoardLayoutMaxWidth ok");
