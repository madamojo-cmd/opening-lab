import { chromium } from "@playwright/test";
import { randomBytes, randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import Stripe from "stripe";

const artifactDir = required("ARTIFACT_DIR");
const baseUrl = required("WAVE2B_PREVIEW_URL").replace(/\/+$/, "");
const expectedSha = required("WAVE2B_EXPECTED_SHA").toLowerCase();
const stableCallbackHost =
  "https://blundr-staging-git-launc-291807-adamconnor00-gmailcoms-projects.vercel.app";
const stableCallbackOrigin = new URL(stableCallbackHost).origin;
const supabaseUrl = new URL(required("BLUNDR_STAGING_SUPABASE_URL"));
const supabaseSecretKey = required("BLUNDR_STAGING_SUPABASE_SECRET_KEY");
const stripe = new Stripe(required("STRIPE_SECRET_KEY"));
const revenueCatEntitlementId = required("REVENUECAT_PRO_ENTITLEMENT_ID");

const proof = {
  classification: "SANDBOX_INTEGRATION_PROOF",
  status: "started",
  acceptanceEligible: false,
  cleanup: {
    attempted: false,
    subscriptionCanceled: false,
    subscriptionCancelVerified: false,
    browserClosed: false,
    userDeleted: false,
    userDeleteVerified: false,
    completed: false,
  },
  checks: {},
  evidence: {},
};

let ephemeralUser = null;
let stripeSubscriptionId = null;
let browser = null;
let browserContext = null;
let stripeSubscription = null;
let stripeSyntheticEventId = null;
let ephemeralAccessToken = null;

function required(name) {
  const value = String(process.env[name] ?? "").trim();
  if (!value) throw new Error(`missing:${name}`);
  return value;
}

function mask(value, label = "MASKED") {
  if (!value) return value;
  const text = String(value);
  console.log(`::add-mask::${text}`);
  return `[${label}]`;
}

function sanitizeError(value) {
  return String(value ?? "unknown")
    .replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi,
      "[redacted-uuid]",
    )
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/\b(?:sub|cs|evt|cus)_[A-Za-z0-9_]+/g, "[redacted-provider-id]")
    .replace(
      /\b(?:sk_live|sk_test|whsec|rk_live|eyJ|vcp_|gh[pousr]_)[A-Za-z0-9_.-]+/g,
      "[redacted-secret]",
    );
}

function assertNonProductionUrl(value, label) {
  const url = new URL(value);
  const host = url.hostname.toLowerCase();
  const productionHosts = new Set([
    "blundr.com",
    "www.blundr.com",
    "app.blundr.com",
    "blundr.ai",
    "www.blundr.ai",
    "blundr.vercel.app",
  ]);
  if (url.protocol !== "https:") throw new Error(`${label}_must_be_https`);
  if (productionHosts.has(host))
    throw new Error(`${label}_must_not_be_production`);
  return url;
}

function assertUuid(value, label) {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      String(value ?? ""),
    )
  ) {
    throw new Error(`${label}_must_be_uuid`);
  }
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

async function verifyDeploymentSha(origin, label) {
  const response = await fetch(`${origin}/api/health`, {
    redirect: "manual",
  });
  const body = await response.json().catch(() => null);
  const sha = extractSha(body);
  if (sha?.toLowerCase() !== expectedSha) {
    throw new Error(`${label}_sha_mismatch`);
  }
  proof.checks[`${label}Sha`] = true;
}

async function verifyStableCallbackHostSha(label) {
  await verifyDeploymentSha(stableCallbackOrigin, `${label}CallbackHost`);
}

async function verifyPreviewSha(label) {
  await verifyDeploymentSha(baseUrl, `${label}Preview`);
}

function redactedId(value) {
  if (!value) return null;
  return `${String(value).slice(0, 6)}...${String(value).slice(-4)}`;
}

async function writeProof() {
  await writeFile(
    `${artifactDir}/sandbox-integration-proof.json`,
    `${JSON.stringify(proof, null, 2)}\n`,
  );
}

