import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const read = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");
const profile = JSON.parse(read("release/feature-profiles/staging-3.99.json"));
const buildRoute = read("app/api/build-info/route.ts");
const healthRoute = read("app/api/health/route.ts");
const identity = read("lib/blundr/release/buildIdentity.server.ts");
const runner = read("scripts/blundr/runStagingGoldenJourneys.mjs");
const manifest = JSON.parse(read("release/blundr-mvp-release-manifest.json"));

test("staging profile requires the isolated production target", () => {
  assert.equal(profile.profileId, "staging-3.99");
  assert.equal(profile.deploymentTarget, "production");
  assert.equal(profile.storageMode, "authenticated");
  assert.equal(profile.requiresRemoteMaia, true);
  assert.equal(profile.requiresWorker, true);
  assert.equal(profile.requiresTelemetry, true);
  for (const disabledUntilAcceptedWriter of [
    "daily_deep_minigames",
    "daily_mixed_test",
    "daily_adaptive_v2",
    "rewards_v2_enabled",
  ]) {
    assert.equal(profile.featureFlags[disabledUntilAcceptedWriter], false);
  }
  assert.equal(profile.featureFlags.reward_presentations_v2_enabled, true);
});

test("canonical release routes are no-store and fail closed", () => {
  assert.match(buildRoute, /authorizeReleaseEvidenceRequest/);
  assert.match(buildRoute, /identity\.ready \? 200 : 503/);
  assert.match(healthRoute, /ready \? 200 : 503/);
  assert.match(buildRoute, /Cache-Control", "no-store"/);
  assert.match(healthRoute, /Cache-Control", "no-store"/);
  assert.match(identity, /x-blundr-release-evidence-token/);
  assert.doesNotMatch(identity, /authorization.*release evidence/i);
});

test("golden runner records ten API and database journeys", () => {
  const journeyNames = [...runner.matchAll(/await journey\("([^"]+)"/g)].map(
    (match) => match[1],
  );
  assert.equal(journeyNames.length, 10);
  for (const requiredEvidence of [
    "blundr_user_profiles",
    "blundr_provider_accounts",
    "blundr_game_import_jobs",
    "blundr_learning_events",
    "blundr_completion_grants",
    "blundr_daily_decks",
    "blundr_minigame_instances",
  ])
    assert.match(runner, new RegExp(requiredEvidence));
  assert.match(runner, /duplicate === true/);
  assert.match(runner, /selectedCandidate\?\.source === "maia"/);
});

test("static release contract never claims its own candidate SHA", () => {
  assert.equal(Object.hasOwn(manifest, "gitSha"), false);
  assert.equal(manifest.gitShaSource, "VERCEL_GIT_COMMIT_SHA");
  assert.equal(manifest.evidence.status, "PENDING_EXACT_SHA_STAGING");
});
