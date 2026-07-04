import assert from "node:assert/strict";

import { buildLockedOpeningIds, getEligibleRepertoireOpeningIds, getOpeningDisplayName, getOpeningSide, normalizeOpeningPool } from "../repertoireOpeningPool";

const eligible = getEligibleRepertoireOpeningIds();
assert.ok(eligible.length > 0);
assert.ok(eligible.includes("italian-white"));
assert.ok(eligible.includes("french-black"));

assert.deepEqual(normalizeOpeningPool(["italian-white", "italian-white", "french-black"]), ["italian-white", "french-black"]);
assert.equal(getOpeningSide("italian-white"), "white");
assert.equal(getOpeningSide("french-black"), "black");
assert.equal(getOpeningSide("mystery-opening"), "unknown");
assert.ok(getOpeningDisplayName("italian-white").length > 0);
assert.deepEqual(buildLockedOpeningIds(["italian-white", "french-black", "london-white"], ["italian-white", "french-black"]), ["london-white"]);

console.log("repertoireOpeningPool.test.ts passed");