async function supabaseAdmin(path, init = {}) {
  const response = await fetch(`${supabaseUrl.origin}${path}`, {
    ...init,
    headers: {
      apikey: supabaseSecretKey,
      Authorization: `Bearer ${supabaseSecretKey}`,
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const body = await response.json().catch(() => null);
  return { response, body };
}

async function supabaseRest(table, params) {
  const search = new URLSearchParams(params);
  const response = await fetch(
    `${supabaseUrl.origin}/rest/v1/${table}?${search}`,
    {
      headers: {
        apikey: supabaseSecretKey,
        Authorization: `Bearer ${supabaseSecretKey}`,
        accept: "application/json",
      },
    },
  );
  const body = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(body)) {
    throw new Error(`supabase_rest_${table}_failed:${response.status}`);
  }
  return body;
}

async function createEphemeralUser() {
  if (!supabaseSecretKey.startsWith("sb_secret_")) {
    throw new Error(
      "BLUNDR_STAGING_SUPABASE_SECRET_KEY must be a modern sb_secret_ key.",
    );
  }
  assertNonProductionUrl(supabaseUrl.toString(), "supabase_url");
  if (!/supabase\.(co|in)$/.test(supabaseUrl.hostname)) {
    throw new Error(
      "Supabase host is not recognized as non-production Supabase.",
    );
  }
  const email = `wave2b-${Date.now()}-${randomUUID()}@example.test`;
  const password = `${randomBytes(24).toString("base64url")}aA1!`;
  mask(email, "EPHEMERAL_EMAIL");
  mask(password, "EPHEMERAL_PASSWORD");
  const { response, body } = await supabaseAdmin("/auth/v1/admin/users", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        blundr_validation: "wave2b_sandbox_integration",
      },
    }),
  });
  if (!response.ok) {
    throw new Error(`supabase_ephemeral_user_create_failed:${response.status}`);
  }
  const id = body?.id;
  assertUuid(id, "ephemeral_user_id");
  mask(id, "EPHEMERAL_UUID");
  return { email, password, id };
}

async function deleteEphemeralUser() {
  if (!ephemeralUser?.id) return;
  const { response } = await supabaseAdmin(
    `/auth/v1/admin/users/${encodeURIComponent(ephemeralUser.id)}`,
    { method: "DELETE" },
  );
  proof.cleanup.userDeleted = response.ok;
  if (!response.ok) proof.cleanup.userDeleteStatus = response.status;
  const verification = await supabaseAdmin(
    `/auth/v1/admin/users/${encodeURIComponent(ephemeralUser.id)}`,
    { method: "GET" },
  );
  proof.cleanup.userDeleteVerified =
    verification.response.status === 404 || !verification.body?.user?.id;
}

async function cancelStripeSubscription() {
  if (!stripeSubscriptionId) return;
  try {
    const canceled = await stripe.subscriptions.cancel(stripeSubscriptionId);
    proof.cleanup.subscriptionCanceled = canceled.status === "canceled";
    const verified = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    proof.cleanup.subscriptionCancelVerified = verified.status === "canceled";
  } catch (error) {
    proof.cleanup.subscriptionCancelError = sanitizeError(
      error instanceof Error ? error.message : String(error),
    );
  }
}

async function closeBrowser() {
  await browserContext?.close().catch(() => {});
  await browser?.close();
  proof.cleanup.browserClosed = true;
}

function cleanupSucceeded() {
  return (
    proof.cleanup.subscriptionCanceled === true &&
    proof.cleanup.subscriptionCancelVerified === true &&
    proof.cleanup.browserClosed === true &&
    proof.cleanup.userDeleted === true &&
    proof.cleanup.userDeleteVerified === true
  );
}

async function appJson(page, path, init = {}) {
  return page.evaluate(
    async ({ path, init, accessToken }) => {
      const response = await fetch(path, {
        ...init,
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
          ...(init.headers || {}),
        },
        credentials: "same-origin",
      });
      const body = await response.json().catch(() => null);
      return { status: response.status, ok: response.ok, body };
    },
    { path, init, accessToken: ephemeralAccessToken },
  );
}

