import { NextResponse } from "next/server";
import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";
import {
  loadOpeningAccess,
  requireGameDataUser,
} from "@/lib/blundr/gameData/gameDataService";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ openingId: string }> },
) {
  const user = await requireGameDataUser(request);
  if (!user)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  const { openingId } = await context.params;
  const access = await loadOpeningAccess(user);
  const white = access.get({
    userId: user.userId,
    openingId,
    repertoireSide: "white",
  });
  const black = access.get({
    userId: user.userId,
    openingId,
    repertoireSide: "black",
  });
  const activeSides = [white, black]
    .filter((snapshot) => snapshot.decision === "active")
    .map((snapshot) => snapshot.repertoireSide);
  if (!activeSides.length)
    return NextResponse.json({ error: "opening_unavailable" }, { status: 404 });
  const client = createBlundrSupabaseAdminClient();
  if (!client)
    return NextResponse.json({
      openingId,
      state: "empty",
      masteryPercent: null,
      importedGameCount: 0,
      findingCount: 0,
      freshness: "empty",
      weakBranches: [],
    });
  const findings = await client
    .from("blundr_learning_findings")
    .select(
      "position_key,category,confidence,explanation,recommended_activity_types,status",
    )
    .eq("user_id", user.userId)
    .eq("opening_id", openingId)
    .eq("status", "active");
  const positionKeys = (findings.data ?? []).map((row) => row.position_key);
  const [mastery, segments, jobs] = await Promise.all([
    positionKeys.length
      ? client
          .from("blundr_node_mastery")
          .select("position_key,attempts,confidence,updated_at")
          .eq("user_id", user.userId)
          .eq("access_decision", "active")
          .in("position_key", positionKeys)
      : Promise.resolve({ data: [], error: null }),
    client
      .from("blundr_game_opening_segments")
      .select("game_fingerprint")
      .eq("user_id", user.userId)
      .eq("opening_id", openingId)
      .eq("access_state", "active"),
    client
      .from("blundr_game_import_jobs")
      .select("updated_at,status")
      .eq("user_id", user.userId)
      .order("updated_at", { ascending: false })
      .limit(1),
  ]);
  const rows = (mastery.data ?? []) as Array<{ confidence?: number }>;
  const masteryPercent = rows.length
    ? Math.round(
        (rows.reduce((sum, row) => sum + Number(row.confidence ?? 0), 0) /
          rows.length) *
          100,
      )
    : null;
  const lastSync = jobs.data?.[0]?.updated_at
    ? Date.parse(String(jobs.data[0].updated_at))
    : NaN;
  const freshness = !Number.isFinite(lastSync)
    ? "empty"
    : Date.now() - lastSync > 7 * 86_400_000
      ? "stale"
      : jobs.data?.[0]?.status === "partially_completed"
        ? "partial"
        : "current";
  const weakBranches = (findings.data ?? []).map((row) => ({
    positionKey: String(row.position_key),
    category: String(row.category),
    score: Number(row.confidence ?? 0),
    confidence: Number(row.confidence ?? 0),
    explanation: String(row.explanation),
    recommendedDailyIntervention: Array.isArray(row.recommended_activity_types)
      ? (row.recommended_activity_types[0] ?? "none")
      : "none",
    access: "active",
  }));
  return NextResponse.json({
    openingId,
    state: findings.error
      ? "error"
      : freshness === "empty"
        ? "empty"
        : freshness,
    access: activeSides,
    masteryPercent,
    importedGameCount: new Set(
      (segments.data ?? []).map((row) => row.game_fingerprint),
    ).size,
    findingCount: findings.data?.length ?? 0,
    freshness,
    weakBranches,
  });
}
