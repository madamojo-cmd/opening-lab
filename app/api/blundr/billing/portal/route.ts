import { NextResponse } from "next/server";

import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import { readBillingConfig } from "@/lib/blundr/billing/billingConfig";
import { createBillingPortalSession } from "@/lib/blundr/billing/checkout.server";

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
      return NextResponse.json(
        { ok: false, error: { code: result.error } },
        { status: result.status },
      );
    }
    return NextResponse.json({ ok: true, data: { url: result.url } });
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "billing_portal_unavailable" } },
      { status: 503 },
    );
  }
}
