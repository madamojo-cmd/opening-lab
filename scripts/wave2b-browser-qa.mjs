import { chromium, expect } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

function requiredBrowserEnv(name) {
  const value = String(process.env[name] ?? "");
  if (!value.trim()) throw new Error(`missing_or_empty:${name}`);
  return value;
}

const baseUrl = requiredBrowserEnv("WAVE2B_PREVIEW_URL").replace(/\/+$/, "");
const qaEmail = requiredBrowserEnv("WAVE2B_QA_EMAIL");
const qaPassword = requiredBrowserEnv("WAVE2B_QA_PASSWORD");
const qaUserId = requiredBrowserEnv("WAVE2B_QA_SUPABASE_UUID");
const artifactDir = requiredBrowserEnv("ARTIFACT_DIR");

if (
  !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    qaUserId,
  )
) {
  throw new Error("missing_or_invalid:WAVE2B_QA_SUPABASE_UUID");
}

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

function createOfferFixture(plan) {
  const annual = plan === "annual";
  return {
    id: `wave2b-${plan}-offer`,
    legalVersion: "wave2b-preview-validation",
    plan,
    trialEligible: true,
    trialDays: 7,
    conversionTimestamp: "2026-09-11T17:00:00.000Z",
    cancelBeforeTimestamp: "2026-09-11T16:59:59.000Z",
    disclosure: `7 days free, then ${annual ? "$69.99/year" : "$9.99/month"} plus applicable taxes beginning September 11, 2026 at 5:00 PM UTC. Requires a payment method. Renews automatically until canceled. Cancel before September 11, 2026 at 4:59 PM UTC to avoid the first subscription charge.`,
    acknowledgement:
      "I understand that my 7-day Blundr Pro trial requires a payment method and will automatically convert to the plan I selected on the date shown above unless I cancel before then.",
  };
}
const onboardingSteps = [
  "welcome",
  "level",
  "priorities",
  "starter-pack",
  "training-mode",
  "pace",
  "line-changes",
  "review",
  "plan",
  "ready",
];
const onboardingValues = {
  welcome: true,
  level: "1200-1600",
  priorities: ["remember_openings", "review_mistakes"],
  "starter-pack": "classical_attacker",
  "training-mode": "assisted",
  pace: "standard",
  "line-changes": null,
  review: null,
};

const billingReturnRouteChecks = [
  {
    label: "billing-success",
    path: "/billing/success?session_id=cs_wave2b_redacted",
    pathname: "/billing/success",
    heading: /Subscription confirmation is being processed\./i,
    requiredText: [/provider reconciliation/i, /Settings -> Billing/i],
  },
  {
    label: "billing-cancel",
    path: "/billing/cancel",
    pathname: "/billing/cancel",
    heading: /Checkout was canceled\./i,
    requiredText: [/No subscription change was made/i, /Plan selection/i],
  },
];

const protectedRouteChecks = [
  {
    label: "settings-billing",
    path: "/settings#billing",
    pathname: "/settings",
    heading: /Account settings\./i,
    scopeSelector: "#billing",
    requiredText: [
      /Manage your Blundr plan from trusted billing state\./i,
      /Current plan: Free/i,
      /Subscription terms/i,
      /Upgrade/i,
    ],
  },
  {
    label: "train",
    path: "/train",
    pathname: "/train",
    heading:
      /Choose an opening\.|Loading your openings\.|Opening list unavailable\./i,
    requiredText: [
      /Unlocked openings only|checking which openings are ready|couldn't load your saved repertoire/i,
    ],
  },
  {
    label: "daily",
    path: "/daily",
    pathname: "/daily",
    heading: /Your Daily deck\./i,
    requiredText: [/First try counts/i, /Review · Daily Blundr/i],
  },
  {
    label: "review",
    path: "/review",
    pathname: "/review",
    heading: /Review what needs to stick\./i,
    requiredText: [/Review queue/i, /Minigames · separate from Daily/i],
  },
  {
    label: "repertoire",
    path: "/repertoire",
    pathname: "/repertoire",
    heading: /Your opening library\./i,
    requiredText: [/Repertoire/i, /Tempo Cache/i],
  },
  {
    label: "progress",
    path: "/progress",
    pathname: "/progress",
    heading: /Momentum, without noise\./i,
    requiredText: [
      /Daily rings/i,
      /Tempo/i,
      /Battery/i,
      /Daily Blundr/i,
      /STREAK & CONSISTENCY/i,
    ],
  },
  {
    label: "minigames",
    path: "/minigames",
    pathname: "/minigames",
    heading: /Review what needs to stick\./i,
    requiredText: [
      /Minigames · separate from Daily/i,
      /production practice games/i,
    ],
  },
];

