import "server-only";

import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";
import { getServerFeatureFlags } from "@/lib/blundr/contracts/serverFeatureFlags";
import {
  buildPreferredMoveAuthorityKey,
  getPreferredMoveAuthorityEntry,
  hasPreferredMoveAuthorityOpening,
  isPreferredMoveForAuthority,
} from "@/lib/blundr/openings/preferredMoveAuthority";
import type {
  ReviewQueueItem,
  ReviewQueueLifecycleState,
  ReviewQueuePage,
  ReviewQueueSyncState,
} from "./reviewQueueTypes";

type Row = Record<string, unknown>;
type InternalReviewQueueItem = ReviewQueueItem & {
  canonicalFen: string | null;
  expectedMoveUci: string | null;
};

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function number(value: unknown): number {
  return Math.max(0, Number(value) || 0);
}

function repertoireSide(
  value: unknown,
): ReviewQueueItem["repertoireSide"] {
  const side = text(value) as ReviewQueueItem["repertoireSide"];
  if (side === "white" || side === "black" || side === "unknown") return side;
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

function latestTimestamp(left: string | null, right: string | null): string | null {
  if (!left) return right;
  if (!right) return left;
  return Date.parse(left) >= Date.parse(right) ? left : right;
}

function representativeOrder(
  left: InternalReviewQueueItem,
  right: InternalReviewQueueItem,
): number {
  return (
    right.score - left.score ||
    Date.parse(right.lastMissedAt ?? "") - Date.parse(left.lastMissedAt ?? "") ||
    Date.parse(right.updatedAt) - Date.parse(left.updatedAt) ||
    left.positionKey.localeCompare(right.positionKey)
  );
}

function publicItem(item: InternalReviewQueueItem): ReviewQueueItem {
  const { canonicalFen: _canonicalFen, expectedMoveUci: _expectedMoveUci, ...safe } = item;
  return safe;
}

export function filterReviewQueueItemsForPreferredAuthority(
  input: {
    items: InternalReviewQueueItem[];
    includeResolved: boolean;
  },
): ReviewQueueItem[] {
  const grouped = new Map<string, InternalReviewQueueItem[]>();
  for (const item of input.items) {
    const authorityKey =
      item.openingId && item.canonicalFen && item.repertoireSide !== "unknown"
        ? buildPreferredMoveAuthorityKey({
            openingId: item.openingId,
            canonicalFen: item.canonicalFen,
            repertoireSide: item.repertoireSide,
          })
        : null;
    const key =
      authorityKey && hasPreferredMoveAuthorityOpening(item.openingId)
        ? authorityKey
        : `position:${item.positionKey}`;
    grouped.set(key, [...(grouped.get(key) ?? []), item]);
  }

  const representatives: ReviewQueueItem[] = [];
  for (const group of grouped.values()) {
    const authorityItem = group.find((item) =>
      hasPreferredMoveAuthorityOpening(item.openingId),
    );
    const authorityEntry =
      authorityItem?.openingId &&
      authorityItem.canonicalFen &&
      authorityItem.repertoireSide !== "unknown"
        ? getPreferredMoveAuthorityEntry({
            openingId: authorityItem.openingId,
            canonicalFen: authorityItem.canonicalFen,
            repertoireSide: authorityItem.repertoireSide,
          })
        : null;
    const preferredRows = authorityEntry
      ? group.filter((item) =>
          isPreferredMoveForAuthority({
            openingId: item.openingId,
            canonicalFen: item.canonicalFen ?? "",
            repertoireSide: item.repertoireSide,
            expectedMoveUci: item.expectedMoveUci,
          }),
        )
      : group;
    if (!preferredRows.length) continue;
    const lifecycleEligible = preferredRows.filter(
      (item) =>
        input.includeResolved ||
        item.lifecycleState === "active" ||
        item.lifecycleState === "remediating" ||
        item.lifecycleState === "legacy_unclassified",
    );
    if (!lifecycleEligible.length) continue;
    const sorted = [...lifecycleEligible].sort(representativeOrder);
    const representative = { ...sorted[0] };
    representative.score = Math.max(...lifecycleEligible.map((item) => item.score));
    representative.missCount = lifecycleEligible.reduce(
      (sum, item) => sum + item.missCount,
      0,
    );
    representative.lastMissedAt = lifecycleEligible.reduce<string | null>(
      (latest, item) => latestTimestamp(latest, item.lastMissedAt),
      null,
    );
    representatives.push(publicItem(representative));
  }

  return representatives.sort(
    (left, right) =>
      right.score - left.score ||
      Date.parse(right.updatedAt) - Date.parse(left.updatedAt) ||
      left.positionKey.localeCompare(right.positionKey),
  );
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
  const requestedFrom = input.page * input.limit;
  const requestedTo = requestedFrom + input.limit;
  const scanLimit = Math.min(
    12_000,
    Math.max(requestedTo * 4, requestedTo + 250),
  );
  const lifecycleStates = ["active", "remediating", "resolved", "legacy_unclassified"] as const;

  const [weaknesses, jobs] = await Promise.all([
    client
      .from("blundr_weakness_projection")
      .select(
        "position_key,opening_id,play_key,category,score,confidence,explanation,recommended_daily_intervention,lifecycle_state,updated_at,lapse_count,last_evidence_at",
      )
      .eq("user_id", input.userId)
      .eq("access_decision", "active")
      .in("lifecycle_state", lifecycleStates as unknown as string[])
      .order("score", { ascending: false })
      .order("updated_at", { ascending: false })
      .range(0, scanLimit - 1),
    client
      .from("blundr_game_import_jobs")
      .select("status,updated_at")
      .eq("user_id", input.userId)
      .order("updated_at", { ascending: false })
      .limit(1),
  ]);

  if (weaknesses.error) return { ok: false, error: "query_failed" };

  const weaknessRows = (weaknesses.data ?? []) as unknown as Row[];
  const items: InternalReviewQueueItem[] = weaknessRows
    .map((row) => ({
      mistakeId: text(row.position_key),
      positionKey: text(row.position_key),
      openingId: row.opening_id === null ? null : text(row.opening_id),
      playKey: row.play_key === null ? null : text(row.play_key),
      repertoireSide: "unknown" as const,
      category: text(row.category),
      score: number(row.score),
      confidence: number(row.confidence),
      explanation: text(row.explanation),
      recommendedDailyIntervention: text(row.recommended_daily_intervention),
      lifecycleState: lifecycle(row.lifecycle_state),
      missCount: number(row.lapse_count),
      lastMissedAt: row.last_evidence_at === null ? null : text(row.last_evidence_at),
      updatedAt: text(row.updated_at),
      canonicalFen: null,
      expectedMoveUci: null,
    }))
    .filter((item) => Boolean(item.positionKey));

  if (items.length) {
    const positionKeys = [...new Set(items.map((item) => item.positionKey))];
    const events = await client
      .from("blundr_learning_events")
      .select("position_key,repertoire_side,canonical_fen,expected_move_uci,occurred_at,deleted_at")
      .eq("user_id", input.userId)
      .in("position_key", positionKeys)
      .is("deleted_at", null)
      .order("occurred_at", { ascending: false });
    if (!events.error) {
      const rows = (events.data ?? []) as unknown as Row[];
      const byPositionKey = new Map<
        string,
        Pick<InternalReviewQueueItem, "repertoireSide" | "canonicalFen" | "expectedMoveUci">
      >();
      for (const row of rows) {
        const key = text(row.position_key);
        if (!key || byPositionKey.has(key)) continue;
        byPositionKey.set(key, {
          repertoireSide: repertoireSide(row.repertoire_side),
          canonicalFen: text(row.canonical_fen) || null,
          expectedMoveUci: text(row.expected_move_uci) || null,
        });
      }
      for (const item of items) {
        const event = byPositionKey.get(item.positionKey);
        item.repertoireSide = event?.repertoireSide ?? "unknown";
        item.canonicalFen = event?.canonicalFen ?? null;
        item.expectedMoveUci = event?.expectedMoveUci ?? null;
      }
    }
  }

  const filteredItems = filterReviewQueueItemsForPreferredAuthority({
    items,
    includeResolved: input.includeResolved,
  });
  const pageItems = filteredItems.slice(requestedFrom, requestedTo);

  const lastSyncAt = jobs.data?.[0]?.updated_at
    ? String(jobs.data[0].updated_at)
    : null;
  const lastSyncStatus = jobs.data?.[0]?.status
    ? String(jobs.data[0].status)
    : null;

  const syncState = computeSyncState({
    lastSyncAt,
    lastSyncStatus,
    itemCount: pageItems.length,
  });

  return {
    ok: true,
    data: {
      syncState,
      generatedAt,
      lastSyncAt,
      page: input.page,
      limit: input.limit,
      nextPage:
        filteredItems.length > requestedTo || weaknessRows.length === scanLimit
          ? input.page + 1
          : null,
      items: pageItems,
      warnings: [],
    },
  };
}
