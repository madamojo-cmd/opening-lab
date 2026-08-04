import { NextResponse } from "next/server";

import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";

export const dynamic = "force-dynamic";

function text(value: unknown): string {
  return String(value ?? "").trim();
}

export async function POST(request: Request) {
  const user = await getCurrentBlundrUser({
    request,
    allowLocalFallback: false,
  });
  if (!user?.isAuthenticated) {
    return NextResponse.json(
      {
        error: "authentication_required",
        message: "Sign in to unlock an opening.",
      },
      { status: 401 },
    );
  }
  const body = (await request.json().catch(() => null)) as {
    openingId?: unknown;
    idempotencyKey?: unknown;
  } | null;
  const openingId = text(body?.openingId);
  const idempotencyKey = text(body?.idempotencyKey);
  if (!openingId || !idempotencyKey || idempotencyKey.length > 240) {
    return NextResponse.json(
      {
        error: "invalid_unlock_request",
        message: "Opening and request identity are required.",
      },
      { status: 400 },
    );
  }
  const admin = createBlundrSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      {
        error: "unlock_persistence_unavailable",
        message: "Unlock persistence is unavailable.",
      },
      { status: 503 },
    );
  }
  const { data, error } = await admin.rpc("blundr_unlock_repertoire_opening", {
    p_user_id: user.userId,
    p_opening_id: openingId,
    p_idempotency_key: idempotencyKey,
  });
  if (error || !data) {
    const code = text(error?.message) || "unlock_persistence_unavailable";
    const status = code.includes("insufficient_points")
      ? 409
      : code.includes("opening_not_locked")
        ? 404
        : code.includes("invalid_unlock")
          ? 400
          : 503;
    return NextResponse.json(
      { error: code, message: "The opening was not unlocked." },
      { status },
    );
  }
  return NextResponse.json({ ok: true, data });
}
