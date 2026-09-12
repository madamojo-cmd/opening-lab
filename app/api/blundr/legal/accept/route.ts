import { NextResponse } from "next/server";

import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import { recordCurrentLegalAcceptances } from "@/lib/blundr/legal/legalConsent.server";
import { isBlundrLegalAcceptanceContext } from "@/lib/blundr/legal/legalConsent";
import { emitBlundrOperationalEvent } from "@/lib/blundr/telemetry/operationalTelemetry.server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
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
  const body = (await request.json().catch(() => null)) as {
    context?: unknown;
    locale?: unknown;
  } | null;
  const context = isBlundrLegalAcceptanceContext(body?.context)
    ? body.context
    : "reconsent";
  try {
    await recordCurrentLegalAcceptances({
      userId: user.userId,
      context,
      locale: body?.locale ?? request.headers.get("accept-language"),
    });
    return NextResponse.json({ ok: true });
  } catch {
    await emitBlundrOperationalEvent("legal_acceptance_failed", {
      context,
    });
    return NextResponse.json(
      { ok: false, error: { code: "legal_acceptance_unavailable" } },
      { status: 503 },
    );
  }
}
