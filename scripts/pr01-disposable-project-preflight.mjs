import assert from "node:assert/strict";
import { appendFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const managementApiBaseUrl = "https://api.supabase.com/v1";
const forbiddenProjectNameMarker = /staging|production|prod/i;

function assertContract(condition, message) {
  assert.ok(condition, `PR-01 disposable project preflight: ${message}`);
}

export function validateDisposableProjectMetadata(project) {
  assertContract(
    project && typeof project.name === "string" && project.name.length > 0,
    "project metadata must include a name",
  );
  assertContract(
    !forbiddenProjectNameMarker.test(project.name),
    "project name must not identify staging or production",
  );
  return true;
}

function projectEnvironmentMetadata(project) {
  return [project?.environment, project?.metadata?.environment]
    .filter((value) => typeof value === "string")
    .join(" ");
}

export function validateCandidateProjectAgainstManagementList(
  projects,
  candidateRef,
) {
  assertContract(
    Array.isArray(projects),
    "Management API project list must be an array",
  );
  const candidates = projects.filter(
    (project) =>
      project &&
      (project.id === candidateRef ||
        project.ref === candidateRef ||
        project.project_ref === candidateRef),
  );
  assertContract(
    candidates.length === 1,
    "candidate project reference must resolve to exactly one Management API project",
  );
  const [candidate] = candidates;
  validateDisposableProjectMetadata(candidate);
  assertContract(
    !forbiddenProjectNameMarker.test(projectEnvironmentMetadata(candidate)),
    "project environment metadata must not identify staging or production",
  );
  return { managementProjectCount: projects.length };
}

export function validateReferenceTopology({
  freshProjectRef,
  upgradeProjectRef,
  testProjectRef,
  candidateProjectRef,
  mode,
}) {
  const references = [
    freshProjectRef,
    upgradeProjectRef,
    testProjectRef,
    candidateProjectRef,
  ];
  assertContract(
    references.every(
      (projectRef) =>
        typeof projectRef === "string" && /^[a-z0-9-]+$/i.test(projectRef),
    ),
    "fresh, upgrade, test, and candidate project references must be valid",
  );
  assertContract(
    freshProjectRef !== upgradeProjectRef,
    "fresh and upgrade project references must be distinct",
  );
  assertContract(
    testProjectRef === upgradeProjectRef,
    "test project reference must equal the upgrade project reference",
  );
  assertContract(
    mode === "fresh" || mode === "upgrade",
    "preflight mode must be fresh or upgrade",
  );
  assertContract(
    candidateProjectRef ===
      (mode === "fresh" ? freshProjectRef : upgradeProjectRef),
    "candidate project reference must match the preflight mode",
  );
  return true;
}

export function extractBrowserSafeApiKeys(apiKeys) {
  assertContract(
    Array.isArray(apiKeys),
    "Management API key response must be an array",
  );

  const byName = new Map();
  for (const apiKey of apiKeys) {
    if (!apiKey || typeof apiKey.name !== "string") continue;
    if (apiKey.name !== "anon" && apiKey.name !== "service_role") continue;
    assertContract(
      typeof apiKey.api_key === "string" &&
        apiKey.api_key.length > 0 &&
        !/[\r\n]/.test(apiKey.api_key),
      `${apiKey.name} API key must be a non-empty single-line value`,
    );
    assertContract(
      !byName.has(apiKey.name),
      `Management API returned duplicate ${apiKey.name} keys`,
    );
    byName.set(apiKey.name, apiKey.api_key);
  }

  assertContract(
    byName.has("anon"),
    "Management API did not return an anon key",
  );
  assertContract(
    byName.has("service_role"),
    "Management API did not return a service_role key",
  );
  return {
    anon: byName.get("anon"),
    serviceRole: byName.get("service_role"),
    fetchedCount: byName.size,
  };
}

export function buildGithubEnvironmentExport({ anon, serviceRole }) {
  assertContract(
    typeof anon === "string" && anon.length > 0 && !/[\r\n]/.test(anon),
    "anon key export must be a non-empty single-line value",
  );
  assertContract(
    typeof serviceRole === "string" &&
      serviceRole.length > 0 &&
      !/[\r\n]/.test(serviceRole),
    "service_role key export must be a non-empty single-line value",
  );
  return [
    `BLUNDR_RLS_TEST_ANON_KEY=${anon}`,
    `BLUNDR_RLS_TEST_SERVICE_ROLE_KEY=${serviceRole}`,
    "",
  ].join("\n");
}

export function deriveProjectApiUrl(projectRef) {
  assertContract(
    typeof projectRef === "string" && /^[a-z0-9-]+$/i.test(projectRef),
    "project reference must be valid before deriving an API URL",
  );
  return `https://${projectRef}.supabase.co`;
}

async function fetchJson(url, accessToken) {
  let response;
  try {
    response = await fetch(url, {
      headers: { authorization: `Bearer ${accessToken}` },
    });
  } catch {
    throw new Error("Management API request failed");
  }
  if (!response.ok) throw new Error("Management API request failed");
  try {
    return await response.json();
  } catch {
    throw new Error("Management API response was invalid");
  }
}

async function exportCredentialsToGithubEnvironment(
  { apiUrl, ...keys },
  githubEnvironmentPath,
) {
  process.stdout.write(`::add-mask::${apiUrl}\n`);
  process.stdout.write(`::add-mask::${keys.anon}\n`);
  process.stdout.write(`::add-mask::${keys.serviceRole}\n`);
  await appendFile(
    githubEnvironmentPath,
    `BLUNDR_RLS_TEST_URL=${apiUrl}\n${buildGithubEnvironmentExport(keys)}`,
    "utf8",
  );
}

async function main() {
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  const projectRef = process.env.BLUNDR_PR01_PREFLIGHT_PROJECT_REF;
  const mode = process.env.BLUNDR_PR01_PREFLIGHT_MODE;
  const freshProjectRef = process.env.BLUNDR_RLS_FRESH_PROJECT_REF;
  const upgradeProjectRef = process.env.BLUNDR_RLS_UPGRADE_PROJECT_REF;
  const testProjectRef = process.env.BLUNDR_RLS_TEST_PROJECT_REF;
  const environmentRole = process.env.BLUNDR_RLS_TEST_ENVIRONMENT_ROLE;
  const shouldExportKeys = process.env.BLUNDR_PR01_EXPORT_API_KEYS === "true";

  assertContract(
    typeof accessToken === "string" && accessToken.length > 0,
    "access token is required",
  );
  validateReferenceTopology({
    freshProjectRef,
    upgradeProjectRef,
    testProjectRef,
    candidateProjectRef: projectRef,
    mode,
  });
  assertContract(
    environmentRole === "disposable",
    "environment role must be disposable",
  );
  assertContract(
    !shouldExportKeys || Boolean(process.env.GITHUB_ENV),
    "GITHUB_ENV is required when API-key export is enabled",
  );

  const project = await fetchJson(
    `${managementApiBaseUrl}/projects/${encodeURIComponent(projectRef)}`,
    accessToken,
  );
  validateDisposableProjectMetadata(project);
  const managementProjectList = await fetchJson(
    `${managementApiBaseUrl}/projects`,
    accessToken,
  );
  const { managementProjectCount } =
    validateCandidateProjectAgainstManagementList(
      managementProjectList,
      projectRef,
    );
  const apiUrl = deriveProjectApiUrl(projectRef);
  const keys = extractBrowserSafeApiKeys(
    await fetchJson(
      `${managementApiBaseUrl}/projects/${encodeURIComponent(projectRef)}/api-keys`,
      accessToken,
    ),
  );
  if (shouldExportKeys) {
    await exportCredentialsToGithubEnvironment(
      { ...keys, apiUrl },
      process.env.GITHUB_ENV,
    );
  }

  console.log(
    `PR-01 disposable project preflight: metadata_valid=true management_project_count=${managementProjectCount} api_keys_fetched=${keys.fetchedCount} credentials_exported=${shouldExportKeys}.`,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    const safeMessage =
      error instanceof Error ? error.message : "unknown preflight failure";
    console.error(`PR-01 disposable project preflight failed: ${safeMessage}`);
    process.exitCode = 1;
  });
}
