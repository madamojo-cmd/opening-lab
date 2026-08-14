import { NextRequest, NextResponse } from "next/server";

import { bootstrapBlundrAccount } from "@/lib/blundr/accounts/accountService";
import { updateOwnedTrainingPreferences } from "@/lib/blundr/accounts/trainingPreferences.server";
import { normalizeIanaTimeZone } from "@/lib/blundr/accounts/trainingPreferences";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const result = await bootstrapBlundrAccount({ request });
  if (!result.ok) {
    return NextResponse.json(result, {
      status:
        "error" in result && result.error.code === "authentication_required"
          ? 401
          : 503,
    });
  }
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const result = await bootstrapBlundrAccount({ request });
  if (!result.ok) {
    return NextResponse.json(result, {
      status:
        "error" in result && result.error.code === "authentication_required"
          ? 401
          : 503,
    });
  }
  const body = (await request.json().catch(() => null)) as {
    timeZone?: unknown;
  } | null;
  const timeZone = normalizeIanaTimeZone(body?.timeZone);
  if (!timeZone) return NextResponse.json(result);
  try {
    const profile = await updateOwnedTrainingPreferences(result.data.user, {
      timeZone,
    });
    return NextResponse.json({
      ...result,
      data: { ...result.data, profile },
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "training_preferences_unavailable",
          message: "The account timezone could not be confirmed.",
        },
      },
      { status: 503 },
    );
  }
}
