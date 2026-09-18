import { NextResponse } from "next/server";

import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import {
  readPrivacyPreferences,
  updatePrivacyPreferences,
} from "@/lib/blundr/privacy/privacyPreferences.server";
import { emitBlundrOperationalEvent } from "@/lib/blundr/telemetry/operationalTelemetry.server";

export const dynamic = "force-dynamic";

async function authenticatedUser(request: Request) {
  const user = await getCurrentBlundrUser({
    request,
    allowLocalFallback: false,
  });
  return user?.isAuthenticated ? user : null;
}

export async function GET(request: Request) {
  const user = await authenticatedUser(request);
  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: "authentication_required" } },
      { status: 401 },
    );
  }
  try {
    return NextResponse.json({
      ok: true,
      data: await readPrivacyPreferences({ userId: user.userId }),
    });
  } catch {
    await emitBlundrOperationalEvent("privacy_preferences_failed", {
      action: "read",
    });
    return NextResponse.json(
      { ok: false, error: { code: "privacy_preferences_unavailable" } },
      { status: 503 },
    );
  }
}

export async function PATCH(request: Request) {
  const user = await authenticatedUser(request);
  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: "authentication_required" } },
      { status: 401 },
    );
  }
  const body = (await request.json().catch(() => null)) as {
    optionalAnalyticsConsent?: unknown;
  } | null;
  try {
    return NextResponse.json({
      ok: true,
      data: await updatePrivacyPreferences({
        userId: user.userId,
        optionalAnalyticsConsent: body?.optionalAnalyticsConsent,
      }),
    });
  } catch {
    await emitBlundrOperationalEvent("privacy_preferences_failed", {
      action: "update",
    });
    return NextResponse.json(
      { ok: false, error: { code: "privacy_preferences_unavailable" } },
      { status: 503 },
    );
  }
}
