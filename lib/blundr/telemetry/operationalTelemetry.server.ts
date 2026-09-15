// server-only: do not import into client components.

import {
  deliverBlundrTelemetryEvent,
  sanitizeBlundrTelemetryPayload,
} from "./telemetrySink.server";

export type BlundrOperationalEventName =
  | "daily_composed"
  | "daily_action_rejected"
  | "import_enqueued"
  | "import_failed"
  | "import_fetched"
  | "import_leased"
  | "continuation_completion_accepted"
  | "continuation_completion_rejected"
  | "learning_event_accepted"
  | "learning_event_rejected"
  | "maia_request_completed"
  | "maia_request_failed"
  | "mastery_projected"
  | "minigame_instance_created"
  | "reward_completion_applied"
  | "reward_completion_rejected"
  | "billing_checkout_started"
  | "billing_checkout_failed"
  | "billing_portal_started"
  | "billing_portal_failed"
  | "account_export_created"
  | "account_export_failed"
  | "account_deletion_completed"
  | "account_deletion_failed"
  | "legal_acceptance_failed"
  | "privacy_preferences_failed";

function safePayload(
  payload: Record<string, unknown>,
): Record<string, string | number | boolean | null> {
  return sanitizeBlundrTelemetryPayload(payload, {
    maxEntries: 24,
    maxStringLength: 120,
  });
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
  await deliverBlundrTelemetryEvent(event);
}
