import "server-only";

import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";
import { getServerFeatureFlags } from "@/lib/blundr/contracts/serverFeatureFlags";
import type {
  ReviewQueueItem,
  ReviewQueueLifecycleState,
  ReviewQueuePage,
  ReviewQueueSyncState,
} from "./reviewQueueTypes";

type Row = Record<string, unknown>;

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function number(value: unknown): number {
  return Math.max(0, Number(value) || 0);
}

function lifecycle(value: unknown): ReviewQueueLifecycleState {
  const state = text(value) as ReviewQueueLifecycleState;
  if (
    state === "active" ||
    state === "remediating" ||
    state === "resolved" ||
    state === "legacy_unclassified"
  )
    return state;
  return "legacy_unclassified";
}

function computeSyncState(input: {
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
  itemCount: number;
}): ReviewQueueSyncState {
  if (!input.lastSyncAt) return input.itemCount ? "ready" : "empty";
  const lastSyncMs = Date.parse(input.lastSyncAt);
  const stale =
    Number.isFinite(lastSyncMs) && Date.now() - lastSyncMs > 7 * 86_400_000;
  if (input.lastSyncStatus === "partially_completed") return "partial";
  return stale ? "stale" : input.itemCount ? "ready" : "empty";
}

export async function loadReviewQueuePage(input: {
  userId: string;
  page: number;
  limit: number;
  includeResolved: boolean;
}): Promise<{ ok: true; data: ReviewQueuePage } | { ok: false; error: string }> {
  const flags = getServerFeatureFlags();
  if (!flags.learning_core_v2_read)
    return { ok: false, error: "feature_disabled" };

  const client = createBlundrSupabaseAdminClient();
  if (!client) return { ok: false, error: "persistence_unavailable" };

  const generatedAt = new Date().toISOString();
  const from = input.page * input.limit;
  const to = from + input.limit - 1;

  const lifecycleStates = input.includeResolved
    ? (["active", "remediating", "resolved", "legacy_unclassified"] as const)
    : (["active", "remediating", "legacy_unclassified"] as const);

  const [weaknesses, jobs] = await Promise.all([
    client
      .from("blundr_weakness_projection")
      .select(
        "position_key,opening_id,play_key,category,score,confidence,explanation,recommended_daily_intervention,lifecycle_state,updated_at",
      )
      .eq("user_id", input.userId)
      .eq("access_decision", "active")
      .in("lifecycle_state", lifecycleStates as unknown as string[])
      .order("score", { ascending: false })
      .order("updated_at", { ascending: false })
      .range(from, to),
    client
      .from("blundr_game_import_jobs")
      .select("status,updated_at")
      .eq("user_id", input.userId)
      .order("updated_at", { ascending: false })
      .limit(1),
  ]);

  if (weaknesses.error) return { ok: false, error: "query_failed" };

  const weaknessRows = (weaknesses.data ?? []) as unknown as Row[];
  const items: ReviewQueueItem[] = weaknessRows
    .map((row) => ({
      positionKey: text(row.position_key),
      openingId: row.opening_id === null ? null : text(row.opening_id),
      playKey: row.play_key === null ? null : text(row.play_key),
      category: text(row.category),
      score: number(row.score),
      confidence: number(row.confidence),
      explanation: text(row.explanation),
      recommendedDailyIntervention: text(row.recommended_daily_intervention),
      lifecycleState: lifecycle(row.lifecycle_state),
      updatedAt: text(row.updated_at),
    }))
    .filter((item) => Boolean(item.positionKey));

  const lastSyncAt = jobs.data?.[0]?.updated_at
    ? String(jobs.data[0].updated_at)
    : null;
  const lastSyncStatus = jobs.data?.[0]?.status
    ? String(jobs.data[0].status)
    : null;

  const syncState = computeSyncState({
    lastSyncAt,
    lastSyncStatus,
    itemCount: items.length,
  });

  return {
    ok: true,
    data: {
      syncState,
      generatedAt,
      lastSyncAt,
      page: input.page,
      limit: input.limit,
      nextPage: items.length === input.limit ? input.page + 1 : null,
      items,
      warnings: [],
    },
  };
}
