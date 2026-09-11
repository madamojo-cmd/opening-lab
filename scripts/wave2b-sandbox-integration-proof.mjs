import { chromium, expect } from "@playwright/test";
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
let stripeCustomerId = null;
let acceptedOfferId = null;
let checkoutSessionId = null;
let testStartedAt = Math.floor(Date.now() / 1000);

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

function isStripeCheckoutHost(hostname) {
  const host = String(hostname ?? "").toLowerCase();
  return (
    host === "checkout.stripe.com" || host.endsWith(".checkout.stripe.com")
  );
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

async function findRunSubscriptions() {
  if (!ephemeralUser?.id) return [];
  const subscriptions = await stripe.subscriptions.list({
    limit: 100,
    created: { gte: testStartedAt - 60 },
  });
  return subscriptions.data.filter(
    (subscription) => subscription.metadata?.app_user_id === ephemeralUser.id,
  );
}

async function readPersistedCheckoutSessionId() {
  if (!ephemeralUser?.id) return null;
  if (acceptedOfferId) {
    const offers = await supabaseRest("blundr_paid_offer_acceptances", {
      select: "checkout_session_id",
      id: `eq.${acceptedOfferId}`,
      user_id: `eq.${ephemeralUser.id}`,
      billing_environment: "eq.test",
    });
    const offerSessionId = offers[0]?.checkout_session_id;
    if (
      typeof offerSessionId === "string" &&
      offerSessionId.startsWith("cs_")
    ) {
      return offerSessionId;
    }
  }
  const reservations = await supabaseRest("blundr_billing_trial_eligibility", {
    select: "checkout_session_id",
    user_id: `eq.${ephemeralUser.id}`,
    billing_environment: "eq.test",
  });
  const trialSessionId = reservations[0]?.checkout_session_id;
  if (typeof trialSessionId === "string" && trialSessionId.startsWith("cs_")) {
    return trialSessionId;
  }
  return null;
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
  if (!stripeSubscriptionId) {
    const persistedSessionId =
      checkoutSessionId ??
      (await readPersistedCheckoutSessionId().catch(() => null));
    if (persistedSessionId) {
      checkoutSessionId = persistedSessionId;
      const session = await stripe.checkout.sessions.retrieve(
        persistedSessionId,
        { expand: ["subscription"] },
      );
      stripeCustomerId =
        typeof session.customer === "string"
          ? session.customer
          : (session.customer?.id ?? null);
      const subscription = session.subscription;
      if (typeof subscription === "string") {
        stripeSubscriptionId = subscription;
      } else if (subscription?.id) {
        stripeSubscriptionId = subscription.id;
        stripeSubscription = subscription;
      }
    }
  }
  if (!stripeSubscriptionId) {
    const candidates = await findRunSubscriptions().catch(() => []);
    if (candidates.length === 1) {
      stripeSubscriptionId = candidates[0].id;
      stripeSubscription = candidates[0];
      stripeCustomerId =
        typeof candidates[0].customer === "string"
          ? candidates[0].customer
          : (candidates[0].customer?.id ?? null);
    }
  }
  if (!stripeSubscriptionId) {
    proof.cleanup.subscriptionNotApplicable = true;
    proof.cleanup.subscriptionCanceled = true;
    proof.cleanup.subscriptionCancelVerified = true;
    return;
  }
  try {
    const existing = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const canceled =
      existing.status === "canceled"
        ? existing
        : await stripe.subscriptions.cancel(stripeSubscriptionId);
    proof.cleanup.subscriptionCanceled = canceled.status === "canceled";
    const verified = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    proof.cleanup.subscriptionCancelVerified = verified.status === "canceled";
    const customer =
      typeof verified.customer === "string"
        ? verified.customer
        : verified.customer?.id;
    if (customer) stripeCustomerId = customer;
  } catch (error) {
    proof.cleanup.subscriptionCancelError = sanitizeError(
      error instanceof Error ? error.message : String(error),
    );
  }
}

async function deleteEphemeralStripeCustomer() {
  if (!stripeCustomerId || !ephemeralUser?.id) {
    proof.cleanup.customerDeleteNotApplicable = true;
    return;
  }
  try {
    const customer = await stripe.customers.retrieve(stripeCustomerId);
    if (
      customer.deleted === true ||
      customer.metadata?.app_user_id !== ephemeralUser.id
    ) {
      proof.cleanup.customerDeleteNotApplicable = true;
      return;
    }
    const deleted = await stripe.customers.del(stripeCustomerId);
    proof.cleanup.customerDeleted = deleted.deleted === true;
  } catch (error) {
    proof.cleanup.customerDeleteError = sanitizeError(
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
    proof.cleanup.userDeleteVerified === true &&
    (proof.cleanup.customerDeleted === true ||
      proof.cleanup.customerDeleteNotApplicable === true)
  );
}

async function expectInputCommitted(locator, label) {
  const committed = await locator.evaluate((input) => {
    return (
      input instanceof HTMLInputElement &&
      typeof input.value === "string" &&
      input.value.trim().length > 0
    );
  });
  if (!committed) {
    throw new Error(`${label}_input_not_committed`);
  }
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

async function readBrowserSession(page) {
  return page.evaluate((expectedUserId) => {
    function findSession(value) {
      if (!value || typeof value !== "object") return null;
      if (
        typeof value.access_token === "string" &&
        value.access_token &&
        value.user &&
        typeof value.user.id === "string"
      ) {
        return { accessToken: value.access_token, userId: value.user.id };
      }
      for (const child of Object.values(value)) {
        const found = findSession(child);
        if (found) return found;
      }
      return null;
    }
    for (const key of Object.keys(window.localStorage)) {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      try {
        const found = findSession(JSON.parse(raw));
        if (found) {
          return {
            authenticated: true,
            accessToken: found.accessToken,
            userIdPresent: true,
            userMatchesExpected: found.userId === expectedUserId,
          };
        }
      } catch {
        // Ignore unrelated localStorage values.
      }
    }
    return {
      authenticated: false,
      accessToken: null,
      userIdPresent: false,
      userMatchesExpected: false,
    };
  }, ephemeralUser.id);
}

async function waitForEphemeralBrowserSession(page) {
  const deadline = Date.now() + 20000;
  let latest = null;
  while (Date.now() < deadline) {
    latest = await readBrowserSession(page);
    if (latest.authenticated && latest.userMatchesExpected) return latest;
    await page.waitForTimeout(250);
  }
  if (latest?.authenticated && !latest.userMatchesExpected) {
    throw new Error("ephemeral_user_login_mismatch");
  }
  throw new Error("ephemeral_session_not_established");
}

async function signIn(page) {
  await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => {});
  const form = page
    .locator("form")
    .filter({
      has: page.getByRole("button", { name: "Log in", exact: true }),
    })
    .first();
  await expect(form).toBeVisible({ timeout: 15000 });
  const email = form
    .getByLabel("Email", { exact: true })
    .or(form.locator('input[type="email"]'))
    .first();
  const password = form
    .getByLabel("Password", { exact: true })
    .or(form.locator('input[autocomplete="current-password"]'))
    .or(form.locator('input[type="password"]'))
    .first();
  await expect(email).toBeVisible({ timeout: 15000 });
  await expect(password).toBeVisible({ timeout: 15000 });
  await email.fill(ephemeralUser.email);
  await password.fill(ephemeralUser.password);
  await email.blur();
  await password.blur();
  await expectInputCommitted(email, "ephemeral_email");
  await expectInputCommitted(password, "ephemeral_password");
  const submit = form.getByRole("button", { name: "Log in", exact: true });
  await expect(submit).toBeVisible({ timeout: 15000 });
  await expect(submit).toBeEnabled({ timeout: 15000 });
  await submit.click();
  proof.evidence.login = {
    formSubmitted: true,
    resultingOrigin:
      new URL(page.url()).origin === baseUrl ? "preview" : "other",
    resultingPathname: new URL(page.url()).pathname,
    authSessionMechanism: "supabase_browser_persisted_session",
    authenticatedUserMatch: false,
    accessTokenAvailable: false,
    apiSessionAccepted: false,
  };
  const session = await waitForEphemeralBrowserSession(page);
  proof.evidence.login.authenticatedUserMatch = session.userMatchesExpected;
  proof.evidence.login.accessTokenAvailable = Boolean(session.accessToken);
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

async function verifyPostStripeAuthorityOnly() {
  const entitlements = await supabaseRest("blundr_trusted_entitlements", {
    select: "active,source_provider,entitlement_identifier,expires_at",
    user_id: `eq.${ephemeralUser.id}`,
    billing_environment: "eq.test",
  });
  const active = entitlements.filter(
    (entitlement) => entitlement.active === true,
  );
  for (const entitlement of active) {
    if (entitlement.source_provider !== "revenuecat") {
      throw new Error("stripe_sourced_paid_entitlement_forbidden");
    }
    if (entitlement.entitlement_identifier !== revenueCatEntitlementId) {
      throw new Error("unexpected_active_entitlement_after_stripe_webhook");
    }
    if (Date.parse(entitlement.expires_at) <= Date.now()) {
      throw new Error("expired_revenuecat_entitlement_after_stripe_webhook");
    }
  }
  proof.checks.postStripeDidNotGrantStripeEntitlement = true;
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
  acceptedOfferId = offerId;
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
  if (!isStripeCheckoutHost(checkoutUrl.hostname)) {
    throw new Error("checkout_url_not_stripe");
  }
  checkoutSessionId = await readPersistedCheckoutSessionId();
  if (!checkoutSessionId) {
    throw new Error("checkout_session_id_not_persisted");
  }
  mask(checkoutSessionId, "STRIPE_CHECKOUT_SESSION_ID");
  proof.checks.checkoutCreatedByBlundr = true;
  return checkoutUrl.toString();
}

function safeOrigin(value) {
  try {
    return new URL(value || "about:blank").origin;
  } catch {
    return "unknown";
  }
}

function stripeInteractionContexts(page) {
  const contexts = [
    {
      target: page,
      kind: "page",
      origin: safeOrigin(page.url()),
      name: "",
    },
  ];
  const mainFrame = page.mainFrame();
  for (const frame of page.frames()) {
    if (frame === mainFrame) continue;
    contexts.push({
      target: frame,
      kind: "frame",
      origin: safeOrigin(frame.url()),
      name: sanitizeError(frame.name()).slice(0, 120),
    });
  }
  return contexts;
}

async function fillVisibleStripeField(page, label, value, options = {}) {
  for (const context of stripeInteractionContexts(page)) {
    const locator = context.target.getByLabel(label).first();
    if ((await locator.count().catch(() => 0)) === 0) continue;
    if (!(await locator.isVisible().catch(() => false))) continue;
    await locator.fill(value, options);
    return true;
  }
  return false;
}

async function fillVisibleStripeFieldByFallbacks(page, field) {
  for (const context of stripeInteractionContexts(page)) {
    for (const locator of field.locators(context.target)) {
      const target = locator.first();
      if ((await target.count().catch(() => 0)) === 0) continue;
      if (!(await target.isVisible().catch(() => false))) continue;
      await target.fill(field.value, field.options ?? {});
      return true;
    }
  }
  return false;
}

async function hasVisibleStripeFieldByFallbacks(page, locators) {
  for (const context of stripeInteractionContexts(page)) {
    for (const locator of locators(context.target)) {
      const target = locator.first();
      if ((await target.count().catch(() => 0)) === 0) continue;
      if (await target.isVisible().catch(() => false)) return true;
    }
  }
  return false;
}

async function waitForVisibleStripeFieldByFallbacks(
  page,
  locators,
  timeoutMs = 30000,
) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await hasVisibleStripeFieldByFallbacks(page, locators)) return true;
    await page.waitForTimeout(250);
  }
  return false;
}

