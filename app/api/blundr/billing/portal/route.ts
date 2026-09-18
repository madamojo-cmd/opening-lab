import { NextResponse } from "next/server";

import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import { readBillingConfig } from "@/lib/blundr/billing/billingConfig";
import { createBillingPortalSession } from "@/lib/blundr/billing/checkout.server";
import { emitBlundrOperationalEvent } from "@/lib/blundr/telemetry/operationalTelemetry.server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentBlundrUser({
    request,
    allowLocalFallback: false,
  });
  const body = await request.json().catch(() => ({}));
  try {
    const result = await createBillingPortalSession({
      user,
      body,
      config: readBillingConfig(),
    });
    if (result.ok === false) {
      await emitBlundrOperationalEvent("billing_portal_failed", {
        code: result.error,
        status: result.status,
      });
      return NextResponse.json(
        { ok: false, error: { code: result.error } },
        { status: result.status },
      );
    }
    await emitBlundrOperationalEvent("billing_portal_started", {
      authenticated: true,
    });
    return NextResponse.json({ ok: true, data: { url: result.url } });
  } catch {
    await emitBlundrOperationalEvent("billing_portal_failed", {
      code: "billing_portal_unavailable",
      status: 503,
    });
    return NextResponse.json(
      { ok: false, error: { code: "billing_portal_unavailable" } },
      { status: 503 },
    );
  }
}