async function signIn(page) {
  await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
  await page.getByRole("textbox", { name: /email/i }).fill(ephemeralUser.email);
  await page
    .getByRole("textbox", { name: /password/i })
    .fill(ephemeralUser.password);
  const authResponsePromise = page.waitForResponse(
    (candidate) => {
      const url = new URL(candidate.url());
      return (
        url.hostname.endsWith(".supabase.co") &&
        url.pathname === "/auth/v1/token" &&
        candidate.request().method() === "POST"
      );
    },
    { timeout: 30000 },
  );
  await Promise.all([
    page.waitForURL((url) => url.origin === baseUrl, { timeout: 30000 }),
    page.getByRole("button", { name: /sign in/i }).click(),
  ]).catch(async () => {
    await page.waitForLoadState("networkidle").catch(() => {});
  });
  proof.evidence.login = {
    formSubmitted: true,
    resultingOrigin:
      new URL(page.url()).origin === baseUrl ? "preview" : "other",
    resultingPathname: new URL(page.url()).pathname,
    authSessionMechanism: "supabase_password_token_response",
    authenticatedUserMatch: false,
    accessTokenAvailable: false,
    apiSessionAccepted: false,
  };
  const authResponse = await authResponsePromise.catch(() => null);
  if (!authResponse) throw new Error("ephemeral_auth_response_not_observed");
  if (!authResponse.ok()) {
    throw new Error(`ephemeral_login_rejected:${authResponse.status()}`);
  }
  const authBody = await authResponse.json().catch(() => null);
  const session = {
    id: authBody?.user?.id ?? authBody?.session?.user?.id ?? null,
    accessToken: authBody?.access_token ?? authBody?.session?.access_token,
  };
  proof.evidence.login.authenticatedUserMatch = session.id === ephemeralUser.id;
  proof.evidence.login.accessTokenAvailable = Boolean(session.accessToken);
  if (session.id !== ephemeralUser.id)
    throw new Error("ephemeral_user_login_mismatch");
  if (!session.accessToken) throw new Error("ephemeral_access_token_missing");
  ephemeralAccessToken = session.accessToken;
  const apiSession = await appJson(page, "/api/blundr/onboarding/v11");
  proof.evidence.login.apiSessionAccepted = apiSession.ok;
  if (!apiSession.ok) {
    throw new Error(`ephemeral_bearer_session_unaccepted:${apiSession.status}`);
  }
  proof.checks.ephemeralUserAuthenticated = true;
}

async function completeOnboardingToPlan(page) {
  const steps = [
    ["welcome", true],
    ["level", "1200-1600"],
    ["priorities", ["remember_openings", "review_mistakes"]],
    ["starter-pack", "classical_attacker"],
    ["training-mode", "assisted"],
    ["pace", "standard"],
    ["line-changes", null],
    ["review", null],
  ];
  for (const [step, value] of steps) {
    const result = await appJson(page, "/api/blundr/onboarding/v11", {
      method: "PATCH",
      body: JSON.stringify({
        step,
        value,
        ageConfirmed: step === "welcome" ? true : undefined,
      }),
    });
    if (!result.ok)
      throw new Error(`onboarding_step_failed:${step}:${result.status}`);
  }
  const state = await appJson(page, "/api/blundr/onboarding/v11");
  if (
    state.body?.data?.step !== "plan" ||
    state.body?.data?.completed === true
  ) {
    throw new Error("onboarding_plan_state_not_reached");
  }
  proof.checks.onboardingPlanState = true;
}

async function validateFreeState(page) {
  const status = await appJson(page, "/api/blundr/billing/status");
  if (!status.ok) throw new Error(`billing_status_failed:${status.status}`);
  const access = status.body?.data;
  if (access?.plan !== "free" || access?.entitlementActive !== false) {
    throw new Error("new_ephemeral_user_must_start_free");
  }
  proof.checks.initialBackendFree = true;
}

