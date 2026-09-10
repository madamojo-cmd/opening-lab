import { writeFile } from "node:fs/promises";
import Stripe from "stripe";

const artifactDir = required("ARTIFACT_DIR");
const STABLE_CALLBACK_HOST =
  "https://blundr-staging-git-launc-291807-adamconnor00-gmailcoms-projects.vercel.app";
const STRIPE_WEBHOOK_PATH = "/api/blundr/billing/stripe/webhook";
const REVENUECAT_WEBHOOK_PATH = "/api/blundr/billing/revenuecat/webhook";
const REVENUECAT_V2_API_ORIGIN = "https://api.revenuecat.com/v2";

const requiredNames = [
  "WAVE2B_PREVIEW_URL",
  "WAVE2B_EXPECTED_SHA",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRO_MONTHLY_PRICE_ID",
  "STRIPE_PRO_ANNUAL_PRICE_ID",
  "REVENUECAT_REST_API_KEY",
  "REVENUECAT_V2_SECRET_API_KEY",
  "REVENUECAT_PROJECT_ID",
  "REVENUECAT_SANDBOX_APP_ID",
  "REVENUECAT_PRO_ENTITLEMENT_ID",
  "REVENUECAT_OFFERING_ID",
];

const proof = {
  classification: "PROVIDER_CONFIGURATION_CHECK",
  status: "started",
  missingConfigurationNames: [],
  callbackHost: STABLE_CALLBACK_HOST,
  checks: {},
};

function required(name) {
  const value = String(process.env[name] ?? "").trim();
  if (!value) throw new Error(`missing:${name}`);
  return value;
}

function hasValue(name) {
  return Boolean(String(process.env[name] ?? "").trim());
}

function extractSha(body) {
  const candidates = [
    body?.sha,
    body?.gitSha,
    body?.commitSha,
    body?.build?.gitSha,
    body?.build?.git_sha,
    body?.build?.sha,
    body?.deployment?.gitSha,
  ];
  return candidates.find(
    (value) => typeof value === "string" && /^[0-9a-f]{40}$/i.test(value),
  );
}

async function readJson(url, init = {}) {
  const response = await fetch(url, { redirect: "manual", ...init });
  const body = await response.json().catch(() => null);
  return { response, body };
}

