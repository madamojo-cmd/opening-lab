import { randomUUID } from "node:crypto";

import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";

import type { BillingEnvironment, BillingPlan } from "./billingConfig";

type AdminClient = NonNullable<ReturnType<typeof createBlundrSupabaseAdminClient>>;

type AuthAdminClient = {
  auth: {
    admin: {
      getUserById: (userId: string) => Promise<{
        data: { user: { id: string } | null };
        error: unknown;
      }>;
    };
  };
};

export type BillingCustomerMapping = {
  userId: string;
  environment: BillingEnvironment;
  stripeCustomerId: string | null;
  revenueCatAppUserId: string;
};

export type TrialReservation = {
  eligible: boolean;
  reservationId: string | null;
  reservationExpiresAt: string | null;
};

export type ProviderEventInput = {
  provider: "stripe" | "revenuecat";
  environment: BillingEnvironment | "sandbox" | "production";
  eventId: string;
  eventType: string;
  eventOccurredAt: string | null;
  facts: Record<string, unknown>;
};

export type SubscriptionFactInput = {
  userId: string;
  environment: BillingEnvironment | "sandbox" | "production";
  provider: "stripe" | "revenuecat";
  providerCustomerId: string;
  providerSubscriptionId: string;
  providerProductId: string | null;
  providerPriceId: string | null;
  planInterval: BillingPlan | null;
  status: string;
  trialStartAt: string | null;
  trialEndAt: string | null;
  currentPeriodEndAt: string | null;
  cancelAtPeriodEnd: boolean;
  expiresAt: string | null;
  lastProviderEventAt: string | null;
};

export type EntitlementFactInput = {
  userId: string;
  environment: BillingEnvironment | "sandbox" | "production";
  active: boolean;
  expiresAt: string | null;
  lastVerifiedAt: string;
  lastProviderEventAt: string | null;
  providerSubscriptionId: string | null;
  metadata?: Record<string, unknown>;
};

export type BillingRepository = {
  getOrCreateCustomerMapping(input: {
    userId: string;
    email: string | null;
    environment: BillingEnvironment;
    createStripeCustomer: (idempotencyKey: string) => Promise<string>;
  }): Promise<BillingCustomerMapping>;
  reserveTrial(input: {
    userId: string;
    environment: BillingEnvironment;
  }): Promise<TrialReservation>;
  recordCheckoutTrialSession(input: {
    userId: string;
    environment: BillingEnvironment;
    reservationId: string;
    checkoutSessionId: string;
  }): Promise<void>;
  beginProviderEvent(input: ProviderEventInput): Promise<"inserted" | "duplicate">;
  markProviderEvent(input: {
    provider: "stripe" | "revenuecat";
    environment: BillingEnvironment | "sandbox" | "production";
    eventId: string;
    status: "processed" | "ignored" | "retryable_error" | "permanent_error";
    errorCode?: string | null;
  }): Promise<void>;
  upsertSubscription(input: SubscriptionFactInput): Promise<void>;
  upsertTrustedEntitlement(input: EntitlementFactInput): Promise<void>;
  markTrialConsumed(input: {
    userId: string;
    environment: BillingEnvironment;
    provider: "stripe" | "revenuecat";
    providerSubscriptionId: string;
  }): Promise<void>;
  getStripeCustomerId(input: {
    userId: string;
    environment: BillingEnvironment;
  }): Promise<string | null>;
  userExists(userId: string): Promise<boolean>;
};

function rowToMapping(row: {
  user_id: string;
  billing_environment: BillingEnvironment;
  stripe_customer_id: string | null;
  revenuecat_app_user_id: string;
}): BillingCustomerMapping {
  return {
    userId: row.user_id,
    environment: row.billing_environment,
    stripeCustomerId: row.stripe_customer_id,
    revenueCatAppUserId: row.revenuecat_app_user_id,
  };
}

