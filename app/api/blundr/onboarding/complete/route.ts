import { NextRequest, NextResponse } from "next/server";

import { getAccountPersistenceAdapter } from "@/lib/blundr/accounts/accountRepository";
import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import { getPostOnboardingDestination } from "@/lib/blundr/onboarding/onboardingRouting";
import { completeOnboarding } from "@/lib/blundr/onboarding/onboardingService";
import { normalizeOnboardingState } from "@/lib/blundr/onboarding/onboardingState";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const allowLocalFallback = process.env.NODE_ENV !== "production";
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  if (!body || typeof body !== "object" || Array.isArray(body) || !("state" in body) || (body as { state?: unknown }).state == null) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "missing_onboarding_state",
          message: "Onboarding state is required.",
        },
      },
      { status: 400 },
    );
  }

  const state = normalizeOnboardingState((body as { state?: unknown }).state);
  const user = await getCurrentBlundrUser({ request, allowLocalFallback });
  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "authentication_required",
          message: "A user session is required.",
        },
      },
      { status: 401 },
    );
  }

  const adapter = getAccountPersistenceAdapter({
    user,
    accessToken: user.accessToken ?? null,
    mode: user.mode,
    allowLocalFallback,
  });

  const result = await completeOnboarding(state, user.userId, adapter);
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    data: {
      ...result.data,
      destination: getPostOnboardingDestination(result.data.profile, result.data.repertoire),
      userId: user.userId,
      email: user.email ?? null,
    },
  });
}