async function fillOptionalStripeField(page, label, value, options = {}) {
  await fillVisibleStripeField(page, label, value, options);
}

function stripeCardNumberLocators(frame) {
  return [
    frame.locator("#cardNumber"),
    frame.getByLabel(/^card number$/i),
    frame.locator('input[autocomplete="cc-number"]'),
    frame.locator('input[name*="cardnumber" i]'),
  ];
}

function stripeCardExpiryLocators(frame) {
  return [
    frame.locator("#cardExpiry"),
    frame.getByLabel(/expiration|expiry/i),
    frame.locator('input[autocomplete="cc-exp"]'),
    frame.locator('input[name*="exp" i]'),
  ];
}

function stripeCardCvcLocators(frame) {
  return [
    frame.locator("#cardCvc"),
    frame.getByLabel(/cvc|security code/i),
    frame.locator('input[autocomplete="cc-csc"]'),
    frame.locator('input[name*="cvc" i]'),
  ];
}

function stripeCardholderNameLocators(frame) {
  return [
    frame.locator("#billingName"),
    frame.getByLabel(/cardholder name|name on card|full name/i),
    frame.locator('input[autocomplete="cc-name"]'),
  ];
}

function stripeCountryLocators(frame) {
  return [
    frame.locator("#billingCountry"),
    frame.getByLabel(/country/i),
    frame.locator('[name="billingCountry"]'),
  ];
}

