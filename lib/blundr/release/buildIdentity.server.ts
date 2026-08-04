import "server-only";

import { timingSafeEqual } from "node:crypto";

import stagingProfile from "@/release/feature-profiles/staging-3.99.json";
import {
  TRAINING_RUNTIME_FILES,
  TRAINING_RUNTIME_PACKAGE_ID,
  TRAINING_RUNTIME_SOURCE_FILES,
} from "@/lib/blundr/trainingRuntime/trainingRuntimeSchema";
import { FEATURE_FLAGS, type FeatureFlagName } from "@/lib/blundr/contracts";
import { getServerFeatureFlags } from "@/lib/blundr/contracts/serverFeatureFlags";

export const BLUNDR_RELEASE_EVIDENCE_HEADER =
  "x-blundr-release-evidence-token" as const;

export const STAGING_399_RUNTIME_CHECKSUMS = {
  [TRAINING_RUNTIME_FILES.manifest]:
    "abf8f0eef724ef30b94910932d94a04733668f211b43bbd094590c3fad4b35b8",
  [TRAINING_RUNTIME_FILES.openingAvailability]:
    "28c1c90e831fbb83e0eff6c3948b8174f36ae53ca280002576a115d2da12d59a",
  [TRAINING_RUNTIME_FILES.candidates]:
    "203e2ce1b9875598005614a62a8bc71b0621d54275a821527e9c2b7928c7a434",
  [TRAINING_RUNTIME_FILES.nodes]:
    "733eed769cb99da43dec31e0b9ec01151d89501ef8adf46a063d0212ed7bf959",
  [TRAINING_RUNTIME_FILES.openingIndex]:
    "9e08df331898dcabdc627282f65d8256810fc4415ef4d2fc8cf74ce23f18419b",
  [TRAINING_RUNTIME_FILES.validationReport]:
    "dbbfd2acf44f2544820ac5d1c1b9aaa5cba69c694bf4339475f55de58100d94b",
} as const;

const SHA_40 = /^[0-9a-f]{40}$/i;

function text(value: string | undefined): string | null {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function isTrue(value: string | undefined): boolean {
  return ["1", "true", "yes", "on"].includes(
    String(value ?? "")
      .trim()
      .toLowerCase(),
  );
}

function sameSecret(supplied: string | null, expected: string): boolean {
  if (!supplied) return false;
  const left = Buffer.from(supplied);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export type BlundrBuildIdentity = {
  schemaVersion: 1;
  releaseId: string | null;
  gitSha: string | null;
  featureProfileId: string | null;
  migrationHead: string | null;
  runtime: {
    packageId: string;
    sourceFiles: typeof TRAINING_RUNTIME_SOURCE_FILES;
    checksums: typeof STAGING_399_RUNTIME_CHECKSUMS;
  };
  deployment: {
    id: string | null;
    url: string | null;
    environment: string | null;
  };
  configuration: {
    storageMode: string | null;
    onboardingV11: boolean;
    featureFlags: Readonly<Record<FeatureFlagName, boolean>>;
  };
  expected: typeof stagingProfile;
  ready: boolean;
  issues: string[];
};

export function readBlundrBuildIdentity(): BlundrBuildIdentity {
  const gitSha = text(
    process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.BLUNDR_BUILD_GIT_SHA,
  );
  const releaseId = text(process.env.BLUNDR_RELEASE_ID);
  const featureProfileId = text(process.env.BLUNDR_FEATURE_PROFILE_ID);
  const migrationHead = text(process.env.BLUNDR_MIGRATION_HEAD);
  const storageMode = text(process.env.NEXT_PUBLIC_BLUNDR_STORAGE_MODE);
  const deploymentId = text(process.env.VERCEL_DEPLOYMENT_ID);
  const deploymentUrl = text(process.env.VERCEL_URL);
  const deploymentEnvironment = text(process.env.VERCEL_ENV);
  const onboardingV11 = isTrue(process.env.NEXT_PUBLIC_BLUNDR_ONBOARDING_V11);
  const featureFlags = getServerFeatureFlags();
  const issues: string[] = [];

  if (!gitSha || !SHA_40.test(gitSha)) issues.push("invalid_git_sha");
  if (releaseId !== stagingProfile.releaseId)
    issues.push("release_id_mismatch");
  if (featureProfileId !== stagingProfile.profileId)
    issues.push("feature_profile_mismatch");
  if (migrationHead !== stagingProfile.migrationHead)
    issues.push("migration_head_mismatch");
  if (TRAINING_RUNTIME_PACKAGE_ID !== stagingProfile.runtimePackageId)
    issues.push("runtime_package_mismatch");
  if (storageMode !== stagingProfile.storageMode)
    issues.push("storage_mode_mismatch");
  if (onboardingV11 !== stagingProfile.onboardingV11)
    issues.push("onboarding_v11_mismatch");
  if (deploymentEnvironment !== stagingProfile.deploymentTarget)
    issues.push("deployment_target_mismatch");
  if (!deploymentId) issues.push("deployment_id_missing");
  if (!deploymentUrl) issues.push("deployment_url_missing");

  for (const flag of Object.keys(FEATURE_FLAGS) as FeatureFlagName[]) {
    if (featureFlags[flag] !== stagingProfile.featureFlags[flag])
      issues.push(`feature_flag_mismatch:${flag}`);
  }

  return {
    schemaVersion: 1,
    releaseId,
    gitSha: gitSha?.toLowerCase() ?? null,
    featureProfileId,
    migrationHead,
    runtime: {
      packageId: TRAINING_RUNTIME_PACKAGE_ID,
      sourceFiles: TRAINING_RUNTIME_SOURCE_FILES,
      checksums: STAGING_399_RUNTIME_CHECKSUMS,
    },
    deployment: {
      id: deploymentId,
      url: deploymentUrl,
      environment: deploymentEnvironment,
    },
    configuration: { storageMode, onboardingV11, featureFlags },
    expected: stagingProfile,
    ready: issues.length === 0,
    issues,
  };
}

export function authorizeReleaseEvidenceRequest(
  request: Request,
):
  | { authorized: true }
  | { authorized: false; status: 401 | 503; error: string } {
  const expected = text(process.env.BLUNDR_RELEASE_EVIDENCE_TOKEN);
  if (!expected)
    return {
      authorized: false,
      status: 503,
      error: "release_evidence_not_configured",
    };
  const supplied = text(
    request.headers.get(BLUNDR_RELEASE_EVIDENCE_HEADER) ?? undefined,
  );
  if (!sameSecret(supplied, expected))
    return { authorized: false, status: 401, error: "unauthorized" };
  return { authorized: true };
}
