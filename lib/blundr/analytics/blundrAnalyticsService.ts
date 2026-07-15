import type { BlundrAnalyticsEventName } from "./blundrAnalyticsEvents";

export type BlundrAnalyticsPayload = Record<string, unknown>;

const TELEMETRY_PATH = "/api/blundr/telemetry";

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
  const body = JSON.stringify({ name, payload: safePayload(payload) });
  if (typeof window === "undefined") return;
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
