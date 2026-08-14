import assert from "node:assert/strict";

import {
  STAGE2_RATING_BANDS,
  getStage2RatingBand,
  getStage2RatingBandForAccountRatingBand,
  resolveMaiaSkillForRatingBand,
} from "../../lib/blundr/ratings/ratingBands";

assert.equal(resolveMaiaSkillForRatingBand("new"), "maia-1100");
assert.equal(resolveMaiaSkillForRatingBand("beginner"), "maia-1100");
assert.equal(resolveMaiaSkillForRatingBand("improver"), "maia-1300");
assert.equal(resolveMaiaSkillForRatingBand("club"), "maia-1500");
assert.equal(resolveMaiaSkillForRatingBand("strong"), "maia-1700");
assert.equal(resolveMaiaSkillForRatingBand("advanced"), "maia-1900");
assert.equal(resolveMaiaSkillForRatingBand("expert"), "maia-1900");

assert.deepEqual(
  (
    [
      "new_to_openings",
      "u800",
      "800-1200",
      "1200-1600",
      "1600-2000",
      "2000-plus",
    ] as const
  ).map((id) => {
    const band = getStage2RatingBandForAccountRatingBand(id);
    return [id, band.id, band.target, band.maiaSkill];
  }),
  [
    [
      "new_to_openings",
      "account-new-to-openings",
      "New to openings",
      "maia-1100",
    ],
    ["u800", "account-u800", "Under 800", "maia-1100"],
    ["800-1200", "account-800-1200", "800-1200", "maia-1100"],
    ["1200-1600", "club", "1200–1600", "maia-1500"],
    ["1600-2000", "account-1600-2000", "1600-2000", "maia-1800"],
    ["2000-plus", "account-2000-plus", "2000+", "maia-1900"],
  ],
);

for (const band of STAGE2_RATING_BANDS) {
  const resolved = getStage2RatingBand(band.id);
  assert.equal(resolved.id, band.id);
  assert.ok(resolved.engineSkill >= 800);
  assert.ok(resolved.maiaRating >= 1100);
  assert.ok(resolved.maiaSkill.startsWith("maia-"));
}

console.log("stage2MaiaRatingBandMapping ok");
