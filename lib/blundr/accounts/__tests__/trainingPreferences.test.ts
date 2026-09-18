import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeIanaTimeZone,
  validateTrainingPreferencesPatch,
} from "../trainingPreferences.ts";

test("accepts every supported rating band and marks invalid bands unsafe", () => {
  for (const ratingBandId of [
    "new_to_openings",
    "u800",
    "800-1200",
    "1200-1600",
    "1600-2000",
    "2000-plus",
  ]) {
    const result = validateTrainingPreferencesPatch({ ratingBandId });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.patch.ratingBandId, ratingBandId);
  }
  assert.deepEqual(validateTrainingPreferencesPatch({ ratingBandId: "2500" }), {
    ok: false,
    code: "invalid_rating_band",
    message: "Choose one of the supported rating bands.",
  });
});

test("validates account timezone and bounded daily goals", () => {
  assert.equal(normalizeIanaTimeZone("UTC"), "UTC");
  assert.ok(normalizeIanaTimeZone("America/New_York"));
  assert.equal(normalizeIanaTimeZone("EST"), null);
  assert.equal(
    validateTrainingPreferencesPatch({ dailyTempoGoal: 0 }).ok,
    false,
  );
  assert.equal(
    validateTrainingPreferencesPatch({ dailyTempoGoal: 10 }).ok,
    true,
  );
  assert.equal(
    validateTrainingPreferencesPatch({ dailyBlundrCardGoal: 0 }).ok,
    false,
  );
  assert.equal(
    validateTrainingPreferencesPatch({ dailyBlundrCardGoal: 10 }).ok,
    true,
  );
  assert.equal(
    validateTrainingPreferencesPatch({ dailyBlundrCardGoal: 100 }).ok,
    false,
  );
});

test("rejects fields outside the owned training-preference allowlist", () => {
  const result = validateTrainingPreferencesPatch({
    ratingBandId: "1200-1600",
    userId: "someone-else",
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "unsupported_training_preference");
});