async function requestAndAcceptOffer(page) {
  const spoofed = await appJson(page, "/api/blundr/billing/offer", {
    method: "POST",
    body: JSON.stringify({
      plan: "monthly",
      priceId: "price_attacker",
      customerId: "cus_attacker",
      userId: "22222222-2222-4222-8222-222222222222",
      trialEligible: false,
      trialDays: 0,
      entitlement: "pro",
    }),
  });
  if (spoofed.status !== 400) {
    throw new Error("paid_offer_client_authority_not_rejected");
  }
  const offer = await appJson(page, "/api/blundr/billing/offer", {
    method: "POST",
    body: JSON.stringify({ plan: "monthly" }),
  });
  if (!offer.ok || offer.body?.data?.plan !== "monthly") {
    throw new Error(`paid_offer_failed:${offer.status}`);
  }
  const offerData = offer.body.data;
  if (offerData.trialEligible !== true) {
    throw new Error("paid_offer_trial_eligible_required");
  }
  if (offerData.trialDays !== 7) {
    throw new Error("paid_offer_trial_days_mismatch");
  }
  const conversionAt = Date.parse(offerData.disclosedConversionAt);
  const cancelBeforeAt = Date.parse(offerData.cancelBeforeAt);
  if (
    !Number.isFinite(conversionAt) ||
    !Number.isFinite(cancelBeforeAt) ||
    conversionAt <= Date.now() ||
    cancelBeforeAt <= Date.now()
  ) {
    throw new Error("paid_offer_trial_timestamps_invalid");
  }
  const disclosure = String(offerData.disclosure ?? "");
  for (const pattern of [
    /\$9\.99\/month/i,
    /7 days free|7-day/i,
    /payment method/i,
    /automatically|automatic/i,
    /cancel before/i,
  ]) {
    if (!pattern.test(disclosure)) {
      throw new Error("paid_offer_disclosure_incomplete");
    }
  }
  if (!String(offerData.acknowledgement ?? "").trim()) {
    throw new Error("paid_offer_acknowledgement_missing");
  }
  const offerId = offerData.id;
  const accepted = await appJson(page, "/api/blundr/billing/offer/accept", {
    method: "POST",
    body: JSON.stringify({ offerId, plan: "monthly" }),
  });
  if (!accepted.ok)
    throw new Error(`paid_offer_accept_failed:${accepted.status}`);
  proof.checks.paidOfferClientAuthorityRejected = true;
  proof.checks.realPaidOfferValidated = true;
  proof.checks.paidOfferAccepted = true;
}

async function rejectClientAuthority(page) {
  const result = await appJson(page, "/api/blundr/billing/checkout", {
    method: "POST",
    body: JSON.stringify({
      plan: "monthly",
      priceId: "price_attacker",
      customerId: "cus_attacker",
      app_user_id: "22222222-2222-4222-8222-222222222222",
      trial: false,
      entitlement: "pro",
    }),
  });
  if (result.status !== 400)
    throw new Error("checkout_client_authority_not_rejected");
  proof.checks.clientBillingAuthorityRejected = true;
}

async function createCheckout(page) {
  const result = await appJson(page, "/api/blundr/billing/checkout", {
    method: "POST",
    body: JSON.stringify({ plan: "monthly" }),
  });
  if (!result.ok || typeof result.body?.data?.url !== "string") {
    throw new Error(`checkout_create_failed:${result.status}`);
  }
  const checkoutUrl = new URL(result.body.data.url);
  if (!/\.stripe\.com$/i.test(checkoutUrl.hostname)) {
    throw new Error("checkout_url_not_stripe");
  }
  proof.checks.checkoutCreatedByBlundr = true;
  return checkoutUrl.toString();
}

