import { writeFile } from "node:fs/promises";
import Stripe from "stripe";

const artifactDir = required("ARTIFACT_DIR");
const STABLE_CALLBACK_HOST =
  "https://blundr-staging-git-launc-291807-adamconnor00-gmailcoms-projects.vercel.app";
const STRIPE_WEBHOOK_PATH = "/api/blundr/billing/stripe/webhook";
const REVENUECAT_WEBHOOK_PATH = "/api/blundr/billing/revenuecat/webhook";

const requiredNames = [
  "WAVE2B_PREVIEW_URL",
  "WAVE2B_EXPECTED_SHA",
  "STRIPE_SECRET_KEY",
  "STRIPE_PRO_MONTHLY_PRICE_ID",
  "STRIPE_PRO_ANNUAL_PRICE_ID",
  "REVENUECAT_V2_SECRET_API_KEY",
  "REVENUECAT_PROJECT_ID",
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

  if (required("REVENUECAT_PRO_ENTITLEMENT_ID") !== "pro") {
    fail("RevenueCat entitlement identifier must be pro.");
  }
  if (required("REVENUECAT_OFFERING_ID") !== "default") {
    fail("RevenueCat offering identifier must be default.");
  }

  const rcResponse = await fetch(
    `https://api.revenuecat.com/v2/projects/${encodeURIComponent(required("REVENUECAT_PROJECT_ID"))}`,
    {
      headers: {
        Authorization: `Bearer ${required("REVENUECAT_V2_SECRET_API_KEY")}`,
        Accept: "application/json",
      },
    },
  );
  if (!rcResponse.ok) {
    fail(
      `RevenueCat v2 API authentication failed with HTTP ${rcResponse.status}.`,
    );
  }
  proof.checks.revenueCatV2ApiAuthenticated = true;
  proof.checks.revenueCatEntitlementIdentifier = "pro";
  proof.checks.revenueCatOfferingIdentifier = "default";
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
