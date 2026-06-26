import assert from "node:assert/strict";

import {
  STAGE2_RATING_BANDS,
  getStage2RatingBand,
  resolveMaiaSkillForRatingBand,
} from "../../lib/blundr/ratings/ratingBands";

assert.equal(resolveMaiaSkillForRatingBand("new"), "maia-1100");
assert.equal(resolveMaiaSkillForRatingBand("beginner"), "maia-1100");
assert.equal(resolveMaiaSkillForRatingBand("improver"), "maia-1300");
assert.equal(resolveMaiaSkillForRatingBand("club"), "maia-1500");
assert.equal(resolveMaiaSkillForRatingBand("strong"), "maia-1700");
assert.equal(resolveMaiaSkillForRatingBand("advanced"), "maia-1900");
assert.equal(resolveMaiaSkillForRatingBand("expert"), "maia-1900");

for (const band of STAGE2_RATING_BANDS) {
  const resolved = getStage2RatingBand(band.id);
  assert.equal(resolved.id, band.id);
  assert.ok(resolved.engineSkill >= 800);
  assert.ok(resolved.maiaRating >= 1100);
  assert.ok(resolved.maiaSkill.startsWith("maia-"));
}

console.log("stage2MaiaRatingBandMapping ok");
