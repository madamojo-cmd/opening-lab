import "server-only";

import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";
import { getLocalDateKeyForTimeZone } from "@/lib/blundr/daily-rings/dailyRingDate";
import { buildPreferredMoveAuthorityKey } from "@/lib/blundr/openings/preferredMoveAuthority";
import type { ReviewQueueItem } from "./reviewQueueTypes";

export const MAX_DAILY_REVIEW_COMPLETIONS_PER_AUTHORITY = 4;

type Row = Record<string, unknown>;

export type ReviewDailyLimitIdentity = {
  openingId: string | null | undefined;
  canonicalFen: string | null | undefined;
  repertoireSide: ReviewQueueItem["repertoireSide"] | "white" | "black";
};

export type ReviewDailyLimitEventRow = {
  source?: unknown;
  taxonomy?: unknown;
  opening_id?: unknown;
  canonical_fen?: unknown;
  repertoire_side?: unknown;
  occurred_at?: unknown;
  deleted_at?: unknown;
};

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function localDateFromTimestamp(value: unknown, timeZone: string | null): string {
  const parsed = new Date(String(value ?? ""));
  return Number.isFinite(parsed.valueOf())
    ? getLocalDateKeyForTimeZone(parsed, timeZone)
    : "";
}

export function buildReviewDailyLimitAuthorityKey(
  input: ReviewDailyLimitIdentity,
): string | null {
  return buildPreferredMoveAuthorityKey({
    openingId: input.openingId,
    canonicalFen: text(input.canonicalFen),
    repertoireSide: input.repertoireSide,
  });
}

export function countDailyCorrectReviewCompletionsByAuthority(input: {
  rows: readonly ReviewDailyLimitEventRow[];
  localDate: string;
  timeZone?: string | null;
}): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of input.rows) {
    if (row.deleted_at !== null && row.deleted_at !== undefined) continue;
    if (text(row.source) !== "review") continue;
    if (text(row.taxonomy) !== "move_correct") continue;
    if (
      localDateFromTimestamp(row.occurred_at, input.timeZone ?? null) !==
      input.localDate
    )
      continue;
    const key = buildReviewDailyLimitAuthorityKey({
      openingId: text(row.opening_id),
      canonicalFen: text(row.canonical_fen),
      repertoireSide: text(row.repertoire_side) as ReviewQueueItem["repertoireSide"],
    });
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

async function loadUserTimeZone(input: {
  client: ReturnType<typeof createBlundrSupabaseAdminClient>;
  userId: string;
}): Promise<string | null> {
  if (!input.client) return null;
  const result = await input.client
    .from("blundr_user_profiles")
    .select("time_zone")
    .eq("user_id", input.userId)
    .maybeSingle();
  if (result.error) return null;
  return text((result.data as Row | null)?.time_zone) || null;
}

export async function loadDailyReviewCompletionCounts(input: {
  client: ReturnType<typeof createBlundrSupabaseAdminClient>;
  userId: string;
  now?: string | Date;
}): Promise<{
  localDate: string;
  timeZone: string | null;
  counts: Map<string, number>;
}> {
  const timeZone = await loadUserTimeZone({
    client: input.client,
    userId: input.userId,
  });
  const now =
    input.now instanceof Date
      ? input.now
      : new Date(String(input.now ?? new Date().toISOString()));
  const localDate = getLocalDateKeyForTimeZone(now, timeZone);
  const broadStart = new Date(now.valueOf() - 72 * 60 * 60 * 1000).toISOString();

  const result = await input.client
    .from("blundr_learning_events")
    .select(
      "source,taxonomy,opening_id,canonical_fen,repertoire_side,occurred_at,deleted_at",
    )
    .eq("user_id", input.userId)
    .eq("source", "review")
    .eq("taxonomy", "move_correct")
    .gte("occurred_at", broadStart)
    .is("deleted_at", null);

  if (result.error) {
    return { localDate, timeZone, counts: new Map() };
  }

  return {
    localDate,
    timeZone,
    counts: countDailyCorrectReviewCompletionsByAuthority({
      rows: (result.data ?? []) as ReviewDailyLimitEventRow[],
      localDate,
      timeZone,
    }),
  };
}

export async function isReviewDailyLimitReached(input: {
  userId: string;
  identity: ReviewDailyLimitIdentity;
  now?: string | Date;
}): Promise<boolean> {
  const key = buildReviewDailyLimitAuthorityKey(input.identity);
  if (!key) return false;
  const client = createBlundrSupabaseAdminClient();
  if (!client) return false;
  const result = await loadDailyReviewCompletionCounts({
    client,
    userId: input.userId,
    now: input.now,
  });
  return (
    (result.counts.get(key) ?? 0) >=
    MAX_DAILY_REVIEW_COMPLETIONS_PER_AUTHORITY
  );
}
