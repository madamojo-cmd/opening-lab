import { NextResponse } from "next/server";
import type { BlundrAnalyticsEventName } from "@/lib/blundr/analytics/blundrAnalyticsEvents";
import {
  deliverBlundrTelemetryEvent,
  sanitizeBlundrTelemetryPayload,
} from "@/lib/blundr/telemetry/telemetrySink.server";

export const dynamic = "force-dynamic";

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
const PUBLIC_PAYLOAD_KEYS = new Set([
  "attempt",
  "cadence",
  "durationMs",
  "eligible",
  "pathClass",
  "plan",
  "reason",
  "source",
]);

function sanitizePayload(
  value: unknown,
): Record<string, string | number | boolean | null> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return sanitizeBlundrTelemetryPayload(
    Object.fromEntries(
      Object.entries(value as Record<string, unknown>).filter(([key]) =>
        PUBLIC_PAYLOAD_KEYS.has(key),
      ),
    ),
    { maxEntries: 32, maxStringLength: 160 },
  );
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    name?: unknown;
    payload?: unknown;
  } | null;
  const name = body?.name;
  if (!PUBLIC_TELEMETRY_EVENTS.has(name as BlundrAnalyticsEventName))
    return NextResponse.json(
      { error: "invalid_telemetry_event" },
      { status: 400 },
    );
  const eventName = name as BlundrAnalyticsEventName;
  const event = {
    name: eventName,
    payload: sanitizePayload(body?.payload),
    receivedAt: new Date().toISOString(),
  };
  const delivery = await deliverBlundrTelemetryEvent(event);
  return NextResponse.json({
    accepted: true,
    delivered: delivery.delivered,
  });
}