function stripePostalCodeLocators(frame) {
  return [
    frame.locator("#billingPostalCode"),
    frame.getByLabel(/zip|postal/i),
    frame.locator('[name="billingPostalCode"]'),
  ];
}

async function listVisiblePaymentMethodLabels(page) {
  const labels = new Set();
  for (const context of stripeInteractionContexts(page)) {
    const contextLabels = await context.target
      .evaluate(() => {
        const values = new Set();
        const selectors = [
          'button[role="radio"]',
          'button[role="tab"]',
          "button[aria-pressed]",
          'input[type="radio"]',
          '[role="radio"]',
          '[data-testid*="payment"]',
          '[data-testid*="accordion-item-button"]',
        ];
        for (const element of document.querySelectorAll(selectors.join(","))) {
          const style = window.getComputedStyle(element);
          if (
            style.display === "none" ||
            style.visibility === "hidden" ||
            style.opacity === "0" ||
            element.getClientRects().length === 0
          ) {
            continue;
          }
          const text = [
            element.getAttribute("aria-label"),
            element.textContent,
            element.id
              ? document.querySelector(`label[for="${CSS.escape(element.id)}"]`)
                  ?.textContent
              : null,
          ]
            .filter(Boolean)
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();
          if (text) values.add(text.slice(0, 80));
        }
        return [...values];
      })
      .catch(() => []);
    for (const label of contextLabels) labels.add(label);
  }
  return [...labels].slice(0, 40);
}

async function anyVisibleStripeText(page, pattern) {
  for (const context of stripeInteractionContexts(page)) {
    const locator = context.target.getByText(pattern).first();
    if (
      (await locator.count().catch(() => 0)) > 0 &&
      (await locator.isVisible().catch(() => false))
    ) {
      return true;
    }
  }
  return false;
}

async function findVisibleLocator(locators) {
  for (const locator of locators) {
    const count = await locator.count().catch(() => 0);
    for (let index = 0; index < count; index += 1) {
      const candidate = locator.nth(index);
      if (await candidate.isVisible().catch(() => false)) {
        return candidate;
      }
    }
  }
  return null;
}

function cardControlCandidates(target) {
  const cardRadio = target.getByRole("radio", { name: /^card$/i });
  const visibleCardText = target.getByText(/^Card$/i);
  const payWithCardText = target.getByText(/^Pay with card$/i);

  const paymentCardByAria = target.locator(
    '[data-testid*="payment"][aria-label*="card" i]',
  );

  const paymentCardByText = target
    .locator('[data-testid*="payment"]')
    .filter({ hasText: /^\s*(?:pay with )?card\s*$/i });

  return [
    {
      strategy: "visible_card_text",
      locator: visibleCardText,
    },
    {
      strategy: "card_accordion_testid",
      locator: target.locator(
        'button[data-testid="card-accordion-item-button"]',
      ),
    },
    {
      strategy: "pay_with_card_button",
      locator: target.getByRole("button", { name: /^pay with card$/i }),
    },
    {
      strategy: "payment_testid_card_aria",
      locator: paymentCardByAria,
    },
    {
      strategy: "payment_testid_card_text",
      locator: paymentCardByText,
    },
    {
      strategy: "payment_testid_card_aria_clickable_ancestor",
      locator: paymentCardByAria.locator(
        "xpath=ancestor::*[self::button or @role='radio' or self::label or contains(@data-testid, 'accordion-item-button')][1]",
      ),
    },
    {
      strategy: "payment_testid_card_text_clickable_ancestor",
      locator: paymentCardByText.locator(
        "xpath=ancestor::*[self::button or @role='radio' or self::label or contains(@data-testid, 'accordion-item-button')][1]",
      ),
    },
    {
      strategy: "pay_with_card_text_button_ancestor",
      locator: payWithCardText.locator("xpath=ancestor::button[1]"),
    },
    {
      strategy: "pay_with_card_text_label_ancestor",
      locator: payWithCardText.locator("xpath=ancestor::label[1]"),
    },
    {
      strategy: "pay_with_card_text_accordion_ancestor",
      locator: payWithCardText.locator(
        "xpath=ancestor::*[contains(@data-testid, 'accordion-item-button')][1]",
      ),
    },
    {
      strategy: "card_accordion_testid_contains",
      locator: target
        .locator('[data-testid*="accordion-item-button"]')
        .filter({ hasText: /card/i }),
    },
    {
      strategy: "card_radio_button_ancestor",
      locator: cardRadio.locator("xpath=ancestor::button[1]"),
    },
    {
      strategy: "card_radio_wrapped_button",
      locator: target.locator(
        'button:has([role="radio"][value="card"]), button:has(input[type="radio"][value="card"])',
      ),
    },
    {
      strategy: "card_text_button_ancestor",
      locator: target.getByText(/^Card$/i).locator("xpath=ancestor::button[1]"),
    },
    {
      strategy: "visible_card_label_button",
      locator: target.locator("button").filter({ hasText: /^\s*Card\s*$/i }),
    },
    {
      strategy: "card_radio_label",
      locator: target.locator('label:has(input[type="radio"][value="card"])'),
    },
  ];
}

