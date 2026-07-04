import assert from "node:assert/strict";

import { buildInitialRepertoireFromStarterPack, assertStarterPacksAreValid, getAllStarterPacks, getDefaultStarterPack, getStarterPackById, getStarterPackOpeningIds } from "../starterPacks";

assert.doesNotThrow(() => assertStarterPacksAreValid());
assert.equal(getAllStarterPacks().length, 4);
assert.equal(getDefaultStarterPack().id, "classical_attacker");
assert.equal(getStarterPackById("flexible_strategist")?.whiteOpeningId, "english-white");
assert.equal(getStarterPackById("flexible_strategist")?.blackOpeningId, "slav-black");

const openings = getStarterPackOpeningIds("solid_builder");
assert.equal(openings.whiteOpeningId, "london-white");
assert.equal(openings.blackOpeningId, "caro-kann-black");

const repertoire = buildInitialRepertoireFromStarterPack({
  userId: "user-1",
  starterPackId: "dynamic_fighter",
});
assert.equal(repertoire.selectedStarterPackId, "dynamic_fighter");
assert.equal(repertoire.unlockedOpeningIds.length, 2);
assert.ok(repertoire.unlockedOpeningIds.includes("scotch-white"));
assert.ok(repertoire.unlockedOpeningIds.includes("sicilian-black"));
assert.equal(repertoire.openingUnlockPoints, 0);

console.log("starterPacks.test.ts passed");
