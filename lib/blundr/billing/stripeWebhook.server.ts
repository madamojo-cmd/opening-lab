import type Stripe from "stripe";

import {
  LOCKED_STRIPE_PRO_ANNUAL_PRICE_ID,
  LOCKED_STRIPE_PRO_MONTHLY_PRICE_ID,
  STRIPE_APP_USER_ID_METADATA_KEY,
  type BillingEnvironment,
} from "./billingConfig";
import {
  createSupabaseBillingRepository,
  type BillingRepository,
} from "./billingRepository.server";
import type { BillingPlan } from "./billingConfig";

function isoFromSeconds(value: unknown): string | null {
  return typeof value === "number" && value > 0
    ? new Date(value * 1000).toISOString()
    : null;
}

function eventIso(event: Pick<Stripe.Event, "created">): string {
  return new Date(event.created * 1000).toISOString();
}

function planInterval(priceId: string | null): BillingPlan | null {
  if (priceId === LOCKED_STRIPE_PRO_MONTHLY_PRICE_ID) return "monthly";
  if (priceId === LOCKED_STRIPE_PRO_ANNUAL_PRICE_ID) return "annual";
  return null;
}

function metadataUserId(value: unknown): string | null {
  const metadata = value as { metadata?: Record<string, string> } | null;
  return metadata?.metadata?.[STRIPE_APP_USER_ID_METADATA_KEY] ?? null;
}

export async function processStripeBillingEvent(input: {
  event: Stripe.Event;
  environment: BillingEnvironment;
  repository?: BillingRepository;
}): Promise<{ ok: true; duplicate: boolean } | { ok: false; retryable: boolean; error: string }> {
  const repository = input.repository ?? createSupabaseBillingRepository();
  const ledger = await repository.beginProviderEvent({
    provider: "stripe",
    environment: input.environment,
    eventId: input.event.id,
    eventType: input.event.type,
    eventOccurredAt: eventIso(input.event),
    facts: { type: input.event.type },
  });
  if (ledger === "duplicate") return { ok: true, duplicate: true };
  try {
    const object = input.event.data.object as unknown as Record<string, unknown>;
    if (input.event.type.startsWith("customer.subscription.")) {
      const userId = metadataUserId(object);
      const subscriptionId = String(object.id ?? "");
      const customerId = String(object.customer ?? "");
      const priceId =
        ((object.items as { data?: Array<{ price?: { id?: string; product?: string } }> })
          ?.data?.[0]?.price?.id as string | undefined) ?? null;
      if (!userId || !subscriptionId || !customerId) {
        throw new Error("stripe_subscription_identity_missing");
      }
      const trialEnd = isoFromSeconds(object.trial_end);
      await repository.upsertSubscription({
        userId,
        environment: input.environment,
        provider: "stripe",
        providerCustomerId: customerId,
        providerSubscriptionId: subscriptionId,
        providerProductId:
          ((object.items as { data?: Array<{ price?: { product?: string } }> })
            ?.data?.[0]?.price?.product as string | undefined) ?? null,
        providerPriceId: priceId,
        planInterval: planInterval(priceId),
        status: String(object.status ?? "unknown"),
        trialStartAt: isoFromSeconds(object.trial_start),
        trialEndAt: trialEnd,
        currentPeriodEndAt: isoFromSeconds(object.current_period_end),
        cancelAtPeriodEnd: object.cancel_at_period_end === true,
        expiresAt: isoFromSeconds(object.ended_at) ?? isoFromSeconds(object.current_period_end) ?? trialEnd,
        lastProviderEventAt: eventIso(input.event),
      });
      if (trialEnd) {
        await repository.markTrialConsumed({
          userId,
          environment: input.environment,
          provider: "stripe",
          providerSubscriptionId: subscriptionId,
        });
      }
    }
    await repository.markProviderEvent({
      provider: "stripe",
      environment: input.environment,
      eventId: input.event.id,
      status: "processed",
    });
    return { ok: true, duplicate: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "stripe_event_failed";
    await repository.markProviderEvent({
      provider: "stripe",
      environment: input.environment,
      eventId: input.event.id,
      status: "retryable_error",
      errorCode: message,
    });
    return { ok: false, retryable: true, error: message };
  }
}
