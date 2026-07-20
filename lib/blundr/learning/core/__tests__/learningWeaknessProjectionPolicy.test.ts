import assert from "node:assert/strict";
import test from "node:test";

import { shouldCreateWeaknessProjection } from "../weaknessProjectionPolicy";

test("telemetry and successful moves cannot create false weaknesses", () => {
  assert.equal(
    shouldCreateWeaknessProjection({
      taxonomy: "move_attempted",
      correct: false,
    }),
    false,
  );
  assert.equal(
    shouldCreateWeaknessProjection({
      taxonomy: "position_seen",
      correct: false,
    }),
    false,
  );
  assert.equal(
    shouldCreateWeaknessProjection({ taxonomy: "move_correct", correct: true }),
    false,
  );
});

test("verified misses and reveals create weaknesses", () => {
  assert.equal(
    shouldCreateWeaknessProjection({
      taxonomy: "move_incorrect",
      correct: false,
    }),
    true,
  );
  assert.equal(
    shouldCreateWeaknessProjection({
      taxonomy: "cue_revealed",
      correct: false,
    }),
    true,
  );
  assert.equal(
    shouldCreateWeaknessProjection({
      taxonomy: "daily_revealed",
      correct: false,
    }),
    true,
  );
  assert.equal(
    shouldCreateWeaknessProjection({
      taxonomy: "finding_recorded",
      correct: false,
    }),
    true,
  );
});