function redactText(value) {
  let text = String(value ?? "");
  for (const forbidden of [qaEmail, qaPassword, qaUserId].filter(Boolean)) {
    text = text.split(forbidden).join("[redacted]");
  }
  return text
    .replace(
      /\b(?:sk_live|sk_test|whsec|rk_live|eyJ[A-Za-z0-9_-]{20,})\b/g,
      "[redacted]",
    )
    .replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi,
      "[redacted-uuid]",
    );
}

export function buildResetFailureMessage(resetAttempt) {
  const status = Number.isFinite(Number(resetAttempt?.status))
    ? Number(resetAttempt.status)
    : "unknown";
  const code = resetAttempt?.errorCode || "unknown_error";
  const message = resetAttempt?.errorMessage
    ? `: ${redactText(resetAttempt.errorMessage).slice(0, 500)}`
    : "";
  return `QA onboarding reset failed: HTTP ${status} ${code}${message}`;
}

function summarizeOnboardingBody(body) {
  return {
    ok: body?.ok === true,
    step: typeof body?.data?.step === "string" ? body.data.step : null,
    completed: body?.data?.completed === true,
    planIntent:
      typeof body?.data?.planIntent === "string" ? body.data.planIntent : null,
    errorCode: typeof body?.error?.code === "string" ? body.error.code : null,
  };
}

function assertNoSensitiveText(text, label) {
  const forbidden = [qaEmail, process.env.WAVE2B_QA_SUPABASE_UUID].filter(
    Boolean,
  );
  for (const value of forbidden) {
    if (text.includes(value)) {
      throw new Error(`${label} exposes private QA identity.`);
    }
  }
  if (
    /\b(?:sk_live|sk_test|whsec|rk_live|eyJ[A-Za-z0-9_-]{20,})\b/.test(text)
  ) {
    throw new Error(`${label} exposes credential-like text.`);
  }
  if (
    /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i.test(
      text,
    )
  ) {
    throw new Error(`${label} exposes a UUID.`);
  }
}

async function installRoutes(page) {
  await page.route(
    (url) =>
      url.origin === baseUrl && url.pathname === "/api/blundr/billing/offer",
    async (route) => {
      const body = route.request().postDataJSON();
      const keys = Object.keys(body ?? {}).sort();
      if (
        keys.join(",") !== "plan" ||
        !["monthly", "annual"].includes(body.plan)
      ) {
        throw new Error("Offer request must contain only the plan enum.");
      }
      const offer = createOfferFixture(body.plan);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, data: offer }),
      });
    },
  );
  await page.route(
    (url) =>
      url.origin === baseUrl &&
      url.pathname === "/api/blundr/billing/offer/accept",
    async (route) => {
      const body = route.request().postDataJSON();
      const keys = Object.keys(body ?? {}).sort();
      if (
        keys.join(",") !== "offerId,plan" ||
        !["monthly", "annual"].includes(body.plan)
      ) {
        throw new Error(
          "Offer acceptance request must contain only offerId and the plan enum.",
        );
      }
      if (body.offerId !== createOfferFixture(body.plan).id) {
        throw new Error(
          "Offer acceptance must use the offer ID for the selected plan.",
        );
      }
      const serialized = JSON.stringify(body);
      if (
        /price|amount|user|customer|entitlement|pro|subscription/i.test(
          serialized,
        )
      ) {
        throw new Error(
          "Offer acceptance must not include client-controlled billing authority.",
        );
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    },
  );
  await page.route(
    (url) =>
      url.origin === baseUrl && url.pathname === "/api/blundr/billing/checkout",
    async (route) => {
      const body = route.request().postDataJSON();
      const keys = Object.keys(body ?? {}).sort();
      if (
        keys.join(",") !== "plan" ||
        !["monthly", "annual"].includes(body.plan)
      ) {
        throw new Error("Checkout request must contain only the plan enum.");
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          data: {
            url: `${baseUrl}/billing/success?session_id=cs_wave2b_redacted`,
          },
        }),
      });
    },
  );
  await page.route(
    (url) =>
      url.origin === baseUrl && url.pathname === "/api/blundr/billing/status",
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          data: {
            plan: "free",
            entitlementActive: false,
            entitlementSource: null,
            trialStatus: "none",
            expiresAt: null,
            currentPeriodEndAt: null,
            cancelAtPeriodEnd: false,
            limits: {
              dailyBlundrCards: 5,
              reviewCompletionsPerDay: 5,
              activeOpenings: 3,
              premiumInsights: false,
            },
          },
        }),
      });
    },
  );
  await page.route(
    (url) =>
      url.origin === baseUrl && url.pathname === "/api/blundr/billing/portal",
    async (route) => {
      const body = route.request().postData();
      if (body && /customer|stripe/i.test(body)) {
        throw new Error(
          "Portal request must not include client customer authority.",
        );
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          data: { url: `${baseUrl}/settings?portal=redacted` },
        }),
      });
    },
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