async function completeStripeCheckout(page, checkoutUrl) {
  await page.goto(checkoutUrl, { waitUntil: "domcontentloaded" });
  await page.getByLabel(/card number/i).fill("4242424242424242");
  await page.getByLabel(/expiration/i).fill("1234");
  await page.getByLabel(/cvc/i).fill("123");
  const name = page.getByLabel(/cardholder name|name on card/i);
  if (await name.count()) await name.fill("Blundr Wave 2B");
  const country = page.getByLabel(/country/i);
  if (await country.count()) await country.selectOption("US").catch(() => {});
  await page
    .getByRole("button", { name: /subscribe|start trial|pay/i })
    .click();
  await page.waitForURL(
    (url) =>
      url.origin === stableCallbackOrigin &&
      url.pathname === "/billing/success",
    { timeout: 60000 },
  );
  const finalUrl = new URL(page.url());
  assertNonProductionUrl(finalUrl.origin, "stripe_checkout_return_origin");
  if (finalUrl.origin !== stableCallbackOrigin) {
    throw new Error("stripe_checkout_return_origin_mismatch");
  }
  if (finalUrl.pathname !== "/billing/success") {
    throw new Error("stripe_checkout_return_path_mismatch");
  }
  proof.checks.hostedCheckoutCompleted = true;
}

async function verifyStripeObjects() {
  const sessions = await stripe.checkout.sessions.list({
    limit: 10,
    expand: ["data.subscription"],
  });
  const session = sessions.data.find(
    (candidate) => candidate.metadata?.app_user_id === ephemeralUser.id,
  );
  if (!session) throw new Error("stripe_checkout_session_not_found");
  if (session.livemode) throw new Error("stripe_session_live_mode_forbidden");
  if (session.payment_method_collection !== "always") {
    throw new Error("checkout_did_not_require_payment_method");
  }
  const subscription =
    typeof session.subscription === "string"
      ? await stripe.subscriptions.retrieve(session.subscription)
      : session.subscription;
  if (!subscription) throw new Error("stripe_subscription_missing");
  stripeSubscriptionId = subscription.id;
  stripeSubscription = subscription;
  mask(stripeSubscriptionId, "STRIPE_SUBSCRIPTION_ID");
  if (subscription.livemode)
    throw new Error("stripe_subscription_live_mode_forbidden");
  if (subscription.metadata?.app_user_id !== ephemeralUser.id) {
    throw new Error("stripe_subscription_metadata_user_mismatch");
  }
  if (!subscription.trial_end)
    throw new Error("stripe_subscription_trial_missing");
  const itemPrice = subscription.items.data[0]?.price?.id;
  if (itemPrice !== "price_1UDmveLuqtbLOQt39LJ8Pp4v") {
    throw new Error("stripe_subscription_price_mismatch");
  }
  proof.evidence.checkoutSession = redactedId(session.id);
  proof.evidence.subscription = redactedId(subscription.id);
  proof.checks.stripeMetadataAppUserId = true;
  proof.checks.stripeSubscriptionMetadataAppUserId = true;
  proof.checks.sevenDayTrialPresent = true;
  proof.checks.paymentMethodRequired = true;
}

async function deliverStripeWebhookTwice() {
  if (!stripeSubscription)
    throw new Error("stripe_subscription_missing_for_webhook");
  const event = {
    id: `evt_wave2b_${randomUUID().replaceAll("-", "")}`,
    object: "event",
    api_version: "2025-08-27.basil",
    created: Math.floor(Date.now() / 1000),
    data: { object: stripeSubscription },
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
    type: "customer.subscription.updated",
  };
  stripeSyntheticEventId = event.id;
  const payload = JSON.stringify(event);
  const header = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: required("STRIPE_WEBHOOK_SECRET"),
  });
  for (const attempt of [1, 2]) {
    const response = await fetch(
      `${stableCallbackHost}/api/blundr/billing/stripe/webhook`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "stripe-signature": header,
        },
        body: payload,
      },
    );
    if (!response.ok) {
      throw new Error(
        `stripe_webhook_attempt_${attempt}_failed:${response.status}`,
      );
    }
  }
  proof.evidence.stripeWebhookEvent = redactedId(event.id);
  proof.checks.stripeWebhookProcessed = true;
  proof.checks.stripeWebhookDuplicateIdempotent = true;
}

