import { NextResponse } from "next/server";
import { getServerFeatureFlags } from "@/lib/blundr/contracts/serverFeatureFlags";
import { isProductionDailyAvailable } from "@/lib/blundr/daily/productionDailyCapability";
import { requireGameDataUser } from "@/lib/blundr/gameData/gameDataService";
import { readUserRepertoire } from "@/lib/blundr/accounts/accountRepository";
import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await requireGameDataUser(request);
  if (!user)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  if (!isProductionDailyAvailable(getServerFeatureFlags()))
    return NextResponse.json({ error: "feature_disabled" }, { status: 503 });
  const body = (await request.json().catch(() => null)) as {
    openingId?: string;
    positionKey?: string;
  } | null;
  if (!body?.openingId?.trim())
    return NextResponse.json({ error: "invalid_priority" }, { status: 400 });
  const repertoire = await readUserRepertoire(user.userId, {
    user,
    allowLocalFallback: false,
  });
  if (
    !repertoire.ok ||
    !repertoire.data?.unlockedOpeningIds.includes(body.openingId.trim())
  )
    return NextResponse.json(
      { status: "unavailable", reason: "opening_locked" },
      { status: 403 },
    );
  const client = createBlundrSupabaseAdminClient();
  if (client) {
    const priorityId = `${user.userId}:${body.openingId.trim()}:${body.positionKey ?? "opening"}`;
    const result = await client.from("blundr_daily_priorities").upsert(
      {
        user_id: user.userId,
        priority_id: priorityId,
        opening_id: body.openingId.trim(),
        position_key: body.positionKey ?? null,
        requested_for: new Date().toISOString().slice(0, 10),
        status: "queued",
      },
      { onConflict: "user_id,priority_id", ignoreDuplicates: true },
    );
    if (result.error)
      return NextResponse.json(
        { status: "unavailable", reason: "persistence_unavailable" },
        { status: 503 },
      );
  }
  return NextResponse.json(
    {
      status: "queued_tomorrow",
      openingId: body.openingId.trim(),
      positionKey: body.positionKey ?? null,
    },
    { status: 202 },
  );
}
