import { NextResponse } from "next/server";

import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import { readCurrentLegalAcceptanceStatus } from "@/lib/blundr/legal/legalConsent.server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getCurrentBlundrUser({
    request,
    allowLocalFallback: false,
  });
  if (!user?.isAuthenticated) {
    return NextResponse.json(
      { ok: false, error: { code: "authentication_required" } },
      { status: 401 },
    );
  }
  try {
    return NextResponse.json({
      ok: true,
      data: await readCurrentLegalAcceptanceStatus({ userId: user.userId }),
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "legal_acceptance_unavailable" } },
      { status: 503 },
    );
  }
}
