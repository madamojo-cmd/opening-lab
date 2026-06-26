import assert from "node:assert/strict";

import {
  DEFAULT_STAGE2_RATING_BAND_ID,
  STAGE2_RATING_BANDS,
  buildStage2RatingAwareSeed,
  getStage2RatingBand,
  stage2RatingBandMatchesLocalMetadata,
} from "../../lib/blundr/ratings/ratingBands";
import {
  loadStage2RuntimeTrainableRepertoire,
  selectRuntimeWeightedOpeningSelection,
  selectRuntimeWeightedTrainingLineSelection,
} from "../../lib/blundr/openings/runtimeLineBodyLoader";

void (async () => {
  assert.equal(getStage2RatingBand(DEFAULT_STAGE2_RATING_BAND_ID).id, "club");
  assert.notEqual(buildStage2RatingAwareSeed("seed", "beginner"), buildStage2RatingAwareSeed("seed", "advanced"));

  assert.equal(stage2RatingBandMatchesLocalMetadata({ bandId: "beginner", averageRating: 1100 }), true);
  assert.equal(stage2RatingBandMatchesLocalMetadata({ bandId: "beginner", averageRating: 2100 }), false);
  assert.equal(stage2RatingBandMatchesLocalMetadata({ bandId: "expert", profileId: "masters_1952_3000" }), true);
  assert.equal(
    stage2RatingBandMatchesLocalMetadata({ bandId: "club" }),
    true,
    "missing local rating metadata must not hide playable lines",
  );

  const legacyOpeningSelection = selectRuntimeWeightedOpeningSelection("rating-band-test:legacy");
  assert.equal(legacyOpeningSelection.ratingAware, false, "no explicit band should preserve legacy non-rating-aware behavior");
  assert.equal(legacyOpeningSelection.ratingBandId, null);

  for (const band of STAGE2_RATING_BANDS) {
    const openingSelection = selectRuntimeWeightedOpeningSelection(`rating-band-test:${band.id}`, band.id);
    assert.equal(openingSelection.source, "local_runtime_package");
    assert.ok(openingSelection.eligibleCount > 0, `no eligible openings for ${band.id}`);
    assert.ok(openingSelection.selectedOpeningId, `no opening selected for ${band.id}`);
    assert.equal(openingSelection.ratingBandId, band.id);
    assert.equal(openingSelection.ratingAware, true);

    const repertoire = await loadStage2RuntimeTrainableRepertoire(openingSelection.selectedOpeningId);
    assert.ok(repertoire, `no loaded repertoire for ${openingSelection.selectedOpeningId}`);

    const lineSelection = selectRuntimeWeightedTrainingLineSelection({
      openingId: openingSelection.selectedOpeningId,
      seed: `rating-line-test:${band.id}`,
      recentLineKeys: [],
      repertoire,
      ratingBandId: band.id,
    });

    assert.ok(lineSelection, `no line selection for ${band.id}`);
    assert.equal(lineSelection.source, "local_runtime_package");
    assert.equal(lineSelection.ratingBandId, band.id);
    assert.equal(lineSelection.ratingAware, true);
    assert.ok(lineSelection.selectedPlaySequenceUci.length > 0, `empty line for ${band.id}`);
    assert.ok(
      lineSelection.eligibleCount > 0 ||
        lineSelection.repeatUnavoidable === true ||
        lineSelection.ratingGateFallbackUsed === true,
    );
  }

  console.log("stage2RatingBandGating ok");
})();