function requireAdmin(): AdminClient {
  const admin = createBlundrSupabaseAdminClient();
  if (!admin) throw new Error("billing_persistence_unavailable");
  return admin;
}

function incomingIsOlder(
  current: string | null | undefined,
  incoming: string | null,
): boolean {
  return Boolean(current && incoming && current > incoming);
}

export function createSupabaseBillingRepository(): BillingRepository {
  return {
    async getOrCreateCustomerMapping(input) {
      const admin = requireAdmin();
      const existing = await admin
        .from("blundr_billing_customers")
        .select("*")
        .eq("user_id", input.userId)
        .eq("billing_environment", input.environment)
        .maybeSingle();
      if (existing.error) throw new Error("billing_customer_lookup_failed");
      if (existing.data?.stripe_customer_id) return rowToMapping(existing.data);

      const inserted = await admin
        .from("blundr_billing_customers")
        .upsert(
          {
            user_id: input.userId,
            billing_environment: input.environment,
            revenuecat_app_user_id: input.userId,
          },
          { onConflict: "user_id,billing_environment", ignoreDuplicates: true },
        )
        .select("*")
        .maybeSingle();
      if (inserted.error) throw new Error("billing_customer_reserve_failed");

      const stripeCustomerId = await input.createStripeCustomer(
        `billing-customer:${input.environment}:${input.userId}`,
      );
      const updated = await admin
        .from("blundr_billing_customers")
        .update({
          stripe_customer_id: stripeCustomerId,
          provider_created_at: new Date().toISOString(),
          provider_updated_at: new Date().toISOString(),
        })
        .eq("user_id", input.userId)
        .eq("billing_environment", input.environment)
        .is("stripe_customer_id", null)
        .select("*")
        .maybeSingle();
      if (updated.error) throw new Error("billing_customer_update_failed");
      if (updated.data) return rowToMapping(updated.data);

      const reread = await admin
        .from("blundr_billing_customers")
        .select("*")
        .eq("user_id", input.userId)
        .eq("billing_environment", input.environment)
        .maybeSingle();
      if (reread.error || !reread.data?.stripe_customer_id) {
        throw new Error("billing_customer_reread_failed");
      }
      return rowToMapping(reread.data);
    },
    async reserveTrial(input) {
      const admin = requireAdmin();
      const result = await admin.rpc("blundr_reserve_pro_trial_v1", {
        p_user_id: input.userId,
        p_billing_environment: input.environment,
        p_reservation_minutes: 1440,
      });
      if (result.error) throw new Error("trial_reservation_failed");
      const data = (result.data ?? {}) as Record<string, unknown>;
      return {
        eligible: data.eligible === true,
        reservationId:
          typeof data.reservationId === "string" ? data.reservationId : null,
        reservationExpiresAt:
          typeof data.reservationExpiresAt === "string"
            ? data.reservationExpiresAt
            : null,
      };
    },
    async recordCheckoutTrialSession(input) {
      const admin = requireAdmin();
      const result = await admin.rpc("blundr_record_checkout_trial_session_v1", {
        p_user_id: input.userId,
        p_billing_environment: input.environment,
        p_reservation_id: input.reservationId,
        p_checkout_session_id: input.checkoutSessionId,
      });
      if (result.error) throw new Error("trial_checkout_record_failed");
    },
    async beginProviderEvent(input) {
      const admin = requireAdmin();
      const inserted = await admin
        .from("blundr_billing_provider_events")
        .insert({
          provider: input.provider,
          provider_event_id: input.eventId,
          event_type: input.eventType,
          billing_environment: input.environment,
          event_occurred_at: input.eventOccurredAt,
          normalized_facts: input.facts,
        })
        .select("id")
        .maybeSingle();
      if (!inserted.error) return "inserted";
      if (String(inserted.error.code) === "23505") return "duplicate";
      throw new Error("billing_event_ledger_failed");
    },
    async markProviderEvent(input) {
      const admin = requireAdmin();
      const result = await admin
        .from("blundr_billing_provider_events")
        .update({
          processing_status: input.status,
          error_code: input.errorCode ?? null,
          processed_at: new Date().toISOString(),
        })
        .eq("provider", input.provider)
        .eq("billing_environment", input.environment)
        .eq("provider_event_id", input.eventId);
      if (result.error) throw new Error("billing_event_status_failed");
    },
    async upsertSubscription(input) {
      const admin = requireAdmin();
      const current = await admin
        .from("blundr_billing_subscriptions")
        .select("last_provider_event_at")
        .eq("provider", input.provider)
        .eq("billing_environment", input.environment)
        .eq("provider_subscription_id", input.providerSubscriptionId)
        .maybeSingle();
      if (current.error) throw new Error("billing_subscription_lookup_failed");
      if (
        incomingIsOlder(
          current.data?.last_provider_event_at as string | null | undefined,
          input.lastProviderEventAt,
        )
      ) {
        return;
      }
      const result = await admin.from("blundr_billing_subscriptions").upsert(
        {
          user_id: input.userId,
          billing_environment: input.environment,
          provider: input.provider,
          provider_customer_id: input.providerCustomerId,
          provider_subscription_id: input.providerSubscriptionId,
          provider_product_id: input.providerProductId,
          provider_price_id: input.providerPriceId,
          plan_interval: input.planInterval,
          status: input.status,
          trial_start_at: input.trialStartAt,
          trial_end_at: input.trialEndAt,
          current_period_end_at: input.currentPeriodEndAt,
          cancel_at_period_end: input.cancelAtPeriodEnd,
          expires_at: input.expiresAt,
          last_provider_event_at: input.lastProviderEventAt,
          last_reconciled_at: new Date().toISOString(),
        },
        { onConflict: "provider,billing_environment,provider_subscription_id" },
      );
      if (result.error) throw new Error("billing_subscription_upsert_failed");
    },
    async upsertTrustedEntitlement(input) {
      const admin = requireAdmin();
      const current = await admin
        .from("blundr_trusted_entitlements")
        .select("last_provider_event_at")
        .eq("user_id", input.userId)
        .eq("billing_environment", input.environment)
        .eq("entitlement_identifier", "pro")
        .maybeSingle();
      if (current.error) throw new Error("trusted_entitlement_lookup_failed");
      if (
        incomingIsOlder(
          current.data?.last_provider_event_at as string | null | undefined,
          input.lastProviderEventAt,
        )
      ) {
        return;
      }
      const result = await admin.from("blundr_trusted_entitlements").upsert(
        {
          user_id: input.userId,
          billing_environment: input.environment,
          entitlement_identifier: "pro",
          active: input.active,
          source_provider: "revenuecat",
          expires_at: input.expiresAt,
          last_verified_at: input.lastVerifiedAt,
          last_provider_event_at: input.lastProviderEventAt,
          provider_subscription_id: input.providerSubscriptionId,
          metadata: input.metadata ?? {},
        },
        { onConflict: "user_id,billing_environment,entitlement_identifier" },
      );
      if (result.error) throw new Error("trusted_entitlement_upsert_failed");
    },
    async markTrialConsumed(input) {
      const admin = requireAdmin();
      const result = await admin.rpc("blundr_mark_pro_trial_consumed_v1", {
        p_user_id: input.userId,
        p_billing_environment: input.environment,
        p_provider: input.provider,
        p_provider_subscription_id: input.providerSubscriptionId,
      });
      if (result.error) throw new Error("trial_consumption_failed");
    },
    async getStripeCustomerId(input) {
      const admin = requireAdmin();
      const result = await admin
        .from("blundr_billing_customers")
        .select("stripe_customer_id")
        .eq("user_id", input.userId)
        .eq("billing_environment", input.environment)
        .maybeSingle();
      if (result.error) throw new Error("billing_customer_lookup_failed");
      return result.data?.stripe_customer_id ?? null;
    },
    async userExists(userId) {
      const admin = requireAdmin() as unknown as AuthAdminClient;
      const result = await admin.auth.admin.getUserById(userId);
      return !result.error && result.data.user?.id === userId;
    },
  };
}

