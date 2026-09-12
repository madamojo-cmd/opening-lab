import { NextResponse } from "next/server";

import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import { deleteAuthenticatedAccount } from "@/lib/blundr/accounts/accountDataRights.server";
import { readBillingConfig } from "@/lib/blundr/billing/billingConfig";
import { createStripeClient } from "@/lib/blundr/billing/stripeClient.server";
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
    confirmation?: unknown;
  } | null;
  const stripe = (() => {
    try {
      return createStripeClient(readBillingConfig());
    } catch {
      return null;
    }
  })();
  try {
    const result = await deleteAuthenticatedAccount({
      userId: user.userId,
      confirmation: body?.confirmation,
      stripe,
    });
    await emitBlundrOperationalEvent("account_deletion_completed", {
      canceledSubscriptions: result.canceledSubscriptions,
    });
    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    const code =
      error instanceof Error ? error.message : "account_deletion_unavailable";
    const status =
      code === "account_deletion_confirmation_required"
        ? 422
        : code === "account_deletion_billing_cleanup_unavailable"
          ? 409
          : 503;
    await emitBlundrOperationalEvent("account_deletion_failed", {
      code,
      status,
    });
    return NextResponse.json({ ok: false, error: { code } }, { status });
  }
}