function cardControlStrategyNames(target) {
  return cardControlCandidates(target).map((candidate) => candidate.strategy);
}

function safeDiagnosticText(value, maxLength = 1000) {
  return sanitizeError(String(value ?? ""))
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

async function collectCardCandidateDiagnostics(page) {
  const diagnostics = [];
  for (const context of stripeInteractionContexts(page)) {
    for (const candidate of cardControlCandidates(context.target)) {
      const count = await candidate.locator.count().catch(() => 0);
      const entry = {
        strategy: candidate.strategy,
        contextKind: context.kind,
        contextOrigin: context.origin,
        frameName: context.name,
        matchCount: count,
        visibleCount: 0,
        matches: [],
      };
      const inspectedCount = Math.min(count, 10);
      for (let index = 0; index < inspectedCount; index += 1) {
        const locator = candidate.locator.nth(index);
        const visible = await locator.isVisible().catch(() => false);
        if (visible) entry.visibleCount += 1;
        const metadata = await locator
          .evaluate((element) => ({
            tagName: element.tagName,
            role: element.getAttribute("role"),
            ariaLabel: element.getAttribute("aria-label"),
            dataTestId: element.getAttribute("data-testid"),
            id: element.getAttribute("id"),
            name: element.getAttribute("name"),
            value: element.getAttribute("value"),
            ariaChecked: element.getAttribute("aria-checked"),
            tabindex: element.getAttribute("tabindex"),
            textContent: element.textContent,
            outerHTML: element.outerHTML,
          }))
          .catch(() => null);
        const boundingBox = await locator.boundingBox().catch(() => null);
        entry.matches.push({
          index,
          visible,
          tagName: metadata?.tagName ?? null,
          role: metadata?.role ?? null,
          ariaLabel: safeDiagnosticText(metadata?.ariaLabel, 200),
          dataTestId: safeDiagnosticText(metadata?.dataTestId, 200),
          id: safeDiagnosticText(metadata?.id, 200),
          name: safeDiagnosticText(metadata?.name, 200),
          value: safeDiagnosticText(metadata?.value, 200),
          ariaChecked: metadata?.ariaChecked ?? null,
          tabindex: metadata?.tabindex ?? null,
          textContent: safeDiagnosticText(metadata?.textContent, 500),
          boundingBox,
          outerHTML: safeDiagnosticText(metadata?.outerHTML, 1000),
        });
      }
      diagnostics.push(entry);
    }
  }
  return diagnostics;
}

async function clickVisibleLocatorCenter(
  page,
  locator,
  missingMessage = "visible_card_text_bounding_box_missing",
) {
  const boundingBox = await locator.boundingBox();
  if (!boundingBox || boundingBox.width <= 0 || boundingBox.height <= 0) {
    throw new Error(missingMessage);
  }
  await page.mouse.click(
    boundingBox.x + boundingBox.width / 2,
    boundingBox.y + boundingBox.height / 2,
  );
}

async function scrollLocatorIntoView(locator) {
  try {
    await locator.scrollIntoViewIfNeeded({ timeout: 5000 });
  } catch {
    await locator.evaluate((element) => {
      element.scrollIntoView({
        block: "center",
        inline: "center",
      });
    });
  }
}

async function findVisibleCardPaymentControl(
  page,
  skippedStrategies = new Set(),
) {
  for (const context of stripeInteractionContexts(page)) {
    for (const candidate of cardControlCandidates(context.target)) {
      if (skippedStrategies.has(candidate.strategy)) continue;
      const visible = await findVisibleLocator([candidate.locator]);
      if (visible) {
        return {
          locator: visible,
          strategy: candidate.strategy,
          context: {
            kind: context.kind,
            origin: context.origin,
            name: context.name,
          },
        };
      }
    }
  }
  return null;
}

async function waitForCardPaymentControl(
  page,
  timeoutMs = 20000,
  skippedStrategies = new Set(),
) {
  const deadline = Date.now() + timeoutMs;
  const strategiesAttempted = new Set();
  let processingObserved = false;
  while (Date.now() < deadline) {
    proof.evidence.checkoutDiagnostics ??= {};
    proof.evidence.checkoutDiagnostics.paymentMethodLabels =
      await listVisiblePaymentMethodLabels(page).catch(() => []);
    processingObserved =
      processingObserved || (await anyVisibleStripeText(page, /processing/i));
    proof.evidence.checkoutDiagnostics.processingObserved = processingObserved;
    proof.evidence.checkoutDiagnostics.interactionContextCount =
      stripeInteractionContexts(page).length;
    proof.evidence.checkoutDiagnostics.cardCandidateDiagnostics =
      await collectCardCandidateDiagnostics(page).catch((error) => [
        {
          error: sanitizeError(
            error instanceof Error ? error.message : String(error),
          ),
        },
      ]);
    const card = await findVisibleCardPaymentControl(page, skippedStrategies);
    if (card) {
      proof.evidence.checkoutDiagnostics.cardCandidateStrategiesAttempted = [
        ...strategiesAttempted,
        card.strategy,
      ];
      return card;
    }
    for (const strategy of cardControlStrategyNames(page)) {
      strategiesAttempted.add(strategy);
    }
    await page.waitForTimeout(400);
  }
  proof.evidence.checkoutDiagnostics ??= {};
  proof.evidence.checkoutDiagnostics.cardCandidateStrategiesAttempted = [
    ...strategiesAttempted,
  ];
  return null;
}

async function isCardPaymentMethodSelected(page) {
  for (const context of stripeInteractionContexts(page)) {
    const candidates = [
      context.target.locator("#payment-method-accordion-item-title-card"),
      context.target.locator(
        'input[name="payment-method-accordion-item-title"][value="card"]',
      ),
      context.target.getByRole("radio", { name: /^card$/i }),
      context.target.locator('[role="radio"][value="card"]'),
      context.target.locator('input[type="radio"][value="card"]'),
    ];
    for (const locator of candidates) {
      const count = await locator.count().catch(() => 0);
      for (let index = 0; index < count; index += 1) {
        const candidate = locator.nth(index);
        if (
          (await candidate.getAttribute("aria-checked").catch(() => null)) ===
          "true"
        ) {
          return true;
        }
        if (await candidate.isChecked().catch(() => false)) return true;
      }
    }
  }
  return false;
}

async function waitForCardSelectionOrFields(page, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const cardSelected = await isCardPaymentMethodSelected(page);
    const cardFieldsMounted = await hasVisibleStripeFieldByFallbacks(
      page,
      stripeCardNumberLocators,
    );
    if (cardSelected || cardFieldsMounted) {
      return { cardSelected, cardFieldsMounted };
    }
    await page.waitForTimeout(250);
  }
  return { cardSelected: false, cardFieldsMounted: false };
}

