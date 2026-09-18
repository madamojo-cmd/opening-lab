import "server-only";

import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";

type AdminClient = NonNullable<
  ReturnType<typeof createBlundrSupabaseAdminClient>
>;

type ExportSection = {
  table: string;
  records: unknown[];
};

type StripeCancellationClient = {
  subscriptions: {
    cancel: (subscriptionId: string) => Promise<unknown>;
  };
};

type SupabaseAuthAdminClient = AdminClient & {
  auth: {
    admin: {
      deleteUser: (userId: string) => Promise<{ error: unknown }>;
    };
  };
};

const EXPORT_TABLES = [
  "blundr_user_profiles",
  "blundr_user_repertoires",
  "blundr_daily_retention_progress",
  "blundr_opening_unlock_progress",
  "blundr_opening_unlock_events",
  "blundr_streak_records",
  "blundr_reward_history",
  "blundr_reward_rolls",
  "blundr_repertoire_point_events",
  "blundr_repertoire_unlock_events",
  "blundr_review_states",
  "blundr_learning_events",
  "blundr_node_mastery",
  "blundr_weakness_projection",
  "blundr_provider_accounts",
  "blundr_game_import_jobs",
  "blundr_external_games",
  "blundr_learning_findings",
  "blundr_daily_decks",
  "blundr_daily_sessions",
  "blundr_daily_attempts",
  "blundr_daily_priorities",
  "blundr_minigame_instances",
  "blundr_completion_grants",
  "blundr_xp_events",
  "blundr_reward_transactions_v2",
  "blundr_reward_grants_v2",
  "blundr_reward_inventory_v2",
  "blundr_reward_inventory_events_v2",
  "blundr_reward_presentations_v2",
  "blundr_trainer_sessions_v2",
  "blundr_trainer_actions_v2",
  "blundr_continuation_completions_v1",
  "blundr_continuation_checkmates_v1",
  "blundr_daily_task_evidence_v3",
  "blundr_billing_customers",
  "blundr_billing_subscriptions",
  "blundr_billing_trial_eligibility",
  "blundr_paid_offer_acceptances",
  "blundr_free_active_opening_selections",
  "blundr_trusted_entitlements",
  "blundr_user_legal_acceptances",
  "blundr_user_privacy_preferences",
] as const;

const ACTIVE_PROVIDER_STATUSES = new Set([
  "trialing",
  "active",
  "past_due",
  "unpaid",
]);

function requireAdmin(): AdminClient {
  const admin = createBlundrSupabaseAdminClient();
  if (!admin) throw new Error("account_data_rights_unavailable");
  return admin;
}

async function readTableRecords(
  admin: AdminClient,
  table: string,
  userId: string,
): Promise<ExportSection> {
  const result = await admin.from(table).select("*").eq("user_id", userId);
  if (result.error) throw new Error(`account_export_table_failed:${table}`);
  return { table, records: result.data ?? [] };
}

export async function buildAccountDataExport(input: {
  userId: string;
  email: string | null;
}): Promise<{
  exportedAt: string;
  account: { userId: string; email: string | null };
  sections: ExportSection[];
}> {
  const admin = requireAdmin();
  const sections = await Promise.all(
    EXPORT_TABLES.map((table) => readTableRecords(admin, table, input.userId)),
  );
  return {
    exportedAt: new Date().toISOString(),
    account: { userId: input.userId, email: input.email },
    sections,
  };
}

export async function deleteAuthenticatedAccount(input: {
  userId: string;
  confirmation: unknown;
  stripe?: StripeCancellationClient | null;
}): Promise<{ canceledSubscriptions: number }> {
  if (input.confirmation !== "DELETE MY ACCOUNT") {
    throw new Error("account_deletion_confirmation_required");
  }
  const admin = requireAdmin();
  const subscriptions = await admin
    .from("blundr_billing_subscriptions")
    .select("provider,provider_subscription_id,status")
    .eq("user_id", input.userId);
  if (subscriptions.error) throw new Error("account_billing_lookup_failed");

  const activeSubscriptions = (subscriptions.data ?? []).filter((row) => {
    const record = row as Record<string, unknown>;
    return (
      record.provider === "stripe" &&
      typeof record.provider_subscription_id === "string" &&
      ACTIVE_PROVIDER_STATUSES.has(String(record.status ?? ""))
    );
  });

  if (activeSubscriptions.length > 0 && !input.stripe) {
    throw new Error("account_deletion_billing_cleanup_unavailable");
  }

  let canceledSubscriptions = 0;
  for (const row of activeSubscriptions) {
    const subscriptionId = String(
      (row as Record<string, unknown>).provider_subscription_id,
    );
    await input.stripe!.subscriptions.cancel(subscriptionId);
    canceledSubscriptions += 1;
  }

  const audit = await admin.from("blundr_account_deletion_audit").insert({
    user_id: input.userId,
    deletion_status: "provider_cleanup_complete",
    provider_cleanup: {
      stripeSubscriptionsCanceled: canceledSubscriptions,
    },
  });
  if (audit.error) throw new Error("account_deletion_audit_failed");

  const deleted = await (
    admin as SupabaseAuthAdminClient
  ).auth.admin.deleteUser(input.userId);
  if (deleted.error) throw new Error("account_identity_deletion_failed");
  return { canceledSubscriptions };
}
