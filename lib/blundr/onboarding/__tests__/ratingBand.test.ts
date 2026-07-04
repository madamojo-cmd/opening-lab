import assert from "node:assert/strict";

import { getAllRatingBands, getDefaultRatingBand, getRatingBandById, getRatingBandLabel, getRatingBandTrainingDescription, normalizeRatingBandInput } from "../ratingBand";

assert.equal(getAllRatingBands().length, 6);
assert.equal(getDefaultRatingBand().id, "1200-1600");
assert.equal(normalizeRatingBandInput("I'm not sure"), "1200-1600");
assert.equal(normalizeRatingBandInput("2000+"), "2000-plus");
assert.equal(getRatingBandLabel("2000-plus"), "2000+");
assert.equal(getRatingBandTrainingDescription("u800"), "Very beginner tactical and opening awareness.");
assert.equal(getRatingBandById("800-1200")?.label, "800-1200");

console.log("ratingBand.test.ts passed");
