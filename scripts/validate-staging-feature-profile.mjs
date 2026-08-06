import { readFile, readdir } from "node:fs/promises";

const PROFILE_PATHS = [
  "release/feature-profiles/staging-3.99.json",
  "release/feature-profiles/production-3.99.json",
];
const DEPRECATED_DAILY_CAPABILITIES = [
  "daily_deep_minigames",
  "daily_mixed_test",
];
const CUMULATIVE_RELEASE_MIGRATION_HEAD = "20260806120000";
const migrationHead = (await readdir("supabase/migrations"))
  .filter((file) => file.endsWith(".sql"))
  .sort()
  .at(-1)
  ?.split("_")[0];
const profiles = await Promise.all(
  PROFILE_PATHS.map(async (profilePath) => ({
    path: profilePath,
    value: JSON.parse(await readFile(profilePath, "utf8")),
  })),
);
const contractSource = await readFile("lib/blundr/contracts/index.ts", "utf8");
const runtimeSource = await readFile(
  "lib/blundr/trainingRuntime/trainingRuntimeSchema.ts",
  "utf8",
);

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

const flagBlock = contractSource.match(
  /export const FEATURE_FLAGS:[\s\S]*?= \{([\s\S]*?)\n\};/,
)?.[1];
requireValue(flagBlock, "Unable to read the canonical feature-flag registry.");
const canonicalFlags = [...flagBlock.matchAll(/^\s{2}([a-z0-9_]+): false,/gm)]
  .map((match) => match[1])
  .sort();
const runtimePackageId = runtimeSource.match(
  /TRAINING_RUNTIME_PACKAGE_ID\s*=\s*\n?\s*"([^"]+)"/,
)?.[1];

for (const { path, value: profile } of profiles) {
  const profileFlags = Object.keys(profile.featureFlags ?? {}).sort();
  const prefix = `${path}:`;

  requireValue(
    profile.schemaVersion === 2,
    `${prefix} unsupported profile schema.`,
  );
  requireValue(
    JSON.stringify(profileFlags) === JSON.stringify(canonicalFlags),
    `${prefix} feature profile must cover the canonical registry exactly.`,
  );
  requireValue(
    Object.values(profile.featureFlags ?? {}).every(
      (enabled) => typeof enabled === "boolean",
    ),
    `${prefix} feature flags must be explicit booleans.`,
  );
  requireValue(
    migrationHead === CUMULATIVE_RELEASE_MIGRATION_HEAD &&
      profile.migrationHead === migrationHead,
    `${prefix} feature profile must match the repository's cumulative release migration head.`,
  );
  requireValue(
    profile.runtimePackageId === runtimePackageId,
    `${prefix} runtime package identity does not match the checked-in runtime.`,
  );
  requireValue(
    profile.storageMode === "authenticated" &&
      profile.deploymentTarget === "production" &&
      profile.onboardingV11 === true &&
      profile.requiresRemoteMaia === true &&
      profile.requiresWorker === true &&
      profile.requiresTelemetry === true &&
      profile.failureClosed === true,
    `${prefix} profile must require durable storage, production dependencies, and failure-closed flags.`,
  );
  requireValue(
    JSON.stringify(profile.deprecatedDailyCapabilities) ===
      JSON.stringify(DEPRECATED_DAILY_CAPABILITIES) &&
      DEPRECATED_DAILY_CAPABILITIES.every(
        (flag) => profile.featureFlags[flag] === false,
      ),
    `${prefix} Daily deep minigames and atomic mixed test must be declared deprecated and disabled.`,
  );
  requireValue(
    profile.featureFlags.daily_adaptive_v2 === false &&
      profile.featureFlags.rewards_v2_enabled === false &&
      profile.featureFlags.reward_presentations_v2_enabled === false,
    `${prefix} new Daily and Rewards v2 controls must default off.`,
  );

  if (profile.profileId === "production-3.99") {
    requireValue(
      profile.releaseId === "blundr-production-3.99" &&
        profile.dailyPolicy === "default_free" &&
        profile.adminToolsEnabled === false &&
        Object.values(profile.featureFlags).every(
          (enabled) => enabled === false,
        ),
      `${prefix} production profile must be default-free, admin-disabled, and fully flags-off.`,
    );
  } else {
    requireValue(
      profile.profileId === "staging-3.99" &&
        profile.releaseId === "blundr-staging-3.99",
      `${prefix} unexpected staging profile identity.`,
    );
  }
}

console.log(
  `Verified ${profiles.length} failure-closed feature profiles: ${canonicalFlags.length} flags, cumulative release migration ${CUMULATIVE_RELEASE_MIGRATION_HEAD}, runtime ${runtimePackageId}.`,
);
