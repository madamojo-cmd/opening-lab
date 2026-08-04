import assert from "node:assert/strict";

import { isSelectedRuntimeLineComplete } from "../selectedRuntimeLineCompletion";

assert.equal(
  isSelectedRuntimeLineComplete({
    selectedRuntimeLinePlyLength: 5,
    currentPly: 4,
    resolverLineComplete: true,
    exactNodeHasChildren: false,
  }),
  false,
);
assert.equal(
  isSelectedRuntimeLineComplete({
    selectedRuntimeLinePlyLength: 5,
    currentPly: 5,
    resolverLineComplete: false,
    exactNodeHasChildren: "unknown",
  }),
  true,
);
assert.equal(
  isSelectedRuntimeLineComplete({
    selectedRuntimeLinePlyLength: 5,
    currentPly: 5,
    resolverLineComplete: false,
    exactNodeHasChildren: true,
  }),
  true,
);
assert.equal(
  isSelectedRuntimeLineComplete({
    selectedRuntimeLinePlyLength: 0,
    currentPly: 5,
    resolverLineComplete: true,
    exactNodeHasChildren: "unknown",
  }),
  false,
);

console.log("selectedRuntimeLineCompletion ok");
