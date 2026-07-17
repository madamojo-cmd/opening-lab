import "server-only";

import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";

export type DueReviewKey = { openingId: string; playKey: string; dueAt: string };

export async function readDueReviewKeys(userId: string, now: string, limit = 600): Promise<DueReviewKey[]> {
  const client = createBlundrSupabaseAdminClient();
  if (!client) return [];
  const result = await client
    .from("blundr_review_states")
    .select("opening_id,play_key,due_at")
    .eq("user_id", userId)
    .lte("due_at", now)
    .order("due_at", { ascending: true })
    .limit(limit);
  if (result.error) throw new Error("review_persistence_unavailable");
  return (result.data ?? []).map((row) => ({
    openingId: String(row.opening_id),
    playKey: String(row.play_key),
    dueAt: String(row.due_at),
  }));
}

export async function upsertReviewState(input: {
  userId: string;
  openingId: string;
  playKey: string;
  dueAt: string;
  attemptId: string;
  outcome: string;
  srsState: Record<string, unknown>;
}): Promise<void> {
  const client = createBlundrSupabaseAdminClient();
  if (!client) return;
  const result = await client.from("blundr_review_states").upsert({
    user_id: input.userId,
    opening_id: input.openingId,
    play_key: input.playKey,
    due_at: input.dueAt,
    srs_state: input.srsState,
    last_attempt_id: input.attemptId,
    last_outcome: input.outcome,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,opening_id,play_key" });
  if (result.error) throw new Error("review_persistence_unavailable");
}
