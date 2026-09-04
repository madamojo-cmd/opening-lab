import { NextResponse } from "next/server";

import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import { readBillingConfig } from "@/lib/blundr/billing/billingConfig";
import { acceptPaidOffer } from "@/lib/blundr/billing/paidOffer.server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentBlundrUser({
    request,
    allowLocalFallback: false,
  });
  const body = (await request.json().catch(() => ({}))) as {
    offerId?: unknown;
    plan?: unknown;
  };
  try {
    const result = await acceptPaidOffer({
      user,
      offerId: body.offerId,
      plan: body.plan,
      config: readBillingConfig(),
    });
    if (result.ok === false) {
      return NextResponse.json(
        { ok: false, error: { code: result.error } },
        { status: result.status },
      );
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "billing_offer_unavailable" } },
      { status: 503 },
    );
  }
}
