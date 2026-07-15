import { NextResponse } from "next/server";
import {
  BLUNDR_ANALYTICS_EVENT_NAMES,
  type BlundrAnalyticsEventName,
} from "@/lib/blundr/analytics/blundrAnalyticsEvents";

export const dynamic = "force-dynamic";

function sanitizePayload(
  value: unknown,
): Record<string, string | number | boolean | null> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => /^[a-zA-Z][a-zA-Z0-9_]{0,63}$/.test(key))
      .slice(0, 32)
      .map(([key, raw]) => [
        key,
        typeof raw === "string"
          ? raw.slice(0, 160)
          : typeof raw === "number" && Number.isFinite(raw)
            ? raw
            : typeof raw === "boolean"
              ? raw
              : null,
      ]),
  );
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    name?: unknown;
    payload?: unknown;
  } | null;
  const name = body?.name;
  if (!BLUNDR_ANALYTICS_EVENT_NAMES.includes(name as BlundrAnalyticsEventName))
    return NextResponse.json(
      { error: "invalid_telemetry_event" },
      { status: 400 },
    );
  const event = {
    name,
    payload: sanitizePayload(body?.payload),
    receivedAt: new Date().toISOString(),
  };
  const endpoint = String(process.env.BLUNDR_TELEMETRY_ENDPOINT ?? "").trim();
  if (endpoint) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.BLUNDR_TELEMETRY_TOKEN
          ? { authorization: `Bearer ${process.env.BLUNDR_TELEMETRY_TOKEN}` }
          : {}),
      },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(1500),
    }).catch(() => null);
    if (!response?.ok)
      return NextResponse.json(
        { error: "telemetry_sink_unavailable" },
        { status: 503 },
      );
  } else {
    console.info("[blundr.telemetry]", JSON.stringify(event));
  }
  return NextResponse.json({ accepted: true });
}
