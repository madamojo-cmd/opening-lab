import { NextResponse } from "next/server";
import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";
import { requireGameDataUser } from "@/lib/blundr/gameData/gameDataService";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await requireGameDataUser(request);
  if (!user)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  const client = createBlundrSupabaseAdminClient();
  if (!client)
    return NextResponse.json({
      userId: user.userId,
      events: 0,
      findings: 0,
      projections: 0,
      dailyCandidates: 0,
      persistence: "unavailable",
    });
  const [events, findings, projections] = await Promise.all([
    client
      .from("blundr_learning_events")
      .select("event_id", { count: "exact", head: true })
      .eq("user_id", user.userId),
    client
      .from("blundr_learning_findings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.userId)
      .eq("status", "active"),
    client
      .from("blundr_weakness_projection")
      .select("position_key", { count: "exact", head: true })
      .eq("user_id", user.userId)
      .eq("access_decision", "active"),
  ]);
  return NextResponse.json({
    userId: user.userId,
    events: events.count ?? 0,
    findings: findings.count ?? 0,
    projections: projections.count ?? 0,
    dailyCandidates: projections.count ?? 0,
    persistence: "ready",
  });
}