async function waitForExpectedBrowserSession(page, label) {
  const deadline = Date.now() + 20000;
  let latest = null;
  while (Date.now() < deadline) {
    latest = await readBrowserSession(page);
    if (latest.authenticated && latest.userMatchesExpected) return latest;
    await page.waitForTimeout(250);
  }
  if (latest?.authenticated && !latest.userMatchesExpected) {
    throw new Error(`${label}_authenticated_unexpected_user`);
  }
  throw new Error(`${label}_session_not_established`);
}

async function signIn(page) {
  const response = await page.goto(`${baseUrl}/login?next=/onboarding/plan`, {
    waitUntil: "domcontentloaded",
  });
  if (!response || response.status() < 200 || response.status() >= 400) {
    throw new Error(
      `login_page_unavailable:${response?.status() ?? "no_response"}`,
    );
  }
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
    .or(form.locator('input[type="password"]'))
    .first();
  await expect(email).toBeVisible({ timeout: 15000 });
  await expect(password).toBeVisible({ timeout: 15000 });
  await email.fill(qaEmail);
  await password.fill(qaPassword);
  await email.blur();
  await password.blur();
  await expectInputCommitted(email, "email");
  await expectInputCommitted(password, "password");

  const authResponsePromise = page
    .waitForResponse(
      (candidate) => {
        const url = new URL(candidate.url());
        return (
          url.hostname.endsWith(".supabase.co") &&
          url.pathname === "/auth/v1/token" &&
          candidate.request().method() === "POST"
        );
      },
      { timeout: 15000 },
    )
    .catch(() => null);
  const submit = form.getByRole("button", { name: "Log in", exact: true });
  await expect(submit).toBeVisible({ timeout: 15000 });
  await expect(submit).toBeEnabled({ timeout: 15000 });
  await submit.click();

  const authResponse = await authResponsePromise;
  if (!authResponse) {
    throw new Error("login_auth_request_not_observed");
  }
  if (!authResponse.ok()) {
    throw new Error(`login_auth_rejected:${authResponse.status()}`);
  }
  await waitForExpectedBrowserSession(page, "login");
  await page.waitForURL((url) => url.pathname !== "/login", {
    timeout: 15000,
  });
  if (new URL(page.url()).pathname === "/login") {
    throw new Error("login_did_not_leave_login_route");
  }
}

function installPageDiagnostics(page) {
  const diagnostics = {
    responses: [],
    requestFailures: [],
    consoleErrors: [],
    pageErrors: [],
  };
  const interesting = new Set([
    "/login",
    "/onboarding/plan",
    "/api/blundr/onboarding/v11",
    "/api/blundr/dev/reset-user",
    "/api/blundr/billing/offer",
    "/api/blundr/billing/checkout",
    "/api/blundr/billing/status",
    "/billing/upgrade",
    "/api/blundr/billing/portal",
  ]);
  function pathFor(url) {
    try {
      const parsed = new URL(url);
      if (parsed.origin !== baseUrl) return null;
      return parsed.pathname;
    } catch {
      return null;
    }
  }
  page.on("response", (response) => {
    const path = pathFor(response.url());
    if (!path || !interesting.has(path)) return;
    diagnostics.responses.push({
      path,
      status: response.status(),
      ok: response.ok(),
    });
  });
  page.on("requestfailed", (request) => {
    const path = pathFor(request.url());
    if (!path) return;
    diagnostics.requestFailures.push({
      path,
      method: request.method(),
      resourceType: request.resourceType(),
      failure: redactText(request.failure()?.errorText ?? "unknown"),
    });
  });
  page.on("console", (message) => {
    if (message.type() === "error") {
      diagnostics.consoleErrors.push(redactText(message.text()).slice(0, 500));
    }
  });
  page.on("pageerror", (error) => {
    diagnostics.pageErrors.push(redactText(error.message).slice(0, 500));
  });
  return diagnostics;
}