async function assertWebhookReachable(origin, path, label) {
  const { response } = await readJson(`${origin}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  if ([400, 401, 403].includes(response.status)) return;
  fail(
    `${label} POST route was not reachable as a protected webhook endpoint.`,
  );
}

function collectStrings(value, into = []) {
  if (typeof value === "string") {
    into.push(value);
    return into;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, into);
    return into;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectStrings(item, into);
  }
  return into;
}

function readId(value) {
  if (!value || typeof value !== "object") return null;
  return value.id ?? value.app?.id ?? value.data?.id ?? null;
}

function listItems(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value.items)) return value.items;
  if (Array.isArray(value.data)) return value.data;
  return [];
}

function isActiveResource(value) {
  if (!value || typeof value !== "object") return false;
  if (value.archived_at) return false;
  if (typeof value.state === "string") return value.state === "active";
  if (typeof value.is_active === "boolean") return value.is_active;
  return true;
}

function isCurrentOffering(value) {
  if (!value || typeof value !== "object") return false;
  if (typeof value.is_current === "boolean") return value.is_current;
  if (typeof value.current === "boolean") return value.current;
  return false;
}

function findUniqueLookupResource(
  items,
  lookupKey,
  label,
  predicate = () => true,
) {
  const matches = items.filter(
    (item) =>
      item &&
      typeof item === "object" &&
      item.lookup_key === lookupKey &&
      predicate(item),
  );
  if (matches.length !== 1) {
    fail(
      `RevenueCat ${label} lookup key ${lookupKey} matched ${matches.length} resources.`,
    );
  }
  const resourceId = readId(matches[0]);
  if (!resourceId) {
    fail(`RevenueCat ${label} lookup key ${lookupKey} did not expose an id.`);
  }
  return { resource: matches[0], resourceId };
}

async function revenueCatV2(path) {
  const response = await fetch(`${REVENUECAT_V2_API_ORIGIN}${path}`, {
    headers: {
      Authorization: `Bearer ${required("REVENUECAT_V2_SECRET_API_KEY")}`,
      Accept: "application/json",
    },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    fail(`RevenueCat v2 API request failed with HTTP ${response.status}.`);
  }
  return body;
}

async function write() {
  await writeFile(
    `${artifactDir}/provider-configuration-check.json`,
    `${JSON.stringify(proof, null, 2)}\n`,
  );
}

function fail(message) {
  proof.status = "failed";
  proof.error = message;
  throw new Error(message);
}

try {
  proof.missingConfigurationNames = requiredNames.filter(
    (name) => !hasValue(name),
  );
  if (proof.missingConfigurationNames.length) {
    proof.status = "configuration_pending";
    await write();
    process.exit(0);
  }

  const preview = new URL(required("WAVE2B_PREVIEW_URL"));
  const callbackHost = new URL(STABLE_CALLBACK_HOST);
  proof.callbackHost = callbackHost.origin;
  if (preview.protocol !== "https:") fail("WAVE2B_PREVIEW_URL must be HTTPS.");
  if (callbackHost.protocol !== "https:")
    fail("stable callback host must be HTTPS.");
  if (callbackHost.hostname === preview.hostname) {
    fail("stable callback host must be distinct from immutable preview URL.");
  }

  const expectedSha = required("WAVE2B_EXPECTED_SHA").toLowerCase();
  const health = await readJson(`${callbackHost.origin}/api/health`);
  const callbackSha = extractSha(health.body);
  proof.checks.callbackHostHealthStatus = health.response.status;
  proof.checks.callbackHostShaVerified =
    callbackSha?.toLowerCase() === expectedSha;
  if (!proof.checks.callbackHostShaVerified) {
    fail("Stable callback host does not expose the expected SHA.");
  }
  await assertWebhookReachable(
    callbackHost.origin,
    STRIPE_WEBHOOK_PATH,
    "Stripe webhook",
  );
  await assertWebhookReachable(
    callbackHost.origin,
    REVENUECAT_WEBHOOK_PATH,
    "RevenueCat webhook",
  );
  proof.checks.stripeWebhookReachable = true;
  proof.checks.revenueCatWebhookReachable = true;

  const stripeSecretKey = required("STRIPE_SECRET_KEY");
  if (stripeSecretKey.startsWith("sk_live_")) {
    fail("Live-mode Stripe credentials are forbidden.");
  }
  if (!stripeSecretKey.startsWith("sk_test_")) {
    fail("STRIPE_SECRET_KEY must be a test-mode key.");
  }
  if (!required("STRIPE_WEBHOOK_SECRET").startsWith("whsec_")) {
    fail("STRIPE_WEBHOOK_SECRET must be a Stripe webhook signing secret.");
  }

  const monthlyPriceId = required("STRIPE_PRO_MONTHLY_PRICE_ID");
  const annualPriceId = required("STRIPE_PRO_ANNUAL_PRICE_ID");
  if (monthlyPriceId !== "price_1UDmveLuqtbLOQt39LJ8Pp4v") {
    fail("Monthly Stripe price does not match the Blundr Sandbox contract.");
  }
  if (annualPriceId !== "price_1UDmw4LuqtbLOQt3G6bgL5mY") {
    fail("Annual Stripe price does not match the Blundr Sandbox contract.");
  }

  const stripe = new Stripe(stripeSecretKey);
  const [monthly, annual, portalConfigurations] = await Promise.all([
    stripe.prices.retrieve(monthlyPriceId),
    stripe.prices.retrieve(annualPriceId),
    stripe.billingPortal.configurations.list({ limit: 1, active: true }),
  ]);
  if (monthly.livemode || annual.livemode) {
    fail("Configured Stripe prices must be test-mode objects.");
  }
  if (
    !monthly.active ||
    monthly.unit_amount !== 999 ||
    monthly.currency !== "usd"
  ) {
    fail("Monthly Stripe price amount/currency mismatch.");
  }
  if (monthly.recurring?.interval !== "month") {
    fail("Monthly Stripe price interval mismatch.");
  }
  if (
    !annual.active ||
    annual.unit_amount !== 6999 ||
    annual.currency !== "usd"
  ) {
    fail("Annual Stripe price amount/currency mismatch.");
  }
  if (annual.recurring?.interval !== "year") {
    fail("Annual Stripe price interval mismatch.");
  }
  if (!portalConfigurations.data.length) {
    fail("Stripe Customer Portal has no active test-mode configuration.");
  }
  proof.checks.stripeTestMode = true;
  proof.checks.monthlyPriceVerified = true;
  proof.checks.annualPriceVerified = true;
  proof.checks.customerPortalConfigured = true;

  if (required("REVENUECAT_SANDBOX_APP_ID") !== "appe3b4140fc1") {
    fail("RevenueCat sandbox app identifier must be appe3b4140fc1.");
  }
  if (required("REVENUECAT_PRO_ENTITLEMENT_ID") !== "pro") {
    fail("RevenueCat entitlement identifier must be pro.");
  }
  if (required("REVENUECAT_OFFERING_ID") !== "default") {
    fail("RevenueCat offering identifier must be default.");
  }

  const projectId = required("REVENUECAT_PROJECT_ID");
  const appId = required("REVENUECAT_SANDBOX_APP_ID");
  const entitlementId = required("REVENUECAT_PRO_ENTITLEMENT_ID");
  const offeringId = required("REVENUECAT_OFFERING_ID");

  const rcSubscriberResponse = await fetch(
    "https://api.revenuecat.com/v1/subscribers/wave2b-provider-check",
    {
      headers: {
        Authorization: `Bearer ${required("REVENUECAT_REST_API_KEY")}`,
        Accept: "application/json",
      },
    },
  );
  if (!rcSubscriberResponse.ok) {
    fail(
      `RevenueCat v1 API authentication failed with HTTP ${rcSubscriberResponse.status}.`,
    );
  }

  const projects = await revenueCatV2("/projects");
  const projectIds = listItems(projects).map(readId).filter(Boolean);
  if (!projectIds.includes(projectId)) {
    fail(
      "RevenueCat configured project was not found in the v2 projects list.",
    );
  }
  const [apps, app, entitlements, offerings] = await Promise.all([
    revenueCatV2(`/projects/${encodeURIComponent(projectId)}/apps`),
    revenueCatV2(
      `/projects/${encodeURIComponent(projectId)}/apps/${encodeURIComponent(appId)}`,
    ),
    revenueCatV2(`/projects/${encodeURIComponent(projectId)}/entitlements`),
    revenueCatV2(`/projects/${encodeURIComponent(projectId)}/offerings`),
  ]);

  const appsText = collectStrings(apps).join("\n").toLowerCase();
  if (!collectStrings(apps).includes(appId) && !appsText.includes(appId)) {
    fail("RevenueCat sandbox app was not listed under the configured project.");
  }
  if (readId(app) !== appId && !collectStrings(app).includes(appId)) {
    fail(
      "RevenueCat sandbox app response did not match the configured app id.",
    );
  }
  const { resourceId: entitlementResourceId } = findUniqueLookupResource(
    listItems(entitlements),
    entitlementId,
    "entitlement",
    isActiveResource,
  );
  const offeringMatches = listItems(offerings).filter(
    (item) =>
      item &&
      typeof item === "object" &&
      item.lookup_key === offeringId &&
      isActiveResource(item),
  );
  const currentOfferingMatches = offeringMatches.filter(isCurrentOffering);
  const { resourceId: offeringResourceId } = findUniqueLookupResource(
    currentOfferingMatches.length ? currentOfferingMatches : offeringMatches,
    offeringId,
    "offering",
  );
  const [entitlement, offering, offeringPackages] = await Promise.all([
    revenueCatV2(
      `/projects/${encodeURIComponent(projectId)}/entitlements/${encodeURIComponent(entitlementResourceId)}`,
    ),
    revenueCatV2(
      `/projects/${encodeURIComponent(projectId)}/offerings/${encodeURIComponent(offeringResourceId)}`,
    ),
    revenueCatV2(
      `/projects/${encodeURIComponent(projectId)}/offerings/${encodeURIComponent(offeringResourceId)}/packages?expand=items.product`,
    ),
  ]);

  const entitlementText = collectStrings(entitlement).join("\n").toLowerCase();
  if (!entitlementText.includes(entitlementId)) {
    fail("RevenueCat pro entitlement was not found in v2 configuration.");
  }
  const offeringText = collectStrings(offering).join("\n").toLowerCase();
  if (!offeringText.includes(offeringId)) {
    fail("RevenueCat default offering was not found in v2 configuration.");
  }
  const productMappingText = collectStrings([offering, offeringPackages])
    .join("\n")
    .toLowerCase();
  if (
    !productMappingText.includes(monthlyPriceId.toLowerCase()) ||
    !productMappingText.includes(annualPriceId.toLowerCase())
  ) {
    fail("RevenueCat offering does not reference both sandbox Stripe prices.");
  }

  proof.checks.revenueCatV1ApiAuthenticated = true;
  proof.checks.revenueCatV2ApiAuthenticated = true;
  proof.checks.revenueCatProjectVerified = true;
  proof.checks.revenueCatSandboxAppVerified = true;
  proof.checks.revenueCatSandboxAppId = appId;
  proof.checks.revenueCatEntitlementLookupKey = "pro";
  proof.checks.revenueCatEntitlementResourceVerified = true;
  proof.checks.revenueCatEntitlementIdentifier = "pro";
  proof.checks.revenueCatOfferingLookupKey = "default";
  proof.checks.revenueCatOfferingResourceVerified = true;
  proof.checks.revenueCatOfferingIdentifier = "default";
  proof.checks.revenueCatProductMappingVerified = true;
  proof.status = "passed";
  await write();
  console.log("Provider configuration check passed.");
} catch (error) {
  if (proof.status !== "configuration_pending") {
    proof.status = "failed";
    proof.error = error instanceof Error ? error.message : String(error);
    await write();
  }
  throw error;
}
