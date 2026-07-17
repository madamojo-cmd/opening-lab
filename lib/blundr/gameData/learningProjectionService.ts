import "server-only";
import type { ExtractedFinding } from "./gameDataTypes";
import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";

export async function projectImportedFinding(
  userId: string,
  finding: ExtractedFinding,
): Promise<void> {
  if (finding.status !== "active") return;
  const client = createBlundrSupabaseAdminClient();
  if (!client) return;
  await client.from("blundr_node_mastery").upsert(
    {
      user_id: userId,
      position_key: finding.position.positionKey,
      attempts: 1,
      first_attempt_at: finding.source.observedAt,
      first_attempt_result: "incorrect",
      confidence: finding.confidence,
      access_decision: "active",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,position_key" },
  );
  await client.from("blundr_weakness_projection").upsert(
    {
      user_id: userId,
      position_key: finding.position.positionKey,
      opening_id: finding.position.openingId,
      play_key: finding.position.moveOrderKey,
      category: finding.category,
      score: finding.confidence,
      confidence: finding.confidence,
      explanation: finding.explanation,
      recommended_daily_intervention: finding.recommendedDailyIntervention,
      access_decision: "active",
      source_event_ids: [finding.source.sourceId],
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,position_key,category" },
  );
}
