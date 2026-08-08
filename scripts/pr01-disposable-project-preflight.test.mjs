import assert from "node:assert/strict";

import {
  buildGithubEnvironmentExport,
  deriveProjectApiUrl,
  extractBrowserSafeApiKeys,
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

console.log("PR-01 disposable project preflight fixtures passed.");
