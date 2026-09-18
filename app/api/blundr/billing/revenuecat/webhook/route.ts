import { NextResponse } from "next/server";

import { readBillingConfig } from "@/lib/blundr/billing/billingConfig";
import {
  authorizeRevenueCatWebhook,
  processRevenueCatWebhook,
} from "@/lib/blundr/billing/revenueCatWebhook.server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let config;
  try {
    config = readBillingConfig();
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "billing_unavailable" } },
      { status: 503 },
    );
  }
  if (
    !authorizeRevenueCatWebhook(
      request.headers.get("authorization"),
      config,
    )
  ) {
    return NextResponse.json(
      { ok: false, error: { code: "revenuecat_authorization_required" } },
      { status: 401 },
    );
  }
  const body = await request.json().catch(() => null);
  const result = await processRevenueCatWebhook({
    body,
    expectedEnvironment: config.environment,
  });
  if (result.ok === false) {
    return NextResponse.json(
      { ok: false, error: { code: result.error } },
      { status: result.status },
    );
  }
  return NextResponse.json({ ok: true });
}