async function redactPageForScreenshot(page) {
  await page
    .evaluate(() => {
      for (const input of document.querySelectorAll("input")) {
        const type = input.getAttribute("type") || "";
        if (/email|password|text|search|tel/i.test(type)) {
          input.value = "";
          input.setAttribute("value", "");
        }
      }
    })
    .catch(() => {});
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
  }, qaUserId);
}

async function authenticatedJson(page, accessToken, path, init = {}) {
  return page.evaluate(
    async ({ accessToken, path, init }) => {
      const response = await fetch(path, {
        ...init,
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authorization: `Bearer ${accessToken}`,
          ...(init.headers || {}),
        },
        credentials: "same-origin",
      });
      const body = await response.json().catch(() => null);
      return { status: response.status, ok: response.ok, body };
    },
    { accessToken, path, init },
  );
}

async function readOnboardingState(page, accessToken) {
  const result = await authenticatedJson(
    page,
    accessToken,
    "/api/blundr/onboarding/v11",
  );
  return {
    status: result.status,
    ok: result.ok,
    ...summarizeOnboardingBody(result.body),
  };
}

async function waitForOnboardingState(page, accessToken, predicate, label) {
  const deadline = Date.now() + 15000;
  let latest = null;
  while (Date.now() < deadline) {
    latest = await readOnboardingState(page, accessToken);
    if (latest.ok && predicate(latest)) return latest;
    await page.waitForTimeout(250);
  }
  throw new Error(
    `Onboarding state did not reach ${label}; latest step is ${latest?.step ?? "unknown"}, completed=${latest?.completed ?? "unknown"}.`,
  );
}

async function patchOnboardingStep(page, accessToken, step) {
  const result = await authenticatedJson(
    page,
    accessToken,
    "/api/blundr/onboarding/v11",
    {
      method: "PATCH",
      body: JSON.stringify({
        step,
        value: onboardingValues[step],
        ageConfirmed: step === "welcome" ? true : undefined,
      }),
    },
  );
  return {
    status: result.status,
    ok: result.ok,
    ...summarizeOnboardingBody(result.body),
  };
}

async function resetQaOnboarding(page, accessToken) {
  const result = await authenticatedJson(
    page,
    accessToken,
    "/api/blundr/dev/reset-user",
    {
      method: "POST",
      body: JSON.stringify({
        scope: "onboarding",
        userId: qaUserId,
      }),
    },
  );
  const onboardingSummary = result.ok
    ? summarizeOnboardingBody({ ok: true, data: result.body?.onboarding })
    : {};
  return {
    status: result.status,
    ...onboardingSummary,
    ok: result.ok,
    errorCode:
      typeof result.body?.error?.code === "string"
        ? result.body.error.code
        : null,
    errorMessage:
      typeof result.body?.error?.message === "string"
        ? redactText(result.body.error.message).slice(0, 500)
        : null,
  };
}

async function ensureOnboardingPlanState(page, accessToken, diagnostics) {
  let state = await readOnboardingState(page, accessToken);
  diagnostics.initialOnboarding = state;
  if (!state.ok) return state;
  const planIndex = onboardingSteps.indexOf("plan");
  let currentIndex = onboardingSteps.indexOf(state.step);
  if (state.completed || currentIndex > planIndex) {
    diagnostics.resetAttempt = await resetQaOnboarding(page, accessToken);
    if (!diagnostics.resetAttempt.ok) {
      diagnostics.finalOnboarding = state;
      throw new Error(buildResetFailureMessage(diagnostics.resetAttempt));
    }
    state = await readOnboardingState(page, accessToken);
    currentIndex = onboardingSteps.indexOf(state.step);
  }
  diagnostics.advancement = [];
  while (state.ok && !state.completed && state.step !== "plan") {
    currentIndex = onboardingSteps.indexOf(state.step);
    if (currentIndex < 0 || currentIndex >= planIndex) break;
    const patched = await patchOnboardingStep(page, accessToken, state.step);
    diagnostics.advancement.push({
      from: state.step,
      status: patched.status,
      ok: patched.ok,
      nextStep: patched.step,
      completed: patched.completed,
      errorCode: patched.errorCode,
    });
    state = patched;
  }
  diagnostics.finalOnboarding = state;
  return state;
}

async function clickExactFreePlanCard(page) {
  const freeCard = page
    .locator("button")
    .filter({ has: page.getByText("Blundr Free", { exact: true }) })
    .filter({ has: page.getByText("Continue with Free", { exact: true }) });
  const count = await freeCard.count();
  if (count !== 1) {
    throw new Error(`Expected exactly one Free plan card, found ${count}.`);
  }
  await freeCard.click();
}

