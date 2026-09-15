import assert from "node:assert/strict";

import {
  buildGithubEnvironmentExport,
  classifyManagementApiStatus,
  deriveProjectApiUrl,
  extractBrowserSafeApiKeys,
  fetchManagementJson,
  validateCandidateProjectAgainstManagementList,
  validateDisposableProjectMetadata,
  validateReferenceTopology,
} from "./pr01-disposable-project-preflight.mjs";

const keyFixture = [
  { name: "publishable", api_key: "ignored-publishable-key" },
  { name: "anon", api_key: "anon-fixture-key" },
  { name: "service_role", api_key: "service-role-fixture-key" },
];

assert.equal(
  validateDisposableProjectMetadata({ name: "blundr-disposable-rls" }),
  true,
);
assert.throws(() =>
  validateDisposableProjectMetadata({ name: "blundr-staging-rls" }),
);
assert.throws(() =>
  validateDisposableProjectMetadata({ name: "blundr-production-test" }),
);
assert.equal(
  validateDisposableProjectMetadata({ name: "blundr-scratch" }),
  true,
);
assert.deepEqual(
  validateCandidateProjectAgainstManagementList(
    [
      { id: "fresh-ref", name: "blundr-disposable-rls", environment: "ci" },
      { id: "staging-ref", name: "blundr-staging" },
    ],
    "fresh-ref",
  ),
  { managementProjectCount: 2 },
);
assert.throws(() =>
  validateCandidateProjectAgainstManagementList(
    [{ id: "candidate-ref", name: "blundr-test", environment: "production" }],
    "candidate-ref",
  ),
);
assert.throws(() =>
  validateCandidateProjectAgainstManagementList(
    [{ id: "candidate-ref", name: "blundr-staging-rls" }],
    "candidate-ref",
  ),
);
assert.equal(
  validateReferenceTopology({
    freshProjectRef: "fresh-ref",
    upgradeProjectRef: "upgrade-ref",
    testProjectRef: "upgrade-ref",
    candidateProjectRef: "fresh-ref",
    mode: "fresh",
  }),
  true,
);
assert.throws(() =>
  validateReferenceTopology({
    freshProjectRef: "same-ref",
    upgradeProjectRef: "same-ref",
    testProjectRef: "same-ref",
    candidateProjectRef: "same-ref",
    mode: "fresh",
  }),
);
assert.throws(() =>
  validateReferenceTopology({
    freshProjectRef: "fresh-ref",
    upgradeProjectRef: "upgrade-ref",
    testProjectRef: "upgrade-ref",
    candidateProjectRef: "upgrade-ref",
    mode: "fresh",
  }),
);
assert.throws(() =>
  validateReferenceTopology({
    freshProjectRef: "fresh-ref",
    upgradeProjectRef: "upgrade-ref",
    testProjectRef: "fresh-ref",
    candidateProjectRef: "upgrade-ref",
    mode: "upgrade",
  }),
);

const keys = extractBrowserSafeApiKeys(keyFixture);
assert.deepEqual(keys, {
  anon: "anon-fixture-key",
  serviceRole: "service-role-fixture-key",
  fetchedCount: 2,
});
assert.throws(() =>
  extractBrowserSafeApiKeys([{ name: "anon", api_key: "one" }]),
);
assert.throws(() =>
  extractBrowserSafeApiKeys([
    { name: "anon", api_key: "one" },
    { name: "service_role", api_key: "two\nthree" },
  ]),
);
assert.equal(
  buildGithubEnvironmentExport(keys),
  "BLUNDR_RLS_TEST_ANON_KEY=anon-fixture-key\nBLUNDR_RLS_TEST_SERVICE_ROLE_KEY=service-role-fixture-key\n",
);
assert.equal(
  deriveProjectApiUrl("example-ref"),
  "https://example-ref.supabase.co",
);
assert.throws(() => deriveProjectApiUrl("invalid/ref"));

assert.equal(classifyManagementApiStatus(401), "authentication");
assert.equal(classifyManagementApiStatus(403), "authorization");
assert.equal(classifyManagementApiStatus(404), "project_identity");
assert.equal(classifyManagementApiStatus(429), "service");
assert.equal(classifyManagementApiStatus(503), "service");
assert.equal(classifyManagementApiStatus(422), "request_rejected");

{
  const originalFetch = globalThis.fetch;
  let capturedAuthorization = "";
  globalThis.fetch = async (_url, init) => {
    capturedAuthorization = String(init?.headers?.authorization ?? "");
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  const result = await fetchManagementJson(
    "https://api.supabase.com/v1/projects/example-ref",
    "fixture-token",
    "project_metadata",
  );
  assert.deepEqual(result, { ok: true });
  assert.equal(capturedAuthorization, "Bearer fixture-token");
  globalThis.fetch = originalFetch;
}

{
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ message: "must-not-leak" }), {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  await assert.rejects(
    () =>
      fetchManagementJson(
        "https://api.supabase.com/v1/projects/example-ref",
        "secret-token",
        "project_metadata",
      ),
    (error) => {
      assert.equal(
        error.message,
        "Management API project_metadata failed: status=403 category=authorization",
      );
      assert.equal(error.message.includes("secret-token"), false);
      assert.equal(error.message.includes("must-not-leak"), false);
      return true;
    },
  );
  globalThis.fetch = originalFetch;
}

{
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("socket hang up with secret-token");
  };
  await assert.rejects(
    () =>
      fetchManagementJson(
        "https://api.supabase.com/v1/projects/example-ref",
        "secret-token",
        "project_list",
      ),
    (error) => {
      assert.equal(
        error.message,
        "Management API project_list failed: category=network",
      );
      assert.equal(error.message.includes("secret-token"), false);
      return true;
    },
  );
  globalThis.fetch = originalFetch;
}

console.log("PR-01 disposable project preflight fixtures passed.");
