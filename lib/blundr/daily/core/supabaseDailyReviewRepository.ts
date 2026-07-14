import "server-only";
import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";
import type { ReviewSeed } from "@/lib/blundr/daily/bridges/mistakeToReview/reviewSeedFactory";

export type DailyReviewCard = {
  cardFingerprint: string;
  positionKey: string;
  openingId: string;
  prompt: string;
  state: "unanswered" | "committed" | "revealed" | "retry";
};

export class SupabaseDailyReviewRepository {
  async eligibleSeeds(
    userId: string,
    openingIds: readonly string[],
  ): Promise<ReviewSeed[]> {
    const client = createBlundrSupabaseAdminClient();
    if (!client || !openingIds.length) return [];
    const result = await client
      .from("blundr_learning_findings")
      .select(
        "finding_fingerprint,position_key,opening_id,explanation,evidence",
      )
      .eq("user_id", userId)
      .eq("status", "active")
      .in("opening_id", openingIds)
      .order("confidence", { ascending: false })
      .limit(5);
    return (result.data ?? []).map((row) => ({
      reviewCardId: `review-card-${row.finding_fingerprint}`,
      cardFingerprint: row.finding_fingerprint,
      positionKey: row.position_key,
      openingId: row.opening_id,
      reason: row.explanation,
      evidenceIds: Array.isArray(row.evidence?.sourceId)
        ? row.evidence.sourceId
        : [String(row.evidence?.sourceId ?? row.finding_fingerprint)],
    }));
  }
}
