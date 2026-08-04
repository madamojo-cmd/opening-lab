import { NextResponse } from "next/server";

import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";
import { emitBlundrOperationalEvent } from "@/lib/blundr/telemetry/operationalTelemetry.server";

export const dynamic = "force-dynamic";

const SOURCES = new Set([
  "opening_run_completed",
  "continuation_completed",
  "daily_blundr_deck_completed",
]);

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function statusForDatabaseError(message: string): number {
  if (message.includes("completion_evidence_unverified")) return 422;
  if (message.includes("completion_date_out_of_range")) return 400;
  if (message.includes("invalid_completion")) return 400;
  if (message.includes("account_not_ready")) return 409;
  return 503;
}

async function waitForTrainerEvidence(input: {
  admin: NonNullable<ReturnType<typeof createBlundrSupabaseAdminClient>>;
  userId: string;
  evidenceId: string;
  openingId: string | null;
}): Promise<void> {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    let query = input.admin
      .from("blundr_learning_events")
      .select("event_id")
      .eq("user_id", input.userId)
      .eq("session_id", input.evidenceId)
      .eq("taxonomy", "move_correct")
      .is("deleted_at", null)
      .limit(1);
    if (input.openingId) query = query.eq("opening_id", input.openingId);
    const { data } = await query;
    if (data?.length) return;
    if (attempt < 3)
      await new Promise<void>((resolve) => setTimeout(resolve, 150));
  }
}

export async function POST(request: Request) {
  const user = await getCurrentBlundrUser({
    request,
    allowLocalFallback: false,
  });
  if (!user?.isAuthenticated) {
    return NextResponse.json(
      { error: "authentication_required", message: "Sign in to save rewards." },
      { status: 401 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    completionId?: unknown;
    source?: unknown;
    evidenceId?: unknown;
    localDate?: unknown;
    openingId?: unknown;
  } | null;
  const completionId = text(body?.completionId);
  const source = text(body?.source);
  const evidenceId = text(body?.evidenceId);
  const localDate = text(body?.localDate);
  const openingId = text(body?.openingId) || null;
  if (
    !completionId ||
    !SOURCES.has(source) ||
    !evidenceId ||
    !/^\d{4}-\d{2}-\d{2}$/.test(localDate)
  ) {
    return NextResponse.json(
      {
        error: "invalid_completion_request",
        message: "Completion evidence is required.",
      },
      { status: 400 },
    );
  }

  const admin = createBlundrSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      {
        error: "reward_persistence_unavailable",
        message: "Reward persistence is unavailable.",
      },
      { status: 503 },
    );
  }
  if (source !== "daily_blundr_deck_completed") {
    await waitForTrainerEvidence({
      admin,
      userId: user.userId,
      evidenceId,
      openingId,
    });
  }
  const { data, error } = await admin.rpc("blundr_apply_activity_completion", {
    p_user_id: user.userId,
    p_completion_id: completionId,
    p_source: source,
    p_evidence_id: evidenceId,
    p_local_date: localDate,
    p_opening_id: openingId,
  });
  if (error || !data) {
    const message = text(error?.message) || "reward_persistence_unavailable";
    await emitBlundrOperationalEvent("reward_completion_rejected", {
      source,
      reason: message,
    });
    return NextResponse.json(
      {
        error: message,
        message:
          "The completion was not rewarded because durable evidence could not be confirmed.",
      },
      { status: statusForDatabaseError(message) },
    );
  }
  await emitBlundrOperationalEvent("reward_completion_applied", {
    source,
    duplicate: Boolean((data as { duplicate?: unknown }).duplicate),
  });
  return NextResponse.json({ ok: true, data });
}
