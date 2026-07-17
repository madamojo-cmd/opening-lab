import { NextRequest, NextResponse } from "next/server";

import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import {
  ONBOARDING_V11_STEPS,
  readOnboardingV11State,
  saveOnboardingV11Step,
  type OnboardingV11Step,
} from "@/lib/blundr/onboarding/onboardingV11";

export const dynamic = "force-dynamic";

function errorStatus(message: string): number {
  if (message.startsWith("invalid_") || message === "priorities_required") return 400;
  return 503;
}

async function authenticatedUser(request: NextRequest) {
  return getCurrentBlundrUser({ request, allowLocalFallback: false });
}

export async function GET(request: NextRequest) {
  const user = await authenticatedUser(request);
  if (!user) return NextResponse.json({ ok: false, error: { code: "authentication_required" } }, { status: 401 });
  try {
    return NextResponse.json({ ok: true, data: await readOnboardingV11State(user) });
  } catch {
    return NextResponse.json({ ok: false, error: { code: "persistence_unavailable" } }, { status: 503 });
  }
}

export async function PATCH(request: NextRequest) {
  const user = await authenticatedUser(request);
  if (!user) return NextResponse.json({ ok: false, error: { code: "authentication_required" } }, { status: 401 });
  let body: { step?: unknown; value?: unknown; ageConfirmed?: unknown } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    // Validation below produces a safe response.
  }
  const step = body.step;
  if (!ONBOARDING_V11_STEPS.includes(step as OnboardingV11Step)) {
    return NextResponse.json({ ok: false, error: { code: "invalid_onboarding_step" } }, { status: 400 });
  }
  try {
    const state = await saveOnboardingV11Step(user, {
      step: step as OnboardingV11Step,
      value: body.value,
      ageConfirmed: body.ageConfirmed === true,
    });
    return NextResponse.json({ ok: true, data: state });
  } catch (error) {
    const message = error instanceof Error ? error.message : "persistence_unavailable";
    return NextResponse.json({ ok: false, error: { code: message } }, { status: errorStatus(message) });
  }
}
