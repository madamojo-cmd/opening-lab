import assert from "node:assert/strict";

import {
  DEFAULT_PROJECTIVE_TACTIC_DURATION_MS,
  DEFAULT_PROJECTIVE_TACTIC_FADE_MS,
  PROJECTIVE_TACTIC_NEXT_VISUALS_ALLOWED_AFTER_MS,
  PROJECTIVE_TACTIC_MIN_VISIBILITY_BEFORE_REPLY_MS,
  isStaleProjectiveTacticToken,
  nextProjectiveTacticToken,
  shouldClearProjectiveTacticsForBoardReset,
  shouldClearProjectiveTacticsOnViewMode,
} from "../../lib/blundr/projectiveTactics";

assert.equal(DEFAULT_PROJECTIVE_TACTIC_DURATION_MS, 10000);
assert.equal(DEFAULT_PROJECTIVE_TACTIC_FADE_MS, 600);
assert.equal(PROJECTIVE_TACTIC_MIN_VISIBILITY_BEFORE_REPLY_MS, 1200);
assert.equal(PROJECTIVE_TACTIC_NEXT_VISUALS_ALLOWED_AFTER_MS, 7000);
assert.equal(shouldClearProjectiveTacticsOnViewMode("plain"), true);
assert.equal(shouldClearProjectiveTacticsOnViewMode("assisted"), false);
assert.equal(shouldClearProjectiveTacticsOnViewMode("freeplay"), true);

const first = nextProjectiveTacticToken(0);
const second = nextProjectiveTacticToken(first);
assert.equal(isStaleProjectiveTacticToken(second, first), true);
assert.equal(isStaleProjectiveTacticToken(second, second), false);

assert.equal(shouldClearProjectiveTacticsForBoardReset("reset"), true);
assert.equal(shouldClearProjectiveTacticsForBoardReset("restart"), true);
assert.equal(shouldClearProjectiveTacticsForBoardReset("opening_switch"), true);
assert.equal(shouldClearProjectiveTacticsForBoardReset("rating_band_switch"), true);
assert.equal(shouldClearProjectiveTacticsForBoardReset("feature_disabled"), true);
assert.equal(shouldClearProjectiveTacticsForBoardReset("unrelated"), false);

console.log("projectiveTacticsLifecycle ok");
