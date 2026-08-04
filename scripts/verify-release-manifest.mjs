import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";

const manifest = JSON.parse(
  readFileSync("release/blundr-mvp-release-manifest.json", "utf8"),
);
const lockfileSha = createHash("sha256")
  .update(readFileSync("package-lock.json"))
  .digest("hex");
const errors = [];
if (Object.hasOwn(manifest, "gitSha"))
  errors.push(
    "static release manifest must not self-reference a mutable gitSha",
  );
if (manifest.gitShaSource !== "VERCEL_GIT_COMMIT_SHA")
  errors.push("immutable deployment SHA source is missing");
if (manifest.lockfileSha256 !== lockfileSha)
  errors.push("lockfile checksum mismatch");
const migrations = readdirSync("supabase/migrations")
  .filter((file) => file.endsWith(".sql"))
  .sort();
if (manifest.migrations?.count !== migrations.length)
  errors.push("migration count mismatch");
if (manifest.migrations?.head !== migrations.at(-1)?.split("_")[0])
  errors.push("migration head mismatch");
if (manifest.releaseId !== "blundr-staging-3.99")
  errors.push("release identity mismatch");
if (manifest.runtime?.packageId !== "blundr-opening-runtime-3.99.v2")
  errors.push("runtime package mismatch");
if (manifest.evidence?.status !== "PENDING_EXACT_SHA_STAGING")
  errors.push("static manifest must not claim deployed evidence");
if (
  manifest.featureFlags?.default !== "off" ||
  manifest.featureFlags?.globalEnablement !== false
)
  errors.push("feature flags are not default-off");
if (manifest.privacy?.policyPublication !== "STAGING_BLOCKER_UNPUBLISHED")
  errors.push("privacy publication status must be explicit");
if (!manifest.rollbackRunbook) errors.push("rollback runbook missing");
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else console.log("Release manifest validation passed.");
