import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
  buildOnboardingV11ResetProfilePatch,
  mergeClearedOnboardingPlanIntentUserMetadata,
} from "../onboardingV11ResetContract";

const root = process.cwd();
const userId = "11111111-1111-4111-8111-111111111111";
const now = "2026-09-10T17:00:00.000Z";

test("V11 reset profile patch returns authoritative onboarding defaults", () => {
  const patch = buildOnboardingV11ResetProfilePatch(userId, now);

  assert.deepEqual(patch, {
    onboarding_completed: false,
    onboarding_step: "welcome",
    onboarding_priorities: [],
    onboarding_started_at: null,
    onboarding_completed_at: null,
    rating_band_id: "1200-1600",
    rating_source: "default",
    preferred_training_mode: "assisted",
    daily_tempo_goal: 10,
    daily_battery_goal: 3,
    daily_blundr_goal: 1,
    daily_blundr_card_goal: 10,
    selected_starter_pack_id: null,
    updated_at: now,
  });
});

test("V11 reset patch returns welcome, incomplete, and no starter-opening state", () => {
  const patch = buildOnboardingV11ResetProfilePatch(userId, now);

  assert.equal(patch.onboarding_step, "welcome");
  assert.equal(patch.onboarding_completed, false);
  assert.deepEqual(patch.onboarding_priorities, []);
  assert.equal(patch.onboarding_started_at, null);
  assert.equal(patch.onboarding_completed_at, null);
  assert.equal(patch.selected_starter_pack_id, null);
});

test("V11 reset clears plan intent while preserving unrelated user metadata", () => {
  const metadata = mergeClearedOnboardingPlanIntentUserMetadata({
    blundr_launch_plan_intent: "pro_monthly",
    age_16_terms_confirmed: true,
    locale: "en-US",
  });

  assert.equal(metadata.blundr_launch_plan_intent, null);
  assert.equal(metadata.age_16_terms_confirmed, true);
  assert.equal(metadata.locale, "en-US");
});

test("reset route is wired to the authoritative V11 reset after generic profile reset", () => {
  const source = readFileSync(
    join(root, "app/api/blundr/dev/reset-user/route.ts"),
    "utf8",
  );

  assert.match(source, /resetOnboardingV11State/);
  assert.ok(
    source.indexOf("saveTrainingProfile") <
      source.indexOf("resetOnboardingV11State"),
    "generic profile reset must run before authoritative V11 reset",
  );
  assert.match(source, /onboarding,\n\s*\}\)/);
});
