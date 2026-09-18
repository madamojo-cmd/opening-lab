import { NextResponse } from "next/server";

import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import { loadDurableProgressSummary } from "@/lib/blundr/progress/durableProgressSummary.server";

export const dynamic = "force-dynamic";

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const requested = Date.parse(`${value}T12:00:00.000Z`);
  return (
    Number.isFinite(requested) &&
    Math.abs(requested - Date.now()) <= 36 * 60 * 60 * 1000
  );
}

export async function GET(request: Request) {
  const user = await getCurrentBlundrUser({
    request,
    allowLocalFallback: false,
  });
  if (!user?.isAuthenticated)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  const localDate = new URL(request.url).searchParams.get("localDate") ?? "";
  if (!validDate(localDate))
    return NextResponse.json({ error: "invalid_local_date" }, { status: 400 });
  try {
    const data = await loadDurableProgressSummary({
      userId: user.userId,
      todayDateKey: localDate,
    });
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "progress_persistence_unavailable",
        message: "Couldn't load your saved progress.",
      },
      { status: 503 },
    );
  }
}
