import { timingSafeEqual } from "node:crypto";

import {
  REVENUECAT_PRO_ENTITLEMENT,
  type BillingEnvironment,
  type BillingConfig,
} from "./billingConfig";
import {
  createSupabaseBillingRepository,
  type BillingRepository,
} from "./billingRepository.server";

type RevenueCatEnvironment = BillingEnvironment | "sandbox" | "production";
const SUPABASE_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function isoFromMillis(value: unknown): string | null {
  return typeof value === "number" && value > 0
    ? new Date(value).toISOString()
    : null;
}

function safeEquals(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function authorizeRevenueCatWebhook(
  supplied: string | null,
  config: Pick<BillingConfig, "revenueCatWebhookAuthorization">,
): boolean {
  return safeEquals(text(supplied), config.revenueCatWebhookAuthorization);
}

function normalizeEnvironment(value: unknown): RevenueCatEnvironment | null {
  const env = text(value).toLowerCase();
  if (env === "sandbox" || env === "test") return "sandbox";
  if (env === "production" || env === "live") return "production";
  return null;
}

function entitlementMatches(event: Record<string, unknown>): boolean {
  if (text(event.entitlement_id) === REVENUECAT_PRO_ENTITLEMENT) return true;
  const entitlementIds = Array.isArray(event.entitlement_ids)
    ? event.entitlement_ids.map(text)
    : [];
  return entitlementIds.includes(REVENUECAT_PRO_ENTITLEMENT);
}

function containsForeignSupabaseUuid(
  value: unknown,
  appUserId: string,
): boolean {
  if (!Array.isArray(value)) return false;
  return value.some((candidate) => {
    const alias = text(candidate);
    return SUPABASE_UUID_PATTERN.test(alias) && alias !== appUserId;
  });
}

function eventActive(type: string, expirationAt: string | null): boolean {
  if (type === "EXPIRATION") return false;
  if (
    [
      "BILLING_ISSUE",
      "CANCELLATION",
      "SUBSCRIPTION_PAUSED",
      "SUBSCRIPTION_EXTENDED",
      "TEMPORARY_ENTITLEMENT_GRANT",
      "REFUND_REVERSED",
      "PURCHASE_REDEEMED",
      "UNCANCELLATION",
    ].includes(type)
  ) {
    return Boolean(expirationAt);
  }
  return [
    "INITIAL_PURCHASE",
    "RENEWAL",
    "PRODUCT_CHANGE",
    "NON_RENEWING_PURCHASE",
    "TRANSFER",
  ].includes(type);
}

export async function processRevenueCatWebhook(input: {
  body: unknown;
  expectedEnvironment: BillingEnvironment;
  repository?: BillingRepository;
}): Promise<{ ok: true; duplicate: boolean; entitlementChanged: boolean } | { ok: false; status: number; error: string }> {
  const body =
    input.body && typeof input.body === "object"
      ? (input.body as Record<string, unknown>)
      : {};
  const event =
    body.event && typeof body.event === "object"
      ? (body.event as Record<string, unknown>)
      : body;
  const eventId = text(event.id);
  const type = text(event.type).toUpperCase();
  const appUserId = text(event.app_user_id);
  const environment = normalizeEnvironment(event.environment);
  if (!eventId || !type || !appUserId || !environment) {
    return { ok: false, status: 400, error: "invalid_revenuecat_event" };
  }
  if (environment !== input.expectedEnvironment && !(environment === "sandbox" && input.expectedEnvironment === "test")) {
    return { ok: false, status: 202, error: "revenuecat_environment_ignored" };
  }
  if (!entitlementMatches(event)) {
    return { ok: false, status: 202, error: "revenuecat_entitlement_ignored" };
  }
  if (!SUPABASE_UUID_PATTERN.test(appUserId)) {
    return { ok: false, status: 400, error: "revenuecat_app_user_id_not_supabase_uuid" };
  }
  const originalAppUserId = text(event.original_app_user_id);
  if (
    (SUPABASE_UUID_PATTERN.test(originalAppUserId) &&
      originalAppUserId !== appUserId) ||
    containsForeignSupabaseUuid(event.aliases, appUserId) ||
    containsForeignSupabaseUuid(event.transferred_from, appUserId)
  ) {
    return { ok: false, status: 202, error: "revenuecat_transfer_requires_manual_reconciliation" };
  }

  const repository = input.repository ?? createSupabaseBillingRepository();
  if (!(await repository.userExists(appUserId))) {
    return { ok: false, status: 400, error: "revenuecat_app_user_id_not_found" };
  }
  const ledger = await repository.beginProviderEvent({
    provider: "revenuecat",
    environment,
    eventId,
    eventType: type,
    eventOccurredAt:
      isoFromMillis(event.event_timestamp_ms) ??
      isoFromMillis(event.purchased_at_ms) ??
      new Date().toISOString(),
    facts: {
      type,
      appUserId,
      entitlementId: REVENUECAT_PRO_ENTITLEMENT,
      entitlementIds: Array.isArray(event.entitlement_ids)
        ? event.entitlement_ids.map(text)
        : [],
      productId: text(event.product_id) || null,
      expirationAt: isoFromMillis(event.expiration_at_ms),
    },
  });
  if (ledger === "duplicate") {
    return { ok: true, duplicate: true, entitlementChanged: false };
  }

  const expirationAt = isoFromMillis(event.expiration_at_ms);
  const eventAt =
    isoFromMillis(event.event_timestamp_ms) ??
    isoFromMillis(event.purchased_at_ms) ??
    new Date().toISOString();
  await repository.upsertSubscription({
    userId: appUserId,
    environment,
    provider: "revenuecat",
    providerCustomerId: appUserId,
    providerSubscriptionId: text(event.original_transaction_id) || eventId,
    providerProductId: text(event.product_id) || null,
    providerPriceId: text(event.product_id) || null,
    planInterval: null,
    status: type.toLowerCase(),
    trialStartAt: type === "INITIAL_PURCHASE" && event.period_type === "TRIAL" ? eventAt : null,
    trialEndAt: event.period_type === "TRIAL" ? expirationAt : null,
    currentPeriodEndAt: expirationAt,
    cancelAtPeriodEnd: type === "CANCELLATION",
    expiresAt: expirationAt,
    lastProviderEventAt: eventAt,
  });
  await repository.upsertTrustedEntitlement({
    userId: appUserId,
    environment,
    active: eventActive(type, expirationAt),
    expiresAt: expirationAt,
    lastVerifiedAt: new Date().toISOString(),
    lastProviderEventAt: eventAt,
    providerSubscriptionId: text(event.original_transaction_id) || eventId,
    metadata: { sourceEventType: type },
  });
  if (event.period_type === "TRIAL") {
    await repository.markTrialConsumed({
      userId: appUserId,
      environment: input.expectedEnvironment,
      provider: "revenuecat",
      providerSubscriptionId: text(event.original_transaction_id) || eventId,
    });
  }
  await repository.markProviderEvent({
    provider: "revenuecat",
    environment,
    eventId,
    status: "processed",
  });
  return { ok: true, duplicate: false, entitlementChanged: true };
}
