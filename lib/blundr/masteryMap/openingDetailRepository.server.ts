import "server-only";

import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import { readUserRepertoire } from "@/lib/blundr/accounts/accountRepository";
import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";
import { loadTrainingRuntimePackage } from "@/lib/blundr/trainingRuntime/trainingRuntimeLoader";
import { RepertoireOpeningAccessRepository } from "@/lib/blundr/openingAccess/openingAccessRepository";
import {
  getOpeningDisplayName,
  getOpeningSide,
} from "@/lib/blundr/repertoire/repertoireOpeningPool";
import { getStage2OpeningAvailability } from "@/lib/blundr/openings/openingAvailability";
import { buildMasteryMapReadModel } from "./masteryMapReadModel";
import {
  joinOpeningTreeToMastery,
  type MasteryMapEvidence,
} from "./openingTreeMasteryJoin";
import type { MasteryMapReadModel } from "./masteryMapTypes";

type DetailRequest = { request?: Request | null; openingId: string };

export async function loadOpeningDetailReadModel(
  input: DetailRequest,
): Promise<MasteryMapReadModel | null> {
  const availability = getStage2OpeningAvailability(input.openingId.trim());
  const openingId = availability?.openingId ?? input.openingId.trim();
  if (!openingId) return null;
  const user = await getCurrentBlundrUser({
    request: input.request,
    allowLocalFallback: false,
  });
  if (!user?.isAuthenticated) return null;
  const repertoireResult = await readUserRepertoire(user.userId, {
    user,
    allowLocalFallback: false,
  });
  const repertoire = repertoireResult.ok ? repertoireResult.data : null;
  const access = new RepertoireOpeningAccessRepository(() =>
    repertoire
      ? {
          userId: user.userId,
          selectedStarterPackId:
            repertoire.selectedStarterPackId ?? "classical_attacker",
          unlockedOpeningIds: repertoire.unlockedOpeningIds,
          lockedOpeningIds: repertoire.lockedOpeningIds,
          availablePoints: repertoire.openingUnlockPoints,
          lifetimePoints: repertoire.openingUnlockPoints,
          spentPoints: 0,
          nextUnlockCost: 0,
          nextUnlockProgressPct: 0,
          pointEvents: [],
          unlockEvents: [],
          updatedAt: repertoire.updatedAt,
        }
      : null,
  );
  const side = getOpeningSide(openingId);
  const sides =
    side === "unknown" ? (["white", "black"] as const) : ([side] as const);
  const active = sides.some(
    (repertoireSide) =>
      access.get({ userId: user.userId, openingId, repertoireSide })
        .decision === "active",
  );
  if (!active) return null;

  const runtime = await loadTrainingRuntimePackage();
  const client = createBlundrSupabaseAdminClient();
  if (!client) {
    return buildMasteryMapReadModel({
      openingId,
      openingName: getOpeningDisplayName(openingId),
      side,
      nodes: joinOpeningTreeToMastery({
        openingId,
        runtimeNodes: runtime.nodes,
        mastery: [],
        weaknesses: [],
      }),
      importedGameMatchCount: 0,
    });
  }
  const [findings, mastery, segments, jobs] = await Promise.all([
    client
      .from("blundr_learning_findings")
      .select(
        "position_key,confidence,category,explanation,recommended_activity_types,status,evidence",
      )
      .eq("user_id", user.userId)
      .eq("opening_id", openingId)
      .eq("status", "active"),
    client
      .from("blundr_node_mastery")
      .select(
        "position_key,attempts,first_attempt_result,confidence,updated_at",
      )
      .eq("user_id", user.userId)
      .eq("access_decision", "active"),
    client
      .from("blundr_game_opening_segments")
      .select("game_fingerprint,position_key,access_state")
      .eq("user_id", user.userId)
      .eq("opening_id", openingId)
      .eq("access_state", "active"),
    client
      .from("blundr_game_import_jobs")
      .select("status,updated_at")
      .eq("user_id", user.userId)
      .order("updated_at", { ascending: false })
      .limit(1),
  ]);
  const findingRows = findings.data ?? [];
  const positionKeys = new Set(
    findingRows.map((row) => String(row.position_key)),
  );
  const evidence: MasteryMapEvidence[] = [...positionKeys].map(
    (positionKey) => ({
      positionKey,
      evidenceCount: findingRows.filter(
        (row) => String(row.position_key) === positionKey,
      ).length,
      importedGameEvidenceCount: findingRows.filter(
        (row) =>
          String(row.position_key) === positionKey &&
          typeof row.evidence === "object",
      ).length,
      alternateRoute: findingRows.some(
        (row) =>
          String(row.position_key) === positionKey &&
          String(row.category) === "move_order",
      ),
    }),
  );
  const weaknessRows = findingRows.map((row) => ({
    positionKey: String(row.position_key),
    category: String(row.category) as never,
    score: Number(row.confidence ?? 0),
    confidence: Number(row.confidence ?? 0),
    explanation: String(row.explanation ?? ""),
    recommendedDailyIntervention: Array.isArray(row.recommended_activity_types)
      ? (String(
          row.recommended_activity_types[0] ?? "review_position",
        ) as never)
      : ("review_position" as never),
    access: "active" as const,
  }));
  const nodes = joinOpeningTreeToMastery({
    openingId,
    runtimeNodes: runtime.nodes,
    mastery: (mastery.data ?? []).map((row) => ({
      positionKey: String(row.position_key),
      attempts: Number(row.attempts ?? 0),
      firstAttemptAt: null,
      firstAttemptResult: row.first_attempt_result as
        | "correct"
        | "incorrect"
        | "revealed"
        | null,
      confidence: Number(row.confidence ?? 0),
      updatedAt: String(row.updated_at ?? ""),
    })),
    weaknesses: weaknessRows,
    evidence,
  });
  const lastSync = jobs.data?.[0]?.updated_at
    ? Date.parse(String(jobs.data[0].updated_at))
    : NaN;
  const state =
    findings.error || mastery.error
      ? "error"
      : !Number.isFinite(lastSync)
        ? nodes.length
          ? undefined
          : "empty"
        : Date.now() - lastSync > 7 * 86_400_000
          ? "stale"
          : jobs.data?.[0]?.status === "partially_completed"
            ? "partial"
            : undefined;
  return buildMasteryMapReadModel({
    openingId,
    openingName: getOpeningDisplayName(openingId),
    side,
    nodes,
    importedGameMatchCount: new Set(
      (segments.data ?? []).map((row) => String(row.game_fingerprint)),
    ).size,
    state,
  });
}
