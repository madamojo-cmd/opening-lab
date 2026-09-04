export type BillingEnvironment = "test" | "live";
export type BillingPlan = "monthly" | "annual";

export type BillingConfig = {
  environment: BillingEnvironment;
  appOrigin: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  stripePrices: Record<BillingPlan, string>;
  revenueCatWebhookAuthorization: string;
  revenueCatApiKey: string | null;
};

export const LOCKED_STRIPE_PRO_MONTHLY_PRICE_ID =
  "price_1UBaUQLGvBclDkdEYam8Nz43";
export const LOCKED_STRIPE_PRO_ANNUAL_PRICE_ID =
  "price_1UBaUQLGvBclDkdEZNLeAfpq";
export const REVENUECAT_PRO_ENTITLEMENT = "pro";
export const REVENUECAT_DEFAULT_OFFERING = "default";
export const STRIPE_APP_USER_ID_METADATA_KEY = "app_user_id";
export const PRO_TRIAL_DAYS = 7;

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function required(name: string): string {
  const value = text(process.env[name]);
  if (!value) throw new Error(`billing_env_missing:${name}`);
  return value;
}

function appOrigin(): string {
  const configured =
    text(process.env.BLUNDR_APP_ORIGIN) ||
    text(process.env.NEXT_PUBLIC_BLUNDR_SITE_URL) ||
    text(process.env.NEXT_PUBLIC_SITE_URL) ||
    text(process.env.NEXT_PUBLIC_BLUNDR_APP_URL) ||
    (text(process.env.VERCEL_URL)
      ? `https://${text(process.env.VERCEL_URL)}`
      : "");
  if (!configured) throw new Error("billing_env_missing:BLUNDR_APP_ORIGIN");
  const url = new URL(configured);
  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new Error("billing_origin_must_be_https");
  }
  return url.origin;
}

export function readBillingConfig(): BillingConfig {
  const environment = required("BLUNDR_BILLING_ENVIRONMENT");
  if (environment !== "test" && environment !== "live") {
    throw new Error("invalid_billing_environment");
  }
  if (environment === "live") {
    throw new Error("billing_live_not_enabled_in_wave2a");
  }
  const stripePrices = {
    monthly: required("STRIPE_PRO_MONTHLY_PRICE_ID"),
    annual: required("STRIPE_PRO_ANNUAL_PRICE_ID"),
  };
  if (stripePrices.monthly !== LOCKED_STRIPE_PRO_MONTHLY_PRICE_ID) {
    throw new Error("stripe_monthly_price_mismatch");
  }
  if (stripePrices.annual !== LOCKED_STRIPE_PRO_ANNUAL_PRICE_ID) {
    throw new Error("stripe_annual_price_mismatch");
  }
  return {
    environment,
    appOrigin: appOrigin(),
    stripeSecretKey: required("STRIPE_SECRET_KEY"),
    stripeWebhookSecret: required("STRIPE_WEBHOOK_SECRET"),
    stripePrices,
    revenueCatWebhookAuthorization: required("REVENUECAT_WEBHOOK_AUTHORIZATION"),
    revenueCatApiKey: text(process.env.REVENUECAT_REST_API_KEY) || null,
  };
}

export function priceForBillingPlan(
  config: Pick<BillingConfig, "stripePrices">,
  plan: unknown,
): { ok: true; plan: BillingPlan; priceId: string } | { ok: false } {
  if (plan !== "monthly" && plan !== "annual") return { ok: false };
  return { ok: true, plan, priceId: config.stripePrices[plan] };
}

export function billingUrl(origin: string, path: "/billing/success" | "/billing/cancel" | "/settings"): string {
  return new URL(path, origin).toString();
}
