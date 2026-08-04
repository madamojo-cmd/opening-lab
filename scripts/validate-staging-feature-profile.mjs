import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const PROFILE_PATH = "release/feature-profiles/staging-3.99.json";
const profile = JSON.parse(await readFile(PROFILE_PATH, "utf8"));
const contractSource = await readFile("lib/blundr/contracts/index.ts", "utf8");
const runtimeSource = await readFile(
  "lib/blundr/trainingRuntime/trainingRuntimeSchema.ts",
  "utf8",
);
const migrations = (await readdir("supabase/migrations"))
  .filter((file) => file.endsWith(".sql"))
  .sort();

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
const profileFlags = Object.keys(profile.featureFlags ?? {}).sort();

requireValue(profile.schemaVersion === 1, "Unsupported profile schema.");
requireValue(profile.profileId === "staging-3.99", "Unexpected profile ID.");
requireValue(
  profile.releaseId === "blundr-staging-3.99",
  "Unexpected release ID.",
);
requireValue(
  JSON.stringify(profileFlags) === JSON.stringify(canonicalFlags),
  "Feature profile must cover the canonical registry exactly.",
);
requireValue(
  profileFlags.every((flag) => profile.featureFlags[flag] === true),
  "The staging 3.99 profile must explicitly enable every release capability.",
);

const runtimePackageId = runtimeSource.match(
  /TRAINING_RUNTIME_PACKAGE_ID\s*=\s*\n?\s*"([^"]+)"/,
)?.[1];
requireValue(
  profile.runtimePackageId === runtimePackageId,
  "Runtime package identity does not match the checked-in runtime.",
);
const migrationHead = migrations.at(-1)?.split("_")[0];
requireValue(
  profile.migrationHead === migrationHead,
  "Feature profile migration head does not match the repository.",
);
requireValue(
  profile.storageMode === "authenticated" &&
    profile.deploymentTarget === "production" &&
    profile.onboardingV11 === true &&
    profile.requiresRemoteMaia === true &&
    profile.requiresWorker === true &&
    profile.requiresTelemetry === true,
  "Staging must require durable storage, V11 onboarding, remote Maia, worker, and telemetry.",
);

console.log(
  `Verified ${profile.profileId}: ${profileFlags.length} flags, migration ${migrationHead}, runtime ${runtimePackageId}.`,
);
