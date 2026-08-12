import { NextResponse } from "next/server";

import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import { commitContinuationCompletion } from "@/lib/blundr/continuation/continuationCompletionService.server";
import { emitBlundrOperationalEvent } from "@/lib/blundr/telemetry/operationalTelemetry.server";

export const dynamic = "force-dynamic";

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function statusFor(code: string): number {
  if (
    [
      "continuation_completion_invalid",
      "continuation_path_invalid",
      "continuation_move_illegal",
      "continuation_user_move_unverified",
    ].includes(code)
  )
    return 400;
  if (code === "continuation_completion_idempotency_conflict") return 409;
  if (
    [
      "continuation_trainer_terminal_unverified",
      "continuation_runtime_line_unverified",
      "continuation_terminal_position_invalid",
      "continuation_terminal_position_unplayable",
    ].includes(code)
  )
    return 422;
  return 503;
}

export async function POST(request: Request) {
  const user = await getCurrentBlundrUser({
    request,
    allowLocalFallback: false,
  });
  if (!user?.isAuthenticated)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  const body = (await request.json().catch(() => null)) as {
    trainerSessionId?: unknown;
    pathUci?: unknown;
  } | null;
  if (!body || !Array.isArray(body.pathUci))
    return NextResponse.json(
      { error: "continuation_completion_invalid" },
      { status: 400 },
    );
  try {
    const result = await commitContinuationCompletion({
      user,
      trainerSessionId: body.trainerSessionId,
      pathUci: body.pathUci,
    });
    await emitBlundrOperationalEvent("continuation_completion_accepted", {
      status: result.status,
    });
    return NextResponse.json(result, {
      status: result.status === "inserted" ? 201 : 200,
    });
  } catch (error) {
    const code =
      error instanceof Error
        ? text(error.message)
        : "continuation_completion_persistence_unavailable";
    await emitBlundrOperationalEvent("continuation_completion_rejected", {
      reason: code,
    });
    return NextResponse.json(
      {
        error: code,
        message:
          "The continuation was not counted because server-owned completion evidence could not be confirmed.",
      },
      { status: statusFor(code) },
    );
  }
}