async function completeFreeOnboarding(page, accessToken, viewport) {
  await page.goto(`${baseUrl}/onboarding/plan`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForLoadState("networkidle").catch(() => {});
  await expect(
    page.getByRole("heading", { name: /choose how you want to train/i }),
  ).toBeVisible({ timeout: 15000 });
  await clickExactFreePlanCard(page);
  const freeContinue = page.getByRole("button", {
    name: "Continue with Free",
    exact: true,
  });
  await expect(freeContinue).toBeVisible({ timeout: 15000 });
  await expect(freeContinue).toBeEnabled();
  await freeContinue.click();
  if (/stripe\.com/i.test(page.url())) {
    throw new Error("Free path must not launch Stripe.");
  }
  const readyState = await waitForOnboardingState(
    page,
    accessToken,
    (state) =>
      state.step === "ready" &&
      state.completed === false &&
      state.planIntent === "free",
    "ready with Free plan intent",
  );
  if (readyState.completed) {
    throw new Error(
      "Free plan save must not skip the ready confirmation step.",
    );
  }
  await expect(
    page.getByRole("heading", { name: /Your trainer is ready\./i }),
  ).toBeVisible({ timeout: 15000 });
  const startTraining = page.getByRole("button", {
    name: "Start training",
    exact: true,
  });
  await expect(startTraining).toBeVisible({ timeout: 15000 });
  await startTraining.click();
  await waitForOnboardingState(
    page,
    accessToken,
    (state) => state.completed === true && state.step === "ready",
    "completed ready state",
  );
  if (/stripe\.com/i.test(page.url())) {
    throw new Error("Completing Free onboarding must not launch Stripe.");
  }
  await snapshot(page, viewport, "onboarding-free-completed");
}

async function writePaywallDiagnostics(
  page,
  viewport,
  diagnostics,
  sessionSummary,
  state,
  response,
) {
  const heading = await page
    .locator("h1")
    .first()
    .textContent()
    .catch(() => null);
  const path = (() => {
    try {
      return new URL(page.url()).pathname;
    } catch {
      return "unknown";
    }
  })();
  const payload = {
    status: "before_paywall_assertion",
    authenticationSucceeded: sessionSummary.authenticated === true,
    userIdPresent: sessionSummary.userIdPresent === true,
    userMatchesExpected: sessionSummary.userMatchesExpected === true,
    currentPathname: path,
    pageHttpStatus: response?.status() ?? null,
    onboardingApiStatus: state.status,
    currentOnboardingStep: state.step,
    onboardingCompleted: state.completed,
    visibleHeading: redactText(heading),
    responses: diagnostics.responses.slice(-20),
    requestFailures: diagnostics.requestFailures.slice(-20),
    consoleErrors: diagnostics.consoleErrors.slice(-20),
    pageErrors: diagnostics.pageErrors.slice(-20),
    initialOnboarding: diagnostics.initialOnboarding,
    finalOnboarding: diagnostics.finalOnboarding,
    resetAttempt: diagnostics.resetAttempt ?? null,
    advancement: diagnostics.advancement ?? [],
  };
  await writeFile(
    `${artifactDir}/browser-diagnostics-${viewport.name}-before-paywall.json`,
    `${JSON.stringify(payload, null, 2)}\n`,
  );
  await redactPageForScreenshot(page);
  await page.screenshot({
    path: `${artifactDir}/screenshots/${viewport.name}-before-paywall.png`,
    fullPage: true,
  });
  assertNoSensitiveText(
    await page.locator("body").innerText(),
    `${viewport.name}-before-paywall`,
  );
}

async function assertLayout(page, label) {
  const bodyText = await page.locator("body").innerText();
  assertNoSensitiveText(bodyText, label);
  const layout = await page.evaluate(() => {
    const width = window.innerWidth;
    const overflowing = [];
    for (const element of document.querySelectorAll("body *")) {
      const style = window.getComputedStyle(element);
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        Number.parseFloat(style.opacity || "1") === 0
      ) {
        continue;
      }
      const rect = element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) continue;
      if (rect.left < -8 || rect.right > width + 8) {
        overflowing.push({
          tag: element.tagName,
          text: (element.textContent || "").trim().slice(0, 80),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
        });
      }
    }
    return {
      documentOverflow: document.documentElement.scrollWidth > width + 8,
      overflowing,
    };
  });
  if (layout.documentOverflow || layout.overflowing.length) {
    throw new Error(`${label} has horizontal overflow or clipped controls.`);
  }
}

