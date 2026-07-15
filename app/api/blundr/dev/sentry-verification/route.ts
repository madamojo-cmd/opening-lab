import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (process.env.SENTRY_ENVIRONMENT !== "staging")
    return NextResponse.json({ error: "staging_only" }, { status: 404 });

  const expected = process.env.BLUNDR_SENTRY_VERIFY_TOKEN;
  const received = request.headers.get("x-blundr-staging-verification");
  if (!expected || !received || received !== expected)
    return NextResponse.json({ error: "not_found" }, { status: 404 });

  const eventId = Sentry.captureException(
    new Error("BLUNDR_STAGING_SENTRY_VERIFICATION"),
  );
  const flushed = await Sentry.flush(5000);
  if (!flushed)
    return NextResponse.json(
      { error: "telemetry_flush_failed" },
      { status: 503 },
    );
  return NextResponse.json({ accepted: true, eventId });
}