export function createInMemoryBillingRepository(options?: {
  knownUsers?: Iterable<string>;
}): BillingRepository & {
  customers: Map<string, BillingCustomerMapping>;
  events: Set<string>;
  entitlements: EntitlementFactInput[];
  subscriptions: SubscriptionFactInput[];
  consumedTrials: Set<string>;
  knownUsers: Set<string> | null;
} {
  const customers = new Map<string, BillingCustomerMapping>();
  const events = new Set<string>();
  const entitlements: EntitlementFactInput[] = [];
  const subscriptions: SubscriptionFactInput[] = [];
  const consumedTrials = new Set<string>();
  const reservations = new Map<string, TrialReservation>();
  const knownUsers = options?.knownUsers ? new Set(options.knownUsers) : null;
  return {
    customers,
    events,
    entitlements,
    subscriptions,
    consumedTrials,
    knownUsers,
    async getOrCreateCustomerMapping(input) {
      const key = `${input.environment}:${input.userId}`;
      const existing = customers.get(key);
      if (existing) return existing;
      const stripeCustomerId = await input.createStripeCustomer(
        `billing-customer:${input.environment}:${input.userId}`,
      );
      const mapping = {
        userId: input.userId,
        environment: input.environment,
        stripeCustomerId,
        revenueCatAppUserId: input.userId,
      };
      customers.set(key, mapping);
      return mapping;
    },
    async reserveTrial(input) {
      const key = `${input.environment}:${input.userId}`;
      if (consumedTrials.has(key)) {
        return { eligible: false, reservationId: null, reservationExpiresAt: null };
      }
      const existing = reservations.get(key);
      if (existing) return existing;
      const reservation = {
        eligible: true,
        reservationId: randomUUID(),
        reservationExpiresAt: new Date(Date.now() + 24 * 60 * 60_000).toISOString(),
      };
      reservations.set(key, reservation);
      return reservation;
    },
    async recordCheckoutTrialSession() {},
    async beginProviderEvent(input) {
      const key = `${input.provider}:${input.environment}:${input.eventId}`;
      if (events.has(key)) return "duplicate";
      events.add(key);
      return "inserted";
    },
    async markProviderEvent() {},
    async upsertSubscription(input) {
      const existing = subscriptions.findIndex(
        (item) =>
          item.provider === input.provider &&
          item.environment === input.environment &&
          item.providerSubscriptionId === input.providerSubscriptionId,
      );
      if (existing >= 0) {
        const current = subscriptions[existing]!;
        if (
          current.lastProviderEventAt &&
          input.lastProviderEventAt &&
          current.lastProviderEventAt > input.lastProviderEventAt
        ) {
          return;
        }
        subscriptions[existing] = input;
      } else {
        subscriptions.push(input);
      }
    },
    async upsertTrustedEntitlement(input) {
      const existing = entitlements.findIndex(
        (item) =>
          item.userId === input.userId &&
          item.environment === input.environment,
      );
      if (existing >= 0) {
        const current = entitlements[existing]!;
        if (
          current.lastProviderEventAt &&
          input.lastProviderEventAt &&
          current.lastProviderEventAt > input.lastProviderEventAt
        ) {
          return;
        }
        entitlements[existing] = input;
      } else {
        entitlements.push(input);
      }
    },
    async markTrialConsumed(input) {
      consumedTrials.add(`${input.environment}:${input.userId}`);
      reservations.delete(`${input.environment}:${input.userId}`);
    },
    async getStripeCustomerId(input) {
      return customers.get(`${input.environment}:${input.userId}`)?.stripeCustomerId ?? null;
    },
    async userExists(userId) {
      return knownUsers ? knownUsers.has(userId) : true;
    },
  };
}
