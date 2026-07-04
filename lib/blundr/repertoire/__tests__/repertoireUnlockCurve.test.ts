import assert from "node:assert/strict";

import { canAffordUnlock, getNextUnlockCost, getUnlockCostByIndex, getUnlockProgressPct } from "../repertoireUnlockCurve";
import type { RepertoireProgress } from "../repertoireTypes";

const starterProgress: Pick<RepertoireProgress, "selectedStarterPackId" | "unlockedOpeningIds" | "lockedOpeningIds" | "availablePoints"> = {
  selectedStarterPackId: "classical_attacker",
  unlockedOpeningIds: ["italian-white", "french-black"],
  lockedOpeningIds: ["london-white"],
  availablePoints: 149,
};

const expandedProgress: Pick<RepertoireProgress, "selectedStarterPackId" | "unlockedOpeningIds" | "lockedOpeningIds" | "availablePoints"> = {
  selectedStarterPackId: "classical_attacker",
  unlockedOpeningIds: ["italian-white", "french-black", "london-white"],
  lockedOpeningIds: ["sicilian-black"],
  availablePoints: 299,
};

assert.equal(getUnlockCostByIndex(1), 150);
assert.equal(getUnlockCostByIndex(2), 300);
assert.equal(getUnlockCostByIndex(3), 500);
assert.equal(getUnlockCostByIndex(9), 500);
assert.equal(getNextUnlockCost(starterProgress), 150);
assert.ok(getUnlockProgressPct(starterProgress) > 99 && getUnlockProgressPct(starterProgress) < 100);
assert.equal(canAffordUnlock(starterProgress, "london-white"), false);
assert.equal(getNextUnlockCost(expandedProgress), 300);
assert.ok(getUnlockProgressPct(expandedProgress) > 99 && getUnlockProgressPct(expandedProgress) < 100);
assert.equal(canAffordUnlock(expandedProgress, "sicilian-black"), false);
assert.equal(canAffordUnlock({ ...expandedProgress, availablePoints: 300 }, "sicilian-black"), true);

console.log("repertoireUnlockCurve.test.ts passed");