async function selectCardPaymentMethod(page) {
  proof.evidence.checkoutDiagnostics ??= {};
  const initialState = await waitForCardSelectionOrFields(page, 2000);
  proof.evidence.checkoutDiagnostics.initialCardSelected =
    initialState.cardSelected;
  proof.evidence.checkoutDiagnostics.initialCardFieldsMounted =
    initialState.cardFieldsMounted;
  if (initialState.cardSelected || initialState.cardFieldsMounted) {
    proof.evidence.checkoutDiagnostics.cardFound = true;
    proof.evidence.checkoutDiagnostics.cardFoundBy =
      "already_selected_or_fields_mounted";
    proof.evidence.checkoutDiagnostics.cardSelected = initialState.cardSelected;
    proof.evidence.checkoutDiagnostics.cardFieldsMounted =
      initialState.cardFieldsMounted;
    return;
  }
  const selectionDeadline = Date.now() + 30000;
  let cardWasFound = false;
  let lastClickError = null;
  const skippedCardStrategies = new Set();
  while (Date.now() < selectionDeadline) {
    const remainingMs = Math.max(1000, selectionDeadline - Date.now());
    const card = await waitForCardPaymentControl(
      page,
      Math.min(remainingMs, cardWasFound ? 5000 : 20000),
      skippedCardStrategies,
    );
    if (!card) {
      const state = await waitForCardSelectionOrFields(page, 1000);
      if (state.cardSelected || state.cardFieldsMounted) {
        proof.evidence.checkoutDiagnostics.cardSelected = state.cardSelected;
        proof.evidence.checkoutDiagnostics.cardFieldsMounted =
          state.cardFieldsMounted;
        return;
      }
      break;
    }
    cardWasFound = true;
    proof.evidence.checkoutDiagnostics.cardFound = true;
    proof.evidence.checkoutDiagnostics.cardFoundBy = card.strategy;
    proof.evidence.checkoutDiagnostics.cardFoundFrameKind = card.context.kind;
    proof.evidence.checkoutDiagnostics.cardFoundFrameOrigin =
      card.context.origin;
    proof.evidence.checkoutDiagnostics.cardFoundFrameName = card.context.name;
    try {
      await card.locator.click({ timeout: Math.min(5000, remainingMs) });
    } catch (error) {
      lastClickError = sanitizeError(
        error instanceof Error ? error.message : String(error),
      );
      proof.evidence.checkoutDiagnostics.cardLastClickError = lastClickError;
      proof.evidence.checkoutDiagnostics.cardLastClickFailedStrategy =
        card.strategy;
      proof.evidence.checkoutDiagnostics.cardClickRetried = true;
      const state = await waitForCardSelectionOrFields(page, 1000);
      proof.evidence.checkoutDiagnostics.cardSelected = state.cardSelected;
      proof.evidence.checkoutDiagnostics.cardFieldsMounted =
        state.cardFieldsMounted;
      if (state.cardSelected || state.cardFieldsMounted) return;
      if (card.strategy === "visible_card_text") {
        try {
          await clickVisibleLocatorCenter(page, card.locator);
        } catch (coordinateError) {
          proof.evidence.checkoutDiagnostics.cardCoordinateClickError =
            sanitizeError(
              coordinateError instanceof Error
                ? coordinateError.message
                : String(coordinateError),
            );
        }
        const coordinateState = await waitForCardSelectionOrFields(page, 1000);
        proof.evidence.checkoutDiagnostics.cardCoordinateClickAttempted = true;
        proof.evidence.checkoutDiagnostics.cardCoordinateClickStrategy =
          "visible_card_text_center";
        proof.evidence.checkoutDiagnostics.cardSelected =
          coordinateState.cardSelected;
        proof.evidence.checkoutDiagnostics.cardFieldsMounted =
          coordinateState.cardFieldsMounted;
        if (coordinateState.cardSelected || coordinateState.cardFieldsMounted) {
          return;
        }
      }
      skippedCardStrategies.add(card.strategy);
      continue;
    }
    const state = await waitForCardSelectionOrFields(
      page,
      Math.min(10000, Math.max(1000, selectionDeadline - Date.now())),
    );
    proof.evidence.checkoutDiagnostics.cardSelected = state.cardSelected;
    proof.evidence.checkoutDiagnostics.cardFieldsMounted =
      state.cardFieldsMounted;
    if (state.cardSelected || state.cardFieldsMounted) return;
    skippedCardStrategies.add(card.strategy);
    await page.waitForTimeout(300);
  }
  if (!cardWasFound) {
    proof.evidence.checkoutDiagnostics.cardFound = false;
    throw new Error("stripe_checkout_card_payment_method_missing");
  }
  if (lastClickError) {
    proof.evidence.checkoutDiagnostics.cardLastClickError = lastClickError;
  }
  throw new Error("stripe_checkout_card_payment_method_not_selected");
}

async function disableStripeLinkSave(page) {
  proof.evidence.checkoutDiagnostics ??= {};
  for (const context of stripeInteractionContexts(page)) {
    const checkbox = await findVisibleLocator([
      context.target.locator("#enableStripePass"),
      context.target.getByRole("checkbox", {
        name: /save my information for faster checkout/i,
      }),
    ]);
    if (!checkbox) continue;
    proof.evidence.checkoutDiagnostics.linkSaveFound = true;
    const initiallyChecked = await checkbox.isChecked().catch(() => false);
    proof.evidence.checkoutDiagnostics.linkSaveInitiallyChecked =
      initiallyChecked;
    if (initiallyChecked) {
      await checkbox.uncheck();
    }
    proof.evidence.checkoutDiagnostics.linkSaveUnchecked = !(await checkbox
      .isChecked()
      .catch(() => true));
    proof.evidence.checkoutDiagnostics.linkSaveFrameOrigin = context.origin;
    return;
  }
  proof.evidence.checkoutDiagnostics.linkSaveFound = false;
}

