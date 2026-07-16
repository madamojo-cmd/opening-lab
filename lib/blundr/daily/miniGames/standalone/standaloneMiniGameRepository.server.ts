import "server-only";
import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";
import type {
  DailyMiniGameState,
  DailyBlundrMiniGameCard,
} from "../dailyMiniGameTypes";
import type { StandaloneMiniGameServerRecord } from "./standaloneMiniGameTypes";

const localRecords = new Map<string, StandaloneMiniGameServerRecord>();

export class StandaloneMiniGameRepository {
  async create(record: StandaloneMiniGameServerRecord): Promise<void> {
    const client = createBlundrSupabaseAdminClient();
    if (!client) {
      if (process.env.NODE_ENV === "test") {
        localRecords.set(record.instanceId, record);
        return;
      }
      throw new Error("standalone_minigame_persistence_unavailable");
    }
    const result = await client.from("blundr_minigame_instances").insert({
      instance_id: record.instanceId,
      user_id: record.userId,
      mini_game_id:
        (record.card as DailyBlundrMiniGameCard).miniGame?.miniGameId ??
        record.scenario?.miniGameId,
      source: "standalone_review",
      server_card: record.card,
      server_state: record.state,
      first_attempt: record.firstAttempt,
      retry_count: record.retryCount,
      expires_at: record.expiresAt,
      kind: record.kind ?? "legacy",
      server_scenario: record.scenario ?? null,
    });
    if (result.error) throw new Error("standalone_minigame_create_failed");
  }

  async getOwned(
    instanceId: string,
    userId: string,
  ): Promise<StandaloneMiniGameServerRecord | null> {
    const client = createBlundrSupabaseAdminClient();
    if (!client) {
      if (process.env.NODE_ENV !== "test") return null;
      const record = localRecords.get(instanceId);
      return record?.userId === userId ? record : null;
    }
    const result = await client
      .from("blundr_minigame_instances")
      .select("*")
      .eq("instance_id", instanceId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!result.data) return null;
    return {
      instanceId: result.data.instance_id,
      userId: result.data.user_id,
      card: result.data.server_card,
      state: result.data.server_state as DailyMiniGameState,
      firstAttempt: result.data.first_attempt,
      retryCount: result.data.retry_count,
      expiresAt: result.data.expires_at,
      kind: result.data.kind ?? "legacy",
      scenario: result.data.server_scenario ?? undefined,
    };
  }

  async update(record: StandaloneMiniGameServerRecord): Promise<void> {
    const client = createBlundrSupabaseAdminClient();
    if (!client) {
      if (process.env.NODE_ENV === "test")
        localRecords.set(record.instanceId, record);
      return;
    }
    const result = await client
      .from("blundr_minigame_instances")
      .update({
        server_state: record.state,
        first_attempt: record.firstAttempt,
        retry_count: record.retryCount,
        kind: record.kind ?? "legacy",
        server_scenario: record.scenario ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("instance_id", record.instanceId)
      .eq("user_id", record.userId);
    if (result.error) throw new Error("standalone_minigame_update_failed");
  }
}
