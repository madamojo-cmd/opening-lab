import type { BlundrAnalyticsEventName } from "./blundrAnalyticsEvents";
import { BLUNDR_OPTIONAL_ANALYTICS_CONSENT_STORAGE_KEY } from "@/lib/blundr/privacy/privacyPreferences";

export type BlundrAnalyticsPayload = Record<string, unknown>;

const TELEMETRY_PATH = "/api/blundr/telemetry";
const PUBLIC_TELEMETRY_EVENTS = new Set<BlundrAnalyticsEventName>([
  "AUTH_HYDRATION_COMPLETED",
  "AUTH_HYDRATION_FAILED",
  "SIGNUP_STARTED",
  "SIGNUP_COMPLETED",
  "TRAINING_STARTED",
  "TRAINING_COMPLETED",
  "DAILY_STARTED",
  "DAILY_COMPLETED",
  "PAYWALL_VIEWED",
  "PLAN_SELECTED",
  "CHECKOUT_STARTED",
  "TRIAL_STARTED",
  "PRO_ACTIVATED",
  "BILLING_PORTAL_OPENED",
  "SUBSCRIPTION_CANCEL_SCHEDULED",
  "ANALYTICS_CONSENT_UPDATED",
]);
const OPERATIONAL_TELEMETRY_EVENTS = new Set<BlundrAnalyticsEventName>([
  "AUTH_HYDRATION_COMPLETED",
  "AUTH_HYDRATION_FAILED",
]);

function safePayload(payload: BlundrAnalyticsPayload): BlundrAnalyticsPayload {
  return Object.fromEntries(
    Object.entries(payload)
      .filter(([key]) => /^[a-zA-Z][a-zA-Z0-9_]{0,63}$/.test(key))
      .slice(0, 32)
      .map(([key, value]) => [
        key,
        typeof value === "string"
          ? value.slice(0, 160)
          : typeof value === "number" || typeof value === "boolean"
            ? value
            : null,
      ]),
  );
}

export function trackBlundrAnalyticsEvent(
  name: BlundrAnalyticsEventName,
  payload: BlundrAnalyticsPayload = {},
): void {
  // Product outcomes such as rewards, learning events, and imports are emitted
  // by their trusted server boundary. Optional funnel telemetry is consent-gated
  // and never grants product authority.
  if (!PUBLIC_TELEMETRY_EVENTS.has(name)) return;
  if (typeof window === "undefined") return;
  const optionalAllowed =
    window.localStorage.getItem(
      BLUNDR_OPTIONAL_ANALYTICS_CONSENT_STORAGE_KEY,
    ) === "true";
  if (!optionalAllowed && !OPERATIONAL_TELEMETRY_EVENTS.has(name)) return;
  const body = JSON.stringify({ name, payload: safePayload(payload) });
  if (
    navigator.sendBeacon?.(
      TELEMETRY_PATH,
      new Blob([body], { type: "application/json" }),
    )
  )
    return;
  void fetch(TELEMETRY_PATH, {
    method: "POST",
    body,
    headers: { "content-type": "application/json" },
    keepalive: true,
  }).catch(() => undefined);
}
