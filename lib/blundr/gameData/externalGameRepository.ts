import "server-only";
import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";
import type {
  ProviderGameRecord,
  OpeningSegmentRecord,
  ExtractedFinding,
} from "./gameDataTypes";
import { projectImportedFinding } from "./learningProjectionService";
import { requireProviderPersistence } from "./providerPersistence.server";

const games = new Map<string, ProviderGameRecord>();
const segments = new Map<string, OpeningSegmentRecord>();
const findings = new Map<string, ExtractedFinding>();

export class ExternalGameRepository {
  async hasGame(
    userId: string,
    provider: ProviderGameRecord["provider"],
    fingerprint: string,
  ): Promise<boolean> {
    const client = requireProviderPersistence(
      createBlundrSupabaseAdminClient(),
    );
    if (!client) return games.has(`${userId}:${provider}:${fingerprint}`);
    const result = await client
      .from("blundr_external_games")
      .select("id")
      .eq("user_id", userId)
      .eq("provider", provider)
      .or(
        `provider_fingerprint.eq.${fingerprint},fallback_fingerprint.eq.${fingerprint}`,
      )
      .maybeSingle();
    return Boolean(result.data);
  }

  async saveGame(userId: string, game: ProviderGameRecord): Promise<void> {
    const key = game.providerFingerprint ?? game.fallbackFingerprint;
    const client = requireProviderPersistence(
      createBlundrSupabaseAdminClient(),
    );
    if (!client) {
      games.set(`${userId}:${game.provider}:${key}`, game);
      return;
    }
    const result = await client.from("blundr_external_games").upsert(
      {
        user_id: userId,
        provider: game.provider,
        provider_game_id: game.providerGameId,
        provider_fingerprint: game.providerFingerprint,
        fallback_fingerprint: game.fallbackFingerprint,
        username: game.username,
        white_player: game.whitePlayer,
        black_player: game.blackPlayer,
        played_at: game.playedAt,
        result: game.result,
        time_control: game.timeControl,
        rated: game.rated,
        variant: game.variant,
        normalized_pgn: game.pgn,
        normalized_moves: game.normalizedMoves,
        player_color: game.playerColor,
        classification_state: game.classificationState,
        processing_version: game.processingVersion,
        classifier_version: game.classifierVersion,
      },
      { onConflict: "user_id,provider_fingerprint" },
    );
    if (result.error) throw new Error("external_game_persistence_failed");
  }

  async saveSegment(
    userId: string,
    segment: OpeningSegmentRecord,
  ): Promise<void> {
    const client = requireProviderPersistence(
      createBlundrSupabaseAdminClient(),
    );
    if (!client) {
      segments.set(`${userId}:${segment.segmentId}`, segment);
      return;
    }
    const result = await client.from("blundr_game_opening_segments").upsert(
      {
        user_id: userId,
        segment_id: segment.segmentId,
        game_fingerprint: segment.gameFingerprint,
        opening_id: segment.openingId,
        repertoire_side: segment.repertoireSide,
        first_matched_ply: segment.firstMatchedPly,
        last_matched_ply: segment.lastMatchedPly,
        divergence_ply: segment.divergencePly,
        runtime_version: segment.runtimeVersion,
        access_state: segment.accessState,
      },
      { onConflict: "user_id,segment_id" },
    );
    if (result.error) throw new Error("opening_segment_persistence_failed");
  }

  async saveFinding(
    userId: string,
    finding: ExtractedFinding,
  ): Promise<boolean> {
    const client = requireProviderPersistence(
      createBlundrSupabaseAdminClient(),
    );
    if (!client) {
      const key = `${userId}:${finding.fingerprint}`;
      const duplicate = findings.has(key);
      findings.set(key, finding);
      return !duplicate;
    }
    const result = await client.from("blundr_learning_findings").upsert(
      {
        user_id: userId,
        finding_id: finding.findingId,
        finding_fingerprint: finding.fingerprint,
        segment_id: finding.segmentId,
        game_fingerprint: finding.gameFingerprint,
        position_key: finding.position.positionKey,
        opening_id: finding.position.openingId,
        repertoire_side: finding.position.repertoireSide,
        category: finding.category,
        confidence: finding.confidence,
        severity: finding.severity,
        evidence: finding.evidence,
        explanation: finding.explanation,
        recommended_activity_types: [finding.recommendedDailyIntervention],
        status: finding.status,
      },
      { onConflict: "user_id,finding_fingerprint" },
    );
    if (result.error) throw new Error("learning_finding_persistence_failed");
    await projectImportedFinding(userId, finding);
    return true;
  }

  async deleteProviderData(userId: string, provider: string): Promise<void> {
    const client = requireProviderPersistence(
      createBlundrSupabaseAdminClient(),
    );
    if (!client) return;
    await client
      .from("blundr_external_games")
      .delete()
      .eq("user_id", userId)
      .eq("provider", provider);
  }
}