async function acknowledgeStripeAiAgentDisclosure(page) {
  proof.evidence.checkoutDiagnostics ??= {};
  proof.evidence.checkoutDiagnostics.aiAgentDisclosureFound = false;
  proof.evidence.checkoutDiagnostics.aiAgentDisclosureChecked = false;
  for (const context of stripeInteractionContexts(page)) {
    const disclosureText = context.target.getByText(
      /i am an ai agent acting on behalf of someone else/i,
    );
    const checkbox = context.target
      .getByRole("checkbox", {
        name: /i am an ai agent acting on behalf of someone else/i,
      })
      .first();
    if ((await checkbox.count().catch(() => 0)) === 0) continue;
    if (!(await checkbox.isVisible().catch(() => false))) continue;
    proof.evidence.checkoutDiagnostics.aiAgentDisclosureFound = true;
    proof.evidence.checkoutDiagnostics.aiAgentDisclosureFrameKind =
      context.kind;
    proof.evidence.checkoutDiagnostics.aiAgentDisclosureFrameOrigin =
      context.origin;
    proof.evidence.checkoutDiagnostics.aiAgentDisclosureFrameName =
      context.name;
    proof.evidence.checkoutDiagnostics.aiAgentDisclosureCheckboxBoundingBox =
      await checkbox.boundingBox().catch(() => null);
    if (!(await checkbox.isChecked().catch(() => false))) {
      try {
        await scrollLocatorIntoView(checkbox);
        await checkbox.check({ timeout: 5000 });
        proof.evidence.checkoutDiagnostics.aiAgentDisclosureStrategy =
          "checkbox_role";
      } catch (error) {
        proof.evidence.checkoutDiagnostics.aiAgentDisclosureCheckError =
          sanitizeError(error instanceof Error ? error.message : String(error));
        const fallback = await findVisibleLocator([
          disclosureText.locator("xpath=ancestor::label[1]"),
          disclosureText.locator("xpath=ancestor::button[1]"),
          disclosureText.locator(
            "xpath=ancestor::*[self::label or self::button or @role='checkbox' or @role='button'][1]",
          ),
          disclosureText,
        ]);
        if (fallback) {
          proof.evidence.checkoutDiagnostics.aiAgentDisclosureLabelBoundingBox =
            await fallback.boundingBox().catch(() => null);
          proof.evidence.checkoutDiagnostics.aiAgentDisclosureText =
            safeDiagnosticText(
              await fallback.textContent().catch(() => null),
              300,
            );
          proof.evidence.checkoutDiagnostics.aiAgentDisclosureStrategy =
            "visible_text_or_label";
          await scrollLocatorIntoView(fallback).catch((scrollError) => {
            proof.evidence.checkoutDiagnostics.aiAgentDisclosureScrollError =
              sanitizeError(
                scrollError instanceof Error
                  ? scrollError.message
                  : String(scrollError),
              );
          });
          await fallback.click({ timeout: 5000 }).catch(async (clickError) => {
            proof.evidence.checkoutDiagnostics.aiAgentDisclosureClickError =
              sanitizeError(
                clickError instanceof Error
                  ? clickError.message
                  : String(clickError),
              );
            await scrollLocatorIntoView(fallback).catch(() => {});
            proof.evidence.checkoutDiagnostics.aiAgentDisclosureLabelBoundingBox =
              await fallback.boundingBox().catch(() => null);
            await clickVisibleLocatorCenter(
              page,
              fallback,
              "ai_agent_disclosure_bounding_box_missing",
            );
            proof.evidence.checkoutDiagnostics.aiAgentDisclosureStrategy =
              "visible_text_center";
          });
        }
      }
    }
    proof.evidence.checkoutDiagnostics.aiAgentDisclosureChecked = await checkbox
      .isChecked()
      .catch(() => false);
    if (
      proof.evidence.checkoutDiagnostics.aiAgentDisclosureFound &&
      !proof.evidence.checkoutDiagnostics.aiAgentDisclosureChecked
    ) {
      throw new Error("stripe_checkout_ai_agent_disclosure_not_checked");
    }
    return;
  }
}

async function listVisiblePrimarySubmitLabels(page) {
  const labels = [];
  for (const context of stripeInteractionContexts(page)) {
    const locator = context.target.getByRole("button", {
      name: /^(start trial|start free trial|subscribe|pay)(\b|$)/i,
    });
    const count = await locator.count().catch(() => 0);
    for (let index = 0; index < count; index += 1) {
      const candidate = locator.nth(index);
      if (!(await candidate.isVisible().catch(() => false))) continue;
      const label = await candidate
        .evaluate((element) =>
          String(
            element.getAttribute("aria-label") || element.textContent || "",
          )
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 80),
        )
        .catch(() => "");
      if (label) labels.push(label);
    }
  }
  return [...new Set(labels)];
}

async function collectVisibleEnabledStripeButtons(page, name, strategy) {
  const matches = [];

  for (const context of stripeInteractionContexts(page)) {
    const locator = context.target.getByRole("button", { name });
    const count = await locator.count().catch(() => 0);

    for (let index = 0; index < count; index += 1) {
      const candidate = locator.nth(index);

      if (
        (await candidate.isVisible().catch(() => false)) &&
        (await candidate.isEnabled().catch(() => false))
      ) {
        matches.push({
          locator: candidate,
          strategy,
          context: {
            kind: context.kind,
            origin: context.origin,
            name: context.name,
          },
        });
      }
    }
  }

  return matches;
}