async function snapshot(page, viewport, label) {
  await assertLayout(page, `${viewport.name}-${label}`);
  await page.screenshot({
    path: `${artifactDir}/screenshots/${viewport.name}-${label}.png`,
    fullPage: true,
  });
}

export async function hasVisibleRequiredTextMatch(routeScope, text) {
  const matches = routeScope.getByText(text);
  const count = await matches.count();
  for (let index = 0; index < count; index += 1) {
    if (await matches.nth(index).isVisible()) {
      return true;
    }
  }
  return false;
}

export async function expectVisibleRequiredText(
  routeScope,
  text,
  options = {},
) {
  const timeout = options.timeout ?? 15000;
  await expect
    .poll(() => hasVisibleRequiredTextMatch(routeScope, text), {
      timeout,
      message: `Expected at least one visible route text match for ${String(text)}`,
    })
    .toBe(true);
}

async function waitForBillingOfferResponse(page, plan, action) {
  const responsePromise = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      url.origin === baseUrl &&
      url.pathname === "/api/blundr/billing/offer" &&
      response.request().method() === "POST"
    );
  });
  await action();
  const response = await responsePromise;
  if (!response.ok()) {
    throw new Error(
      `${plan} offer response failed with HTTP ${response.status()}.`,
    );
  }
  const body = await response.json();
  if (
    body?.ok !== true ||
    body?.data?.plan !== plan ||
    body.data.id !== createOfferFixture(plan).id
  ) {
    throw new Error(
      `${plan} offer response did not match the billing API contract.`,
    );
  }
  return body.data;
}

const acknowledgementName =
  /I understand that my 7-day Blundr Pro trial requires a payment method and will automatically convert to the plan I selected/i;

async function assertCheckoutRequestContainsOnlyPlan(request, plan) {
  const body = request.postDataJSON();
  const keys = Object.keys(body ?? {}).sort();
  if (keys.join(",") !== "plan" || body.plan !== plan) {
    throw new Error(
      "Checkout request must contain only the trusted plan enum.",
    );
  }
  if (
    /price|amount|user|uuid|customer|entitlement|subscription|trial/i.test(
      JSON.stringify(body),
    )
  ) {
    throw new Error("Checkout request includes client billing authority.");
  }
}

