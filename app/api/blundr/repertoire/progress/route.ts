import { NextResponse } from "next/server";

import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import { loadDurableRepertoireProgress } from "@/lib/blundr/repertoire/durableRepertoireProgress.server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getCurrentBlundrUser({
    request,
    allowLocalFallback: false,
  });
  if (!user?.isAuthenticated) {
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  }

  try {
    const data = await loadDurableRepertoireProgress({
      userId: user.userId,
      accessToken: user.accessToken ?? null,
    });
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "repertoire_persistence_unavailable",
        message:
          "Repertoire progress could not be loaded from durable storage.",
      },
      { status: 503 },
    );
  }
}
