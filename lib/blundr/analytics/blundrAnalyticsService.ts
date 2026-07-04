import type { BlundrAnalyticsEventName } from "./blundrAnalyticsEvents";

export type BlundrAnalyticsPayload = Record<string, unknown>;

export function trackBlundrAnalyticsEvent(_name: BlundrAnalyticsEventName, _payload: BlundrAnalyticsPayload = {}): void {
  // No-op by default. The app can safely call this in development and production
  // without depending on a third-party analytics SDK.
}

