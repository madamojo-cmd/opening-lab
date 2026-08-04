import assert from "node:assert/strict";

import {
  clampProgressPercentage,
  formatProgressPercentage,
  formatRepertoirePoints,
} from "../userFacingNumbers";

assert.equal(formatRepertoirePoints(23.555555555), "23.6");
assert.equal(formatRepertoirePoints(17), "17");
assert.equal(formatRepertoirePoints(Number.NaN), "0");
assert.equal(formatProgressPercentage(23.555555555), "23.6%");
assert.equal(formatProgressPercentage(100.4), "100%");
assert.equal(clampProgressPercentage(-2), 0);

console.log("userFacingNumbers ok");
