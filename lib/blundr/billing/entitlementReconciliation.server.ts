import {
  REVENUECAT_PRO_ENTITLEMENT,
  type BillingConfig,
} from "./billingConfig";
import {
  createSupabaseBillingRepository,
  type BillingRepository,
} from "./billingRepository.server";

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function parseProviderExpiration(value: unknown): {
  expiresAt: string | null;
  valid: boolean;
} {
  const raw = text(value);
  if (!raw) return { expiresAt: null, valid: false };
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed)
    ? { expiresAt: new Date(parsed).toISOString(), valid: true }
    : { expiresAt: null, valid: false };
}

export async function reconcileRevenueCatSubscriber(input: {
  appUserId: string;
  config: BillingConfig;
  fetchImpl?: typeof fetch;
  repository?: BillingRepository;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!input.config.revenueCatApiKey) {
    return { ok: false, error: "revenuecat_api_key_missing" };
  }
  if (input.appUserId !== input.appUserId.trim()) {
    return { ok: false, error: "invalid_revenuecat_app_user_id" };
  }
  const fetchImpl = input.fetchImpl ?? fetch;
  const response = await fetchImpl(
    `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(input.appUserId)}`,
    {
      headers: {
        authorization: `Bearer ${input.config.revenueCatApiKey}`,
        accept: "application/json",
      },
      cache: "no-store",
    },
  );
  if (!response.ok)
    return { ok: false, error: "revenuecat_reconciliation_failed" };
  const body = (await response.json()) as {
    subscriber?: {
      entitlements?: Record<string, { expires_date?: string | null }>;
    };
  };
  const entitlement =
    body.subscriber?.entitlements?.[REVENUECAT_PRO_ENTITLEMENT];
  const expiration = parseProviderExpiration(entitlement?.expires_date);
  const active = Boolean(
    entitlement &&
      expiration.valid &&
      expiration.expiresAt &&
      Date.parse(expiration.expiresAt) > Date.now(),
  );
  const repository = input.repository ?? createSupabaseBillingRepository();
  if (!(await repository.userExists(input.appUserId))) {
    return { ok: false, error: "revenuecat_app_user_id_not_found" };
  }
  await repository.upsertTrustedEntitlement({
    userId: input.appUserId,
    environment: input.config.environment,
    active,
    expiresAt: expiration.expiresAt,
    lastVerifiedAt: new Date().toISOString(),
    lastProviderEventAt: null,
    providerSubscriptionId: null,
    metadata: {
      reconciliation: true,
      revenueCatProEntitlementPresent: Boolean(entitlement),
      revenueCatExpirationValid: expiration.valid,
    },
  });
  return { ok: true };
}