async function findPrimaryStripeSubmitControl(page) {
  const hostedPaymentSubmitMatches = [];
  for (const context of stripeInteractionContexts(page)) {
    const locator = context.target.locator(
      'button[data-testid="hosted-payment-submit-button"]',
    );
    const count = await locator.count().catch(() => 0);
    for (let index = 0; index < count; index += 1) {
      const candidate = locator.nth(index);
      if (
        (await candidate.isVisible().catch(() => false)) &&
        (await candidate.isEnabled().catch(() => false))
      ) {
        hostedPaymentSubmitMatches.push({
          locator: candidate,
          strategy: "hosted_payment_submit_testid",
          context: {
            kind: context.kind,
            origin: context.origin,
            name: context.name,
          },
        });
      }
    }
  }
  if (hostedPaymentSubmitMatches.length > 0) {
    return {
      matches: hostedPaymentSubmitMatches,
      strategy: "hosted_payment_submit_testid",
    };
  }

  const priorities = [
    {
      strategy: "start_trial",
      name: /^start trial/i,
    },
    {
      strategy: "start_free_trial",
      name: /^start free trial/i,
    },
    {
      strategy: "subscribe",
      name: /^subscribe\b/i,
    },
    {
      strategy: "generic_pay",
      name: /^(?!.*(?:apple pay|google pay|link|paypal|amazon pay|cash app))pay\b/i,
    },
  ];

  for (const priority of priorities) {
    const matches = await collectVisibleEnabledStripeButtons(
      page,
      priority.name,
      priority.strategy,
    );

    if (matches.length > 0) {
      return {
        matches,
        strategy: priority.strategy,
      };
    }
  }

  return {
    matches: [],
    strategy: null,
  };
}

async function waitForPrimaryStripeSubmitControl(page, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  let latestCount = 0;
  let latestStrategy = null;

  while (Date.now() < deadline) {
    const result = await findPrimaryStripeSubmitControl(page);

    latestCount = result.matches.length;
    latestStrategy = result.strategy;

    if (result.matches.length === 1) {
      return result.matches[0];
    }

    await page.waitForTimeout(250);
  }

  throw new Error(
    `stripe_checkout_submit_button_count_mismatch:${latestStrategy ?? "none"}:${latestCount}`,
  );
}

async function captureCheckoutDiagnostics(page, reason, fields = {}) {
  const frameDiagnostics = await Promise.all(
    page.frames().map(async (frame) => ({
      origin: safeOrigin(frame.url()),
      name: sanitizeError(frame.name()).slice(0, 120),
      title: sanitizeError(await frame.title().catch(() => "")).slice(0, 120),
    })),
  );
  proof.evidence.checkoutDiagnostics = {
    ...(proof.evidence.checkoutDiagnostics ?? {}),
    reason: sanitizeError(reason),
    currentHost: new URL(page.url()).hostname,
    currentPath: new URL(page.url()).pathname,
    paymentMethodLabels: await listVisiblePaymentMethodLabels(page).catch(
      () => [],
    ),
    primarySubmitLabels: await listVisiblePrimarySubmitLabels(page).catch(
      () => [],
    ),
    interactionContextCount: stripeInteractionContexts(page).length,
    frameCount: page.frames().length,
    frames: frameDiagnostics,
    fields,
  };
  if (!fields.paymentFieldsEntered) {
    await page
      .addStyleTag({
        content:
          'input, [autocomplete="email"], [data-testid*="email"] { color: transparent !important; text-shadow: none !important; }',
      })
      .catch(() => {});
    const screenshotPath = `${artifactDir}/stripe-checkout-diagnostic.png`;
    await page
      .screenshot({ path: screenshotPath, fullPage: true })
      .catch(() => {});
    proof.evidence.checkoutDiagnostics.screenshot =
      "stripe-checkout-diagnostic.png";
  } else {
    proof.evidence.checkoutDiagnostics.screenshotSkipped =
      "payment_fields_entered";
  }
}

