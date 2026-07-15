import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const manifest = JSON.parse(
  readFileSync("release/blundr-mvp-release-manifest.json", "utf8"),
);
const lockfileSha = createHash("sha256")
  .update(readFileSync("package-lock.json"))
  .digest("hex");
const errors = [];
if (manifest.gitSha !== "PENDING_STEP5_CHECKPOINT")
  errors.push(
    "gitSha must remain an explicit checkpoint placeholder until commit",
  );
if (manifest.lockfileSha256 !== lockfileSha)
  errors.push("lockfile checksum mismatch");
if (manifest.migrations?.count !== 7) errors.push("migration count mismatch");
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
