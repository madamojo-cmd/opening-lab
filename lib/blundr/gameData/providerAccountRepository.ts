import "server-only";
import type { ProviderKind } from "@/lib/blundr/contracts";
import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";
import type { ProviderAccountRecord } from "./gameDataTypes";
import { normalizeProviderUsername } from "./gameFingerprint";

const memory = new Map<string, ProviderAccountRecord>();

export class ProviderAccountRepository {
  async get(
    userId: string,
    provider: ProviderKind,
  ): Promise<ProviderAccountRecord | null> {
    const client = createBlundrSupabaseAdminClient();
    if (!client) return memory.get(`${userId}:${provider}`) ?? null;
    const result = await client
      .from("blundr_provider_accounts")
      .select("*")
      .eq("user_id", userId)
      .eq("provider", provider)
      .maybeSingle();
    return result.data ? mapAccount(result.data) : null;
  }

  async upsert(
    input: Omit<ProviderAccountRecord, "createdAt" | "updatedAt">,
  ): Promise<ProviderAccountRecord> {
    const now = new Date().toISOString();
    const value: ProviderAccountRecord = {
      ...input,
      username: normalizeProviderUsername(input.username),
      createdAt: now,
      updatedAt: now,
    };
    const client = createBlundrSupabaseAdminClient();
    if (!client) {
      memory.set(`${input.userId}:${input.provider}`, value);
      return value;
    }
    const result = await client
      .from("blundr_provider_accounts")
      .upsert(toRow(value), { onConflict: "user_id,provider" })
      .select("*")
      .single();
    if (result.error || !result.data)
      throw new Error("provider_account_persistence_failed");
    return mapAccount(result.data);
  }

  async disconnect(
    userId: string,
    provider: ProviderKind,
    deleteSource = false,
  ): Promise<void> {
    const client = createBlundrSupabaseAdminClient();
    if (!client) {
      memory.delete(`${userId}:${provider}`);
      return;
    }
    if (deleteSource) {
      await client
        .from("blundr_provider_accounts")
        .delete()
        .eq("user_id", userId)
        .eq("provider", provider);
    } else {
      await client
        .from("blundr_provider_accounts")
        .update({
          verification_state: "pending",
          sanitized_error_code: "unknown",
        })
        .eq("user_id", userId)
        .eq("provider", provider);
    }
  }
}

function mapAccount(row: Record<string, unknown>): ProviderAccountRecord {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    provider: row.provider as ProviderKind,
    username: String(row.username),
    externalPlayerId: row.external_player_id
      ? String(row.external_player_id)
      : null,
    verificationState:
      row.verification_state as ProviderAccountRecord["verificationState"],
    connectedAt: String(row.connected_at),
    lastSuccessfulSyncAt: row.last_successful_sync_at
      ? String(row.last_successful_sync_at)
      : null,
    nextEligibleSyncAt: row.next_eligible_sync_at
      ? String(row.next_eligible_sync_at)
      : null,
    sanitizedErrorCode:
      row.sanitized_error_code as ProviderAccountRecord["sanitizedErrorCode"],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function toRow(value: ProviderAccountRecord) {
  return {
    id: value.id,
    user_id: value.userId,
    provider: value.provider,
    username: value.username,
    external_player_id: value.externalPlayerId,
    verification_state: value.verificationState,
    connected_at: value.connectedAt,
    last_successful_sync_at: value.lastSuccessfulSyncAt,
    next_eligible_sync_at: value.nextEligibleSyncAt,
    sanitized_error_code: value.sanitizedErrorCode,
    updated_at: value.updatedAt,
  };
}