async function pollUntil(label, fn, options = {}) {
  const timeoutMs = options.timeoutMs ?? 180000;
  const initialDelayMs = options.initialDelayMs ?? 3000;
  const maxDelayMs = options.maxDelayMs ?? 10000;
  const deadline = Date.now() + timeoutMs;
  let delayMs = initialDelayMs;
  let attempts = 0;
  while (Date.now() < deadline) {
    attempts += 1;
    const result = await fn();
    if (result?.ok) {
      proof.evidence[`${label}PollAttempts`] = attempts;
      return result;
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    delayMs = Math.min(maxDelayMs, Math.round(delayMs * 1.5));
  }
  throw new Error(`${label}_timeout`);
}

async function readRevenueCatProEntitlement() {
  const rcResponse = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(ephemeralUser.id)}`,
    {
      headers: {
        Authorization: `Bearer ${required("REVENUECAT_REST_API_KEY")}`,
        Accept: "application/json",
      },
    },
  );
  if (!rcResponse.ok)
    throw new Error(`revenuecat_v1_subscriber_failed:${rcResponse.status}`);
  const body = await rcResponse.json();
  const entitlement = body?.subscriber?.entitlements?.[revenueCatEntitlementId];
  const expiresAt = Date.parse(entitlement?.expires_date);
  return {
    ok: Boolean(Number.isFinite(expiresAt) && expiresAt > Date.now()),
  };
}

async function readBackendProState(page) {
  const status = await appJson(page, "/api/blundr/billing/status");
  if (!status.ok)
    throw new Error(`post_purchase_billing_status_failed:${status.status}`);
  const access = status.body?.data;
  return {
    ok:
      access?.plan === "pro" &&
      access?.entitlementActive === true &&
      access?.entitlementSource === "revenuecat",
  };
}

async function verifyRevenueCatAndBackend(page) {
  await pollUntil("revenuecatProEntitlement", readRevenueCatProEntitlement);
  proof.checks.revenueCatSubscriberRecognized = true;
  proof.checks.revenueCatProEntitlement = true;

  await pollUntil("backendTrustedProState", () => readBackendProState(page));
  proof.checks.backendProState = true;
}

async function verifyProviderLedgers() {
  if (!stripeSyntheticEventId) {
    throw new Error("stripe_synthetic_event_missing_for_ledger_check");
  }
  const stripeEvents = await supabaseRest("blundr_billing_provider_events", {
    select: "processing_status",
    provider: "eq.stripe",
    billing_environment: "eq.test",
    provider_event_id: `eq.${stripeSyntheticEventId}`,
  });
  if (
    stripeEvents.length !== 1 ||
    stripeEvents[0]?.processing_status !== "processed"
  ) {
    throw new Error("stripe_provider_event_idempotency_not_proven");
  }
  const revenueCatEvents = await supabaseRest(
    "blundr_billing_provider_events",
    {
      select: "processing_status,normalized_facts",
      provider: "eq.revenuecat",
      billing_environment: "eq.test",
      processing_status: "eq.processed",
      "normalized_facts->>appUserId": `eq.${ephemeralUser.id}`,
    },
  );
  if (revenueCatEvents.length < 1) {
    throw new Error("revenuecat_webhook_provider_event_not_found");
  }
  const entitlements = await supabaseRest("blundr_trusted_entitlements", {
    select: "active,source_provider,expires_at,last_provider_event_at,metadata",
    user_id: `eq.${ephemeralUser.id}`,
    billing_environment: "eq.test",
    entitlement_identifier: "eq.pro",
  });
  const entitlement = entitlements[0];
  if (
    entitlements.length !== 1 ||
    entitlement?.active !== true ||
    entitlement?.source_provider !== "revenuecat" ||
    !entitlement?.last_provider_event_at ||
    Date.parse(entitlement?.expires_at) <= Date.now()
  ) {
    throw new Error("revenuecat_trusted_entitlement_not_webhook_proven");
  }
  if (entitlement?.metadata?.reconciliation === true) {
    throw new Error("revenuecat_entitlement_is_reconciliation_only");
  }
  proof.checks.stripeProviderEventLedgerExactlyOnce = true;
  proof.checks.revenueCatWebhookProviderEventProcessed = true;
  proof.checks.revenueCatTrustedEntitlementWebhookCreated = true;
}

async function verifyPortal(page) {
  const spoofed = await appJson(page, "/api/blundr/billing/portal", {
    method: "POST",
    body: JSON.stringify({ customerId: "cus_attacker" }),
  });
  if (spoofed.status !== 400)
    throw new Error("portal_client_customer_not_rejected");
  const portal = await appJson(page, "/api/blundr/billing/portal", {
    method: "POST",
    body: JSON.stringify({}),
  });
  if (!portal.ok || typeof portal.body?.data?.url !== "string") {
    throw new Error(`portal_create_failed:${portal.status}`);
  }
  proof.checks.customerPortalCreated = true;
  proof.checks.portalClientCustomerRejected = true;
}

let mainError = null;

try {
  assertNonProductionUrl(baseUrl, "preview_url");
  assertNonProductionUrl(stableCallbackHost, "stable_callback_host");
  await verifyPreviewSha("before");
  await verifyStableCallbackHostSha("before");
  if (required("STRIPE_SECRET_KEY").startsWith("sk_live_")) {
    throw new Error("live_stripe_key_forbidden");
  }
  if (
    required("STRIPE_PRO_MONTHLY_PRICE_ID") !== "price_1UDmveLuqtbLOQt39LJ8Pp4v"
  ) {
    throw new Error("monthly_sandbox_price_required");
  }
  if (
    required("STRIPE_PRO_ANNUAL_PRICE_ID") !== "price_1UDmw4LuqtbLOQt3G6bgL5mY"
  ) {
    throw new Error("annual_sandbox_price_required");
  }

  ephemeralUser = await createEphemeralUser();
  browser = await chromium.launch();
  browserContext = await browser.newContext();
  const page = await browserContext.newPage();
  await signIn(page);
  await completeOnboardingToPlan(page);
  await validateFreeState(page);
  await requestAndAcceptOffer(page);
  await rejectClientAuthority(page);
  const checkoutUrl = await createCheckout(page);
  await completeStripeCheckout(page, checkoutUrl);
  await verifyStripeObjects();
  await deliverStripeWebhookTwice();
  await validateFreeState(page);
  await verifyRevenueCatAndBackend(page);
  await verifyProviderLedgers();
  await verifyPortal(page);
  await verifyPreviewSha("after");
  await verifyStableCallbackHostSha("after");
} catch (error) {
  mainError = error;
  proof.status = "failed";
  proof.error = sanitizeError(
    error instanceof Error ? error.message : String(error),
  );
} finally {
  proof.cleanup.attempted = true;
  await cancelStripeSubscription().catch((error) => {
    proof.cleanup.subscriptionCancelError = sanitizeError(
      error instanceof Error ? error.message : String(error),
    );
  });
  await closeBrowser().catch((error) => {
    proof.cleanup.browserCloseError = sanitizeError(
      error instanceof Error ? error.message : String(error),
    );
  });
  await deleteEphemeralUser().catch((error) => {
    proof.cleanup.userDeleteError = sanitizeError(
      error instanceof Error ? error.message : String(error),
    );
  });
  proof.cleanup.completed = cleanupSucceeded();
  if (!mainError && proof.cleanup.completed) {
    proof.status = "passed";
    proof.acceptanceEligible = true;
  } else if (!mainError && !proof.cleanup.completed) {
    proof.status = "failed";
    proof.error = "cleanup_failed";
  }
  await writeProof();
}

if (mainError) throw mainError;
if (proof.status !== "passed") throw new Error(proof.error ?? "cleanup_failed");
