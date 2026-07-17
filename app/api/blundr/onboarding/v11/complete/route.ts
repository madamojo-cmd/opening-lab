import { NextRequest, NextResponse } from "next/server";

import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import { completeOnboardingV11 } from "@/lib/blundr/onboarding/onboardingV11";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const user = await getCurrentBlundrUser({ request, allowLocalFallback: false });
  if (!user) return NextResponse.json({ ok: false, error: { code: "authentication_required" } }, { status: 401 });
  try {
    return NextResponse.json({ ok: true, data: await completeOnboardingV11(user) });
  } catch (error) {
    const code = error instanceof Error ? error.message : "onboarding_completion_failed";
    return NextResponse.json({ ok: false, error: { code } }, { status: code.startsWith("onboarding_incomplete") ? 400 : 503 });
  }
}
