import { NextResponse } from "next/server";

import { readBillingConfig } from "@/lib/blundr/billing/billingConfig";
import { processStripeBillingEvent } from "@/lib/blundr/billing/stripeWebhook.server";
import { createStripeClient } from "@/lib/blundr/billing/stripeClient.server";

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
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { ok: false, error: { code: "stripe_signature_required" } },
      { status: 400 },
    );
  }
  const payload = await request.text();
  let event;
  try {
    event = createStripeClient(config).webhooks.constructEvent(
      payload,
      signature,
      config.stripeWebhookSecret,
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "stripe_signature_invalid" } },
      { status: 400 },
    );
  }
  const result = await processStripeBillingEvent({
    event,
    environment: config.environment,
  });
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: { code: "stripe_event_retryable" } },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
