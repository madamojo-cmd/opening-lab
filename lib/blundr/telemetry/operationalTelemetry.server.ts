// server-only: do not import into client components.

export type BlundrOperationalEventName =
  | "daily_composed"
  | "import_enqueued"
  | "import_failed"
  | "import_fetched"
  | "import_leased"
  | "learning_event_accepted"
  | "learning_event_rejected"
  | "maia_request_completed"
  | "maia_request_failed"
  | "mastery_projected"
  | "minigame_instance_created"
  | "reward_completion_applied"
  | "reward_completion_rejected";

type SafeValue = string | number | boolean | null;

function safePayload(
  payload: Record<string, unknown>,
): Record<string, SafeValue> {
  return Object.fromEntries(
    Object.entries(payload)
      .filter(([key]) => /^[a-zA-Z][a-zA-Z0-9_]{0,63}$/.test(key))
      .slice(0, 24)
      .map(([key, value]) => [
        key,
        typeof value === "string"
          ? value.slice(0, 120)
          : typeof value === "number" && Number.isFinite(value)
            ? value
            : typeof value === "boolean"
              ? value
              : null,
      ]),
  );
}

export async function emitBlundrOperationalEvent(
  name: BlundrOperationalEventName,
  payload: Record<string, unknown> = {},
): Promise<void> {
  const event = {
    name,
    payload: safePayload(payload),
    receivedAt: new Date().toISOString(),
  };
  const endpoint = String(process.env.BLUNDR_TELEMETRY_ENDPOINT ?? "").trim();
  if (!endpoint) {
    console.info("[blundr.operational]", JSON.stringify(event));
    return;
  }
  await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(process.env.BLUNDR_TELEMETRY_TOKEN
        ? { authorization: `Bearer ${process.env.BLUNDR_TELEMETRY_TOKEN}` }
        : {}),
    },
    body: JSON.stringify(event),
    signal: AbortSignal.timeout(1500),
  }).catch(() => undefined);
}
