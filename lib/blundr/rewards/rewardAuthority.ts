import "server-only";

import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";

export const REWARD_POLICY_VERSION = "rewards-v2-20260805";

export type RewardAuthorityFailure = { ok: false; code: string };
export type RewardAuthoritySuccess<T> = { ok: true; data: T };

function failure(error: unknown): RewardAuthorityFailure {
  const message = String(
    (error as { message?: unknown } | null)?.message ??
      "reward_persistence_unavailable",
  );
  const stable = [
    "completion_evidence_unverified",
    "completion_time_zone_unavailable",
    "account_not_ready",
    "insufficient_inventory",
    "opening_not_locked",
    "inventory_idempotency_conflict",
    "reward_idempotency_conflict",
    "reward_presentation_lease_not_owned",
    "continuation_trainer_terminal_unverified",
    "continuation_completion_idempotency_conflict",
    "completion_projection_idempotency_conflict",
    "invalid_daily_blundr_reward_target",
    "completion_evidence_unverified",
  ];
  return {
    ok: false,
    code: stable.includes(message) ? message : "reward_persistence_unavailable",
  };
}

function adminOrFailure() {
  const admin = createBlundrSupabaseAdminClient();
  return admin
    ? { ok: true as const, admin }
    : { ok: false as const, code: "reward_persistence_unavailable" };
}

export async function applyRewardCompletion(input: {
  userId: string;
  source: string;
  evidenceId: string;
}): Promise<
  RewardAuthoritySuccess<Record<string, unknown>> | RewardAuthorityFailure
> {
  const client = adminOrFailure();
  if (!client.ok) return { ok: false, code: client.code };
  if (input.source === "daily_blundr_deck_completed") {
    const prepared = await client.admin.rpc(
      "blundr_prepare_daily_blundr_reward_target_v1",
      {
        p_user_id: input.userId,
        p_session_id: input.evidenceId,
      },
    );
    if (prepared.error) {
      const message = String(prepared.error.message ?? "");
      const missingDuringDeploy =
        message.includes("blundr_prepare_daily_blundr_reward_target_v1") ||
        message.includes("Could not find the function");
      if (!missingDuringDeploy) return failure(prepared.error);
    }
  }
  const { data, error } = await client.admin.rpc(
    "blundr_apply_completion_reward_v3",
    {
      p_user_id: input.userId,
      // Required by the additive PR-01 shell, but not authoritative. The SQL
      // writer derives its completion identity from verified evidence.
      p_completion_id: `untrusted:${input.source}:${input.evidenceId}`,
      p_source: input.source,
      p_evidence_id: input.evidenceId,
      p_idempotency_key: `untrusted:${input.source}:${input.evidenceId}`,
      p_policy_version: REWARD_POLICY_VERSION,
      p_randomness_key_version:
        process.env.BLUNDR_REWARDS_HMAC_KEY_VERSION?.trim() || null,
    },
  );
  return error || !data
    ? failure(error)
    : { ok: true, data: data as Record<string, unknown> };
}

export async function spendInventoryAndUnlock(input: {
  userId: string;
  openingId: string;
  inventoryKind: "opening_fragment" | "choice_token";
  idempotencyKey: string;
}): Promise<
  RewardAuthoritySuccess<Record<string, unknown>> | RewardAuthorityFailure
> {
  const client = adminOrFailure();
  if (!client.ok) return { ok: false, code: client.code };
  const { data, error } = await client.admin.rpc(
    "blundr_spend_inventory_and_unlock_v2",
    {
      p_user_id: input.userId,
      p_opening_id: input.openingId,
      p_inventory_kind: input.inventoryKind,
      p_idempotency_key: input.idempotencyKey,
      p_policy_version: REWARD_POLICY_VERSION,
    },
  );
  return error || !data
    ? failure(error)
    : { ok: true, data: data as Record<string, unknown> };
}

export async function claimRewardPresentation(input: {
  userId: string;
  claimedBy: string;
}) {
  const client = adminOrFailure();
  if (!client.ok) return { ok: false, code: client.code };
  const { data, error } = await client.admin.rpc(
    "blundr_claim_reward_presentation_v2",
    {
      p_user_id: input.userId,
      p_claimed_by: input.claimedBy,
      p_lease_seconds: 60,
    },
  );
  if (error) return failure(error);
  const claimed = data as Record<string, unknown> | null;
  if (!claimed?.id) return { ok: true as const, data: claimed };
  const { data: presentation } = await client.admin
    .from("blundr_reward_presentations_v2")
    .select("presentation_kind,presentation_key,priority")
    .eq("id", String(claimed.id))
    .eq("user_id", input.userId)
    .maybeSingle();
  return {
    ok: true as const,
    data: presentation ? { ...claimed, ...presentation } : claimed,
  };
}

export async function markRewardPresentation(input: {
  userId: string;
  presentationId: string;
  claimedBy: string;
  action: "rendered" | "acknowledged" | "dismissed";
}) {
  const client = adminOrFailure();
  if (!client.ok) return { ok: false, code: client.code };
  const { data, error } = await client.admin.rpc(
    "blundr_mark_reward_presentation_v2",
    {
      p_user_id: input.userId,
      p_presentation_id: input.presentationId,
      p_claimed_by: input.claimedBy,
      p_action: input.action,
    },
  );
  return error || !data
    ? failure(error)
    : { ok: true as const, data: data as Record<string, unknown> };
}

export async function reconcileRewardInventory(userId: string) {
  const client = adminOrFailure();
  if (!client.ok) return { ok: false, code: client.code };
  const { data, error } = await client.admin.rpc(
    "blundr_reconcile_reward_inventory_v2",
    { p_user_id: userId },
  );
  return error ? failure(error) : { ok: true as const, data };
}
