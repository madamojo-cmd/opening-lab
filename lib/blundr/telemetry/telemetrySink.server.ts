// server-only: do not import into client components.

type SafeValue = string | number | boolean | null;

export type BlundrTelemetryDeliveryState =
  | "ready"
  | "degraded"
  | "console_only";

export type BlundrTelemetryDeliveryResult = {
  delivered: boolean;
  configured: boolean;
  delivery: BlundrTelemetryDeliveryState;
  errorCode?: BlundrTelemetryErrorCode;
};

export type BlundrTelemetryHealth = {
  ready: boolean;
  optional: boolean;
  configured: boolean;
  delivery: BlundrTelemetryDeliveryState;
  errorCode?: BlundrTelemetryErrorCode;
};

export type BlundrTelemetryErrorCode =
  | "not_configured"
  | "invalid_endpoint"
  | "network_timeout"
  | "network_error"
  | "sink_rejected"
  | "sink_server_error";

export type BlundrTelemetryEvent = {
  name: string;
  payload: Record<string, SafeValue>;
  receivedAt?: string;
};

const DEFAULT_TIMEOUT_MS = 1500;
const BLUNDR_EMPTY_VALUES = new Set(["", '""', "''"]);
const SENSITIVE_PAYLOAD_KEY =
  /(?:token|secret|password|authorization|cookie|key)/i;

function normalizeEnvText(value: string | undefined): string {
  const normalized = String(value ?? "").trim();
  return BLUNDR_EMPTY_VALUES.has(normalized) ? "" : normalized;
}

function telemetryEndpoint(): string {
  return normalizeEnvText(process.env.BLUNDR_TELEMETRY_ENDPOINT);
}

function telemetryToken(): string {
  return normalizeEnvText(process.env.BLUNDR_TELEMETRY_TOKEN);
}

function classifySinkStatus(status: number): BlundrTelemetryErrorCode {
  if (status >= 500) return "sink_server_error";
  return "sink_rejected";
}

export function sanitizeBlundrTelemetryPayload(
  payload: Record<string, unknown>,
  options: { maxEntries: number; maxStringLength: number },
): Record<string, SafeValue> {
  return Object.fromEntries(
    Object.entries(payload)
      .filter(
        ([key]) =>
          /^[a-zA-Z][a-zA-Z0-9_]{0,63}$/.test(key) &&
          !SENSITIVE_PAYLOAD_KEY.test(key),
      )
      .slice(0, options.maxEntries)
      .map(([key, value]) => [
        key,
        typeof value === "string"
          ? value.slice(0, options.maxStringLength)
          : typeof value === "number" && Number.isFinite(value)
            ? value
            : typeof value === "boolean"
              ? value
              : null,
      ]),
  );
}

export async function deliverBlundrTelemetryEvent(
  event: BlundrTelemetryEvent,
  options: { timeoutMs?: number } = {},
): Promise<BlundrTelemetryDeliveryResult> {
  const endpoint = telemetryEndpoint();
  if (!endpoint) {
    console.info("[blundr.telemetry]", JSON.stringify(event));
    return { delivered: true, configured: false, delivery: "console_only" };
  }

  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    console.warn(
      "[blundr.telemetry] sink unavailable",
      JSON.stringify({ name: event.name, errorCode: "invalid_endpoint" }),
    );
    return {
      delivered: false,
      configured: true,
      delivery: "degraded",
      errorCode: "invalid_endpoint",
    };
  }

  const token = telemetryToken();
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        name: event.name,
        payload: event.payload,
        receivedAt: event.receivedAt ?? new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
    });
    if (!response.ok) {
      const errorCode = classifySinkStatus(response.status);
      console.warn(
        "[blundr.telemetry] sink unavailable",
        JSON.stringify({
          name: event.name,
          errorCode,
          status: response.status,
        }),
      );
      return {
        delivered: false,
        configured: true,
        delivery: "degraded",
        errorCode,
      };
    }
    return { delivered: true, configured: true, delivery: "ready" };
  } catch (error) {
    const errorCode =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError")
        ? "network_timeout"
        : "network_error";
    console.warn(
      "[blundr.telemetry] sink unavailable",
      JSON.stringify({ name: event.name, errorCode }),
    );
    return {
      delivered: false,
      configured: true,
      delivery: "degraded",
      errorCode,
    };
  }
}

export async function probeBlundrTelemetrySink(
  options: { timeoutMs?: number } = {},
): Promise<BlundrTelemetryHealth> {
  const result = await deliverBlundrTelemetryEvent(
    {
      name: "BLUNDR_TELEMETRY_HEALTH_PROBE",
      payload: {
        source: "health",
        pathClass: "staging",
      },
    },
    options,
  );
  return {
    ready: result.configured && result.delivered,
    optional: true,
    configured: result.configured,
    delivery: result.delivery,
    ...(result.errorCode ? { errorCode: result.errorCode } : {}),
  };
}