async function validatePaywall(page, viewport, diagnostics) {
  const sessionSummary = await readBrowserSession(page);
  if (
    !sessionSummary.authenticated ||
    !sessionSummary.accessToken ||
    !sessionSummary.userMatchesExpected
  ) {
    await writePaywallDiagnostics(
      page,
      viewport,
      diagnostics,
      sessionSummary,
      { status: null, step: null, completed: null },
      null,
    );
    throw new Error(
      "QA authentication did not produce the expected non-production user session.",
    );
  }
  let state;
  try {
    state = await ensureOnboardingPlanState(
      page,
      sessionSummary.accessToken,
      diagnostics,
    );
  } catch (error) {
    await writePaywallDiagnostics(
      page,
      viewport,
      diagnostics,
      sessionSummary,
      diagnostics.finalOnboarding ??
        diagnostics.initialOnboarding ?? {
          status: null,
          step: null,
          completed: null,
        },
      null,
    );
    throw error;
  }
  const response = await page.goto(`${baseUrl}/onboarding/plan`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForLoadState("networkidle").catch(() => {});
  const currentState = await readOnboardingState(
    page,
    sessionSummary.accessToken,
  );
  await writePaywallDiagnostics(
    page,
    viewport,
    diagnostics,
    sessionSummary,
    currentState,
    response,
  );
  if (!state.ok || !currentState.ok) {
    throw new Error(
      "Authenticated onboarding-state endpoint did not return a usable state.",
    );
  }
  if (currentState.completed || currentState.step !== "plan") {
    throw new Error(
      `QA account is not at onboarding plan step; current step is ${currentState.step ?? "unknown"}.`,
    );
  }
  await validateRouteChecks(page, viewport, billingReturnRouteChecks);
  await page.goto(`${baseUrl}/onboarding/plan`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForLoadState("networkidle").catch(() => {});
  await expect(
    page.getByRole("heading", { name: /choose how you want to train/i }),
  ).toBeVisible();
  await expect(
    page.getByText(
      /keep training free, or try everything in blundr pro for 7 days/i,
    ),
  ).toBeVisible();
  await expect(page.getByText("$9.99/month after trial")).toBeVisible();
  await expect(page.getByText("$69.99/year after trial")).toBeVisible();
  await expect(page.getByText(/save 42%/i)).toBeVisible();

  const monthly = page.getByRole("button", { name: /monthly/i }).first();
  const annual = page
    .getByRole("button", { name: /annual|best value/i })
    .first();
  await expect(monthly).not.toHaveAttribute("aria-pressed", "true");
  await expect(annual).not.toHaveAttribute("aria-pressed", "true");

  const monthlyOffer = await waitForBillingOfferResponse(
    page,
    "monthly",
    async () => {
      await monthly.click();
    },
  );
  const acknowledgement = page.getByRole("checkbox", {
    name: acknowledgementName,
  });
  await expect(acknowledgement).toBeVisible();
  await expect(acknowledgement).not.toBeChecked();
  await expect(page.getByText(/card required/i)).toBeVisible();
  if (!monthlyOffer.disclosure.includes("$9.99/month")) {
    throw new Error(
      "Monthly offer disclosure does not include the monthly price.",
    );
  }
  await expect(
    page.getByText(
      /7 days free, then \$9\.99\/month plus applicable taxes beginning/i,
    ),
  ).toBeVisible();
  await expect(page.getByText(/requires a payment method/i)).toBeVisible();
  const checkout = page.getByRole("button", { name: /start 7-day pro trial/i });
  await expect(checkout).toBeDisabled();
  await acknowledgement.check();
  await expect(checkout).toBeEnabled();
  await snapshot(page, viewport, "onboarding-paywall-monthly");

  const annualOffer = await waitForBillingOfferResponse(
    page,
    "annual",
    async () => {
      await annual.click();
    },
  );
  await expect(acknowledgement).toBeVisible();
  await expect(acknowledgement).not.toBeChecked();
  await expect(checkout).toBeDisabled();
  if (!annualOffer.disclosure.includes("$69.99/year")) {
    throw new Error(
      "Annual offer disclosure does not include the annual price.",
    );
  }
  await expect(page.getByText("$69.99/year after trial")).toBeVisible();
  await expect(
    page.getByText(
      /7 days free, then \$69\.99\/year plus applicable taxes beginning/i,
    ),
  ).toBeVisible();
  await acknowledgement.check();
  await expect(checkout).toBeEnabled();
  await snapshot(page, viewport, "onboarding-paywall-annual");

  await completeFreeOnboarding(page, sessionSummary.accessToken, viewport);
}

async function validateRouteChecks(page, viewport, routeChecks) {
  for (const check of routeChecks) {
    const response = await page.goto(`${baseUrl}${check.path}`, {
      waitUntil: "domcontentloaded",
    });
    if (!response) {
      throw new Error(
        `${check.label} did not produce a main-document response.`,
      );
    }
    if (response.status() < 200 || response.status() >= 400) {
      throw new Error(`${check.label} returned HTTP ${response.status()}.`);
    }
    await page.waitForLoadState("networkidle").catch(() => {});
    const finalPath = new URL(page.url()).pathname;
    if (finalPath !== check.pathname) {
      throw new Error(`${check.label} ended on unexpected path ${finalPath}.`);
    }
    const bodyText = await page.locator("body").innerText();
    if (
      /404\s*This page could not be found|This page could not be found|Application error|Internal Server Error/i.test(
        bodyText,
      )
    ) {
      throw new Error(
        `${check.label} rendered a Not Found or generic error page.`,
      );
    }
    await expect(
      page.getByRole("heading", { name: check.heading }).first(),
    ).toBeVisible({ timeout: 15000 });
    const routeScope = check.scopeSelector
      ? page.locator(check.scopeSelector)
      : page.locator("main").first();
    await expect(routeScope).toBeVisible({ timeout: 15000 });
    for (const text of check.requiredText) {
      await expectVisibleRequiredText(routeScope, text, { timeout: 15000 });
    }
    await snapshot(page, viewport, check.label);
  }
}

async function validateSettingsUpgrade(page, viewport) {
  await page.goto(`${baseUrl}/settings#billing`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForLoadState("networkidle").catch(() => {});
  const billingSection = page.locator("#billing");
  await expect(billingSection).toBeVisible({ timeout: 15000 });
  const upgrade = billingSection.getByRole("link", {
    name: "Upgrade",
    exact: true,
  });
  await expect(upgrade).toBeVisible({ timeout: 15000 });
  await upgrade.click();
  await page.waitForURL((url) => url.pathname === "/billing/upgrade", {
    timeout: 15000,
  });
  if (new URL(page.url()).pathname !== "/billing/upgrade") {
    throw new Error("Settings Upgrade did not open /billing/upgrade.");
  }
  await expect(
    page.getByRole("heading", { name: "Upgrade to Blundr Pro." }),
  ).toBeVisible({ timeout: 15000 });
  await expect(
    page.getByRole("button", { name: /continue with free/i }),
  ).toHaveCount(0);
  await expect(page.getByText("$9.99/month after trial")).toBeVisible();
  await expect(page.getByText("$69.99/year after trial")).toBeVisible();

  const monthly = page.getByRole("button", { name: /monthly/i }).first();
  const annual = page
    .getByRole("button", { name: /annual|best value/i })
    .first();
  const monthlyOffer = await waitForBillingOfferResponse(
    page,
    "monthly",
    async () => {
      await monthly.click();
    },
  );
  if (!monthlyOffer.disclosure.includes("$9.99/month")) {
    throw new Error("Upgrade monthly offer disclosure mismatch.");
  }
  const acknowledgement = page.getByRole("checkbox", {
    name: acknowledgementName,
  });
  const checkout = page.getByRole("button", { name: /start 7-day pro trial/i });
  await expect(acknowledgement).toBeVisible({ timeout: 15000 });
  await expect(acknowledgement).not.toBeChecked();
  await expect(checkout).toBeDisabled();
  await acknowledgement.check();
  await expect(checkout).toBeEnabled();

  await waitForBillingOfferResponse(page, "annual", async () => {
    await annual.click();
  });
  await expect(acknowledgement).not.toBeChecked();
  await expect(checkout).toBeDisabled();
  await acknowledgement.check();
  await expect(checkout).toBeEnabled();

  await waitForBillingOfferResponse(page, "monthly", async () => {
    await monthly.click();
  });
  await acknowledgement.check();
  const checkoutRequestPromise = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return (
      url.origin === baseUrl &&
      url.pathname === "/api/blundr/billing/checkout" &&
      request.method() === "POST"
    );
  });
  await checkout.click();
  await assertCheckoutRequestContainsOnlyPlan(
    await checkoutRequestPromise,
    "monthly",
  );
  await page.waitForURL((url) => url.pathname === "/billing/success", {
    timeout: 15000,
  });
  await snapshot(page, viewport, "settings-upgrade");
}

async function validateRoutes(page, viewport) {
  await validateRouteChecks(page, viewport, protectedRouteChecks);
  await validateSettingsUpgrade(page, viewport);
}

async function validateKeyboard(page) {
  await page.goto(`${baseUrl}/billing/upgrade`, {
    waitUntil: "domcontentloaded",
  });
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => {
    const active = document.activeElement;
    if (!active || active === document.body) return null;
    const rect = active.getBoundingClientRect();
    const style = window.getComputedStyle(active);
    return {
      tag: active.tagName,
      role: active.getAttribute("role"),
      text: (active.textContent || "").trim().slice(0, 80),
      visible: rect.width > 0 && rect.height > 0,
      outline: style.outlineStyle,
      boxShadow: style.boxShadow,
    };
  });
  if (!focused?.visible) {
    throw new Error("Keyboard focus did not land on a visible control.");
  }
}

export async function runWave2BBrowserQa() {
  const browser = await chromium.launch();
  const summary = [];
  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      const pageDiagnostics = installPageDiagnostics(page);
      await installRoutes(page);
      await signIn(page);
      await installRoutes(page);
      await validatePaywall(page, viewport, pageDiagnostics);
      await validateRoutes(page, viewport);
      await validateKeyboard(page);
      summary.push({ viewport: viewport.name, status: "passed" });
      await context.close();
    }
  } finally {
    await browser.close();
  }
  await writeFile(
    `${artifactDir}/browser-qa-summary.json`,
    `${JSON.stringify(
      {
        classification: "BROWSER_CONTRACT_QA",
        status: "passed",
        billingCoverage: "mocked_browser_contract_only",
        providerProof: "separate_sandbox_integration_required",
        acceptanceEligible: false,
        summary,
      },
      null,
      2,
    )}\n`,
  );
}

function isDirectExecution() {
  return (
    typeof process.argv[1] === "string" &&
    import.meta.url === pathToFileURL(process.argv[1]).href
  );
}

if (isDirectExecution()) {
  await runWave2BBrowserQa();
}