async function completeStripeCheckout(page, checkoutUrl) {
  await page.goto(checkoutUrl, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => {});
  const checkoutPageUrl = new URL(page.url());
  if (!isStripeCheckoutHost(checkoutPageUrl.hostname)) {
    throw new Error("stripe_checkout_host_mismatch");
  }
  const fieldStatus = { paymentFieldsEntered: false };
  try {
    await selectCardPaymentMethod(page);
    await disableStripeLinkSave(page);
    if (
      !(await waitForVisibleStripeFieldByFallbacks(
        page,
        stripeCardNumberLocators,
      ))
    ) {
      throw new Error("stripe_checkout_payment_form_missing");
    }
    if (
      !(await fillVisibleStripeFieldByFallbacks(page, {
        value: "4242424242424242",
        locators: stripeCardNumberLocators,
      }))
    ) {
      throw new Error("stripe_checkout_card_number_field_missing");
    }
    fieldStatus.cardNumber = "filled";
    fieldStatus.paymentFieldsEntered = true;
    if (
      !(await fillVisibleStripeFieldByFallbacks(page, {
        value: "1234",
        locators: stripeCardExpiryLocators,
      }))
    ) {
      throw new Error("stripe_checkout_expiry_field_missing");
    }
    fieldStatus.expiry = "filled";
    if (
      !(await fillVisibleStripeFieldByFallbacks(page, {
        value: "123",
        locators: stripeCardCvcLocators,
      }))
    ) {
      throw new Error("stripe_checkout_cvc_field_missing");
    }
    fieldStatus.cvc = "filled";
    await fillVisibleStripeFieldByFallbacks(page, {
      value: "Blundr Wave 2B",
      locators: stripeCardholderNameLocators,
    });
    await fillVisibleStripeFieldByFallbacks(page, {
      value: "10001",
      locators: stripePostalCodeLocators,
    });
    for (const context of stripeInteractionContexts(page)) {
      const country = await findVisibleLocator(
        stripeCountryLocators(context.target),
      );
      if (country) {
        await country.selectOption("US").catch(() => {});
        break;
      }
    }
    await acknowledgeStripeAiAgentDisclosure(page);
    const submit = await waitForPrimaryStripeSubmitControl(page);
    proof.evidence.checkoutDiagnostics ??= {};
    proof.evidence.checkoutDiagnostics.submitStrategy = submit.strategy;
    proof.evidence.checkoutDiagnostics.submitFrameKind = submit.context.kind;
    proof.evidence.checkoutDiagnostics.submitFrameOrigin =
      submit.context.origin;
    proof.evidence.checkoutDiagnostics.submitFrameName = submit.context.name;
    await submit.locator.click();
    await page.waitForURL(
      (url) =>
        url.origin === stableCallbackOrigin &&
        url.pathname === "/billing/success",
      { timeout: 60000 },
    );
  } catch (error) {
    await captureCheckoutDiagnostics(
      page,
      error instanceof Error ? error.message : String(error),
      fieldStatus,
    );
    throw error;
  }
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
  checkoutSessionId =
    checkoutSessionId ?? (await readPersistedCheckoutSessionId());
  if (!checkoutSessionId) {
    throw new Error("checkout_session_id_not_persisted_for_verification");
  }
  const session = await stripe.checkout.sessions.retrieve(checkoutSessionId, {
    expand: ["subscription"],
  });
  if (session.metadata?.app_user_id !== ephemeralUser.id) {
    throw new Error("stripe_checkout_session_metadata_user_mismatch");
  }
  if (session.status !== "complete") {
    throw new Error(`stripe_checkout_session_not_complete:${session.status}`);
  }
  if (session.mode !== "subscription") {
    throw new Error("stripe_checkout_mode_mismatch");
  }
  const sessionAgeOk =
    typeof session.created === "number" &&
    session.created >= testStartedAt - 60;
  if (!sessionAgeOk) {
    throw new Error("stripe_checkout_session_outside_validation_window");
  }
  const lineItems = await stripe.checkout.sessions.listLineItems(
    checkoutSessionId,
    { limit: 10 },
  );
  const priceIds = lineItems.data.map((item) => item.price?.id).filter(Boolean);
  if (priceIds.join(",") !== "price_1UDmveLuqtbLOQt39LJ8Pp4v") {
    throw new Error("stripe_checkout_session_price_mismatch");
  }
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
  stripeCustomerId =
    typeof session.customer === "string"
      ? session.customer
      : (session.customer?.id ?? null);
  mask(stripeSubscriptionId, "STRIPE_SUBSCRIPTION_ID");
  if (stripeCustomerId) mask(stripeCustomerId, "STRIPE_CUSTOMER_ID");
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
  let lastStatus = null;
  while (Date.now() < deadline) {
    attempts += 1;
    let result;
    try {
      result = await fn();
    } catch (error) {
      proof.evidence[`${label}PollAttempts`] = attempts;
      throw error;
    }
    if (result?.status) lastStatus = result.status;
    if (result?.ok) {
      proof.evidence[`${label}PollAttempts`] = attempts;
      proof.evidence[`${label}LastStatus`] = lastStatus;
      return result;
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    delayMs = Math.min(maxDelayMs, Math.round(delayMs * 1.5));
  }
  proof.evidence[`${label}PollAttempts`] = attempts;
  proof.evidence[`${label}LastStatus`] = lastStatus;
  throw new Error(`${label}_timeout`);
}

async function readRevenueCatProEntitlement() {
  let rcResponse;
  try {
    rcResponse = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(ephemeralUser.id)}`,
      {
        headers: {
          Authorization: `Bearer ${required("REVENUECAT_REST_API_KEY")}`,
          Accept: "application/json",
        },
      },
    );
  } catch {
    return { ok: false, status: "network_error" };
  }
  if (rcResponse.status === 429 || rcResponse.status >= 500) {
    return { ok: false, status: rcResponse.status };
  }
  if ([400, 401, 403].includes(rcResponse.status)) {
    throw new Error(`revenuecat_v1_subscriber_failed:${rcResponse.status}`);
  }
  if (rcResponse.status === 404) {
    throw new Error("revenuecat_v1_subscriber_not_found_or_wrong_context:404");
  }
  if (![200, 201].includes(rcResponse.status)) {
    throw new Error(`revenuecat_v1_subscriber_unexpected:${rcResponse.status}`);
  }
  const body = await rcResponse.json();
  const entitlement = body?.subscriber?.entitlements?.[revenueCatEntitlementId];
  const expiresAt = Date.parse(entitlement?.expires_date);
  if (entitlement && (!Number.isFinite(expiresAt) || expiresAt <= Date.now())) {
    throw new Error("revenuecat_pro_entitlement_expired_or_malformed");
  }
  return {
    ok: Boolean(Number.isFinite(expiresAt) && expiresAt > Date.now()),
    status: rcResponse.status,
  };
}

async function readBackendProState(page) {
  let status;
  try {
    status = await appJson(page, "/api/blundr/billing/status");
  } catch {
    return { ok: false, status: "network_error" };
  }
  if ([429].includes(status.status) || status.status >= 500) {
    return { ok: false, status: status.status };
  }
  if (!status.ok)
    throw new Error(`post_purchase_billing_status_failed:${status.status}`);
  const access = status.body?.data;
  if (
    access?.plan === "pro" &&
    access?.entitlementActive === true &&
    access?.entitlementSource !== "revenuecat"
  ) {
    throw new Error("backend_pro_state_wrong_source");
  }
  return {
    ok:
      access?.plan === "pro" &&
      access?.entitlementActive === true &&
      access?.entitlementSource === "revenuecat",
    status: status.status,
  };
}

async function verifyRevenueCatAndBackend(page) {
  try {
    await pollUntil("revenuecatProEntitlement", readRevenueCatProEntitlement);
  } catch (error) {
    if (
      String(error instanceof Error ? error.message : error).includes(
        "revenuecatProEntitlement_timeout",
      )
    ) {
      proof.evidence.revenueCatConfigurationDiagnosis = [
        "Verify Track new purchases from server-to-server notifications is enabled for the sandbox Stripe integration.",
        "Verify App User ID detection reads Stripe metadata field app_user_id.",
        "Verify the sandbox Stripe connection and Stripe-to-RevenueCat webhook are configured.",
      ];
    }
    throw error;
  }
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
  await verifyPostStripeAuthorityOnly();
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
  await deleteEphemeralStripeCustomer().catch((error) => {
    proof.cleanup.customerDeleteError = sanitizeError(
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
