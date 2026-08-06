import { NextResponse } from "next/server";

import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import { applyRewardCompletion } from "@/lib/blundr/rewards/rewardAuthority";
import { emitBlundrOperationalEvent } from "@/lib/blundr/telemetry/operationalTelemetry.server";

export const dynamic = "force-dynamic";

// Restricted Trainer and Daily both have durable server-owned terminal
// evidence. Free-play continuation remains deliberately unsupported.
const SOURCES = new Set([
  "opening_run_completed",
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
    source?: unknown;
    evidenceId?: unknown;
  } | null;
  const source = text(body?.source);
  const evidenceId = text(body?.evidenceId);
  if (!SOURCES.has(source) || !evidenceId) {
    return NextResponse.json(
      {
        error: "invalid_completion_request",
        message: "Completion evidence is required.",
      },
      { status: 400 },
    );
  }

  const result = await applyRewardCompletion({
    userId: user.userId,
    source,
    evidenceId,
  });
  if ("code" in result) {
    const message = result.code;
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
    duplicate: Boolean(result.data.duplicate),
  });
  return NextResponse.json({ ok: true, data: result.data });
}
