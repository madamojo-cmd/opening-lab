import "server-only";

import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";
import { getServerFeatureFlags } from "@/lib/blundr/contracts/serverFeatureFlags";
import type { ReviewQueueLifecycleState } from "./reviewQueueTypes";

type Row = Record<string, unknown>;
type SupabaseAdminClient = NonNullable<
  ReturnType<typeof createBlundrSupabaseAdminClient>
>;

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function number(value: unknown): number {
  return Math.max(0, Number(value) || 0);
}

function repertoireSide(
  value: unknown,
): "white" | "black" | "unknown" {
  const side = text(value);
  if (side === "white" || side === "black") return side;
  return "unknown";
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

export function isReviewMistakeId(value: string): boolean {
  return /^pos-[0-9a-f]{8}$/.test(String(value ?? "").trim());
}

export type ReviewMistakeSnapshot = {
  mistakeId: string;
  positionKey: string;
  openingId: string | null;
  playKey: string | null;
  repertoireSide: "white" | "black" | "unknown";
  canonicalFen: string;
  category: string;
  lifecycleState: ReviewQueueLifecycleState;
  missCount: number;
  lastMissedAt: string | null;
  updatedAt: string;
};

export type ReviewMistakeSolution = ReviewMistakeSnapshot & {
  expectedMoveUci: string;
};

export type ReviewMistakeError =
  | "invalid_request"
  | "feature_disabled"
  | "persistence_unavailable"
  | "not_found"
  | "query_failed"
  | "solution_unavailable";

async function readWeaknessRow(input: {
  userId: string;
  mistakeId: string;
  adminClient?: SupabaseAdminClient;
}) {
  const flags = getServerFeatureFlags();
  if (!flags.learning_core_v2_read)
    return { ok: false as const, error: "feature_disabled" as const };

  const client = input.adminClient ?? createBlundrSupabaseAdminClient();
  if (!client)
    return {
      ok: false as const,
      error: "persistence_unavailable" as const,
    };

  const weakness = await client
    .from("blundr_weakness_projection")
    .select(
      "position_key,opening_id,play_key,category,lifecycle_state,lapse_count,last_evidence_at,updated_at",
    )
    .eq("user_id", input.userId)
    .eq("access_decision", "active")
    .eq("position_key", input.mistakeId)
    .maybeSingle();

  if (weakness.error) return { ok: false as const, error: "query_failed" as const };
  if (!weakness.data) return { ok: false as const, error: "not_found" as const };

  return { ok: true as const, client, row: weakness.data as unknown as Row };
}

async function readLatestLearningEventRow(input: {
  client: SupabaseAdminClient;
  userId: string;
  mistakeId: string;
  openingId: string | null;
  playKey: string | null;
  includeExpectedMove: boolean;
}) {
  const columns = [
    "position_key",
    "canonical_fen",
    "repertoire_side",
    "opening_id",
    "move_order_key",
    "occurred_at",
    "deleted_at",
    ...(input.includeExpectedMove ? ["expected_move_uci"] : []),
  ].join(",");

  let query = input.client
    .from("blundr_learning_events")
    .select(columns)
    .eq("user_id", input.userId)
    .eq("position_key", input.mistakeId)
    .is("deleted_at", null);

  if (input.openingId) query = query.eq("opening_id", input.openingId);
  if (input.playKey) query = query.eq("move_order_key", input.playKey);

  const result = await query
    .order("occurred_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (result.error)
    return { ok: false as const, error: "query_failed" as const };
  const row = (result.data ?? null) as unknown as Row | null;
  if (!row) return { ok: false as const, error: "solution_unavailable" as const };
  return { ok: true as const, row };
}

export async function loadReviewMistakeSnapshot(input: {
  userId: string;
  mistakeId: string;
  adminClient?: SupabaseAdminClient;
}): Promise<
  | { ok: true; data: ReviewMistakeSnapshot }
  | { ok: false; error: ReviewMistakeError }
> {
  if (!isReviewMistakeId(input.mistakeId))
    return { ok: false, error: "invalid_request" };

  const weakness = await readWeaknessRow(input);
  if (weakness.ok === false)
    return { ok: false, error: weakness.error };

  const weaknessRow = weakness.row;
  const openingId =
    weaknessRow.opening_id === null ? null : text(weaknessRow.opening_id);
  const playKey =
    weaknessRow.play_key === null ? null : text(weaknessRow.play_key);

  const event = await readLatestLearningEventRow({
    client: weakness.client,
    userId: input.userId,
    mistakeId: input.mistakeId,
    openingId,
    playKey,
    includeExpectedMove: false,
  });
  if (event.ok === false)
    return { ok: false, error: event.error };

  const eventRow = event.row;
  const canonicalFen = text(eventRow.canonical_fen);
  if (!canonicalFen) return { ok: false, error: "solution_unavailable" };

  return {
    ok: true,
    data: {
      mistakeId: input.mistakeId,
      positionKey: text(weaknessRow.position_key),
      openingId,
      playKey,
      repertoireSide: repertoireSide(eventRow.repertoire_side),
      canonicalFen,
      category: text(weaknessRow.category),
      lifecycleState: lifecycle(weaknessRow.lifecycle_state),
      missCount: number(weaknessRow.lapse_count),
      lastMissedAt:
        weaknessRow.last_evidence_at === null
          ? null
          : text(weaknessRow.last_evidence_at),
      updatedAt: text(weaknessRow.updated_at),
    },
  };
}

export async function loadReviewMistakeSolution(input: {
  userId: string;
  mistakeId: string;
  adminClient?: SupabaseAdminClient;
}): Promise<
  | { ok: true; data: ReviewMistakeSolution }
  | { ok: false; error: ReviewMistakeError }
> {
  if (!isReviewMistakeId(input.mistakeId))
    return { ok: false, error: "invalid_request" };

  const weakness = await readWeaknessRow(input);
  if (weakness.ok === false)
    return { ok: false, error: weakness.error };

  const weaknessRow = weakness.row;
  const openingId =
    weaknessRow.opening_id === null ? null : text(weaknessRow.opening_id);
  const playKey =
    weaknessRow.play_key === null ? null : text(weaknessRow.play_key);

  const event = await readLatestLearningEventRow({
    client: weakness.client,
    userId: input.userId,
    mistakeId: input.mistakeId,
    openingId,
    playKey,
    includeExpectedMove: true,
  });
  if (event.ok === false)
    return { ok: false, error: event.error };

  const eventRow = event.row;
  const canonicalFen = text(eventRow.canonical_fen);
  const expectedMoveUci = text(eventRow.expected_move_uci);
  if (!canonicalFen || !expectedMoveUci)
    return { ok: false, error: "solution_unavailable" };

  return {
    ok: true,
    data: {
      mistakeId: input.mistakeId,
      positionKey: text(weaknessRow.position_key),
      openingId,
      playKey,
      repertoireSide: repertoireSide(eventRow.repertoire_side),
      canonicalFen,
      expectedMoveUci,
      category: text(weaknessRow.category),
      lifecycleState: lifecycle(weaknessRow.lifecycle_state),
      missCount: number(weaknessRow.lapse_count),
      lastMissedAt:
        weaknessRow.last_evidence_at === null
          ? null
          : text(weaknessRow.last_evidence_at),
      updatedAt: text(weaknessRow.updated_at),
    },
  };
}
