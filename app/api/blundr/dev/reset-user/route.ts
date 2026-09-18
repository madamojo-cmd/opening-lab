import { NextRequest, NextResponse } from "next/server";

import { saveTrainingProfile } from "@/lib/blundr/accounts/accountRepository";
import { bootstrapBlundrAccount } from "@/lib/blundr/accounts/accountService";
import { createDefaultTrainingProfile } from "@/lib/blundr/accounts/accountDefaults";
import { resetLocalAccountState } from "@/lib/blundr/accounts/localAccountStorage";
import { appendDeveloperAuditLogEntry } from "@/lib/blundr/accounts/accountRepository";
import { resolveBlundrDeveloperAccess } from "@/lib/blundr/backend/devAccess";
import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import type { CurrentBlundrUser } from "@/lib/blundr/accounts/accountTypes";
import { resolvePreviewOnboardingSelfResetDecision } from "@/lib/blundr/backend/previewResetAccess";
import { resetOnboardingV11State } from "@/lib/blundr/onboarding/onboardingV11Reset";

export const dynamic = "force-dynamic";

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

type ResetUserScope = "onboarding" | "full" | "local_demo";

function normalizeResetScope(value: unknown): ResetUserScope {
  const text = normalizeText(value);
  return text === "local_demo" || text === "full" ? text : "onboarding";
}

function hasBearerAuthorization(request: NextRequest): boolean {
  return normalizeText(request.headers.get("authorization"))
    .toLowerCase()
    .startsWith("bearer ");
}

async function resolvePreviewOnboardingSelfResetAccess(
  request: NextRequest,
  body: Record<string, unknown>,
): Promise<
  | { allowed: true; user: CurrentBlundrUser; targetUserId: string }
  | { allowed: false; reason: string }
> {
  const hasBearerSession = hasBearerAuthorization(request);
  const user = hasBearerSession
    ? await getCurrentBlundrUser({ request, allowLocalFallback: false })
    : null;
  const decision = resolvePreviewOnboardingSelfResetDecision({
    body,
    user,
    vercelEnv: process.env.VERCEL_ENV,
    hasBearerSession,
  });
  if (decision.allowed) {
    if (!user) return { allowed: false, reason: "authenticated_user_required" };
    return { allowed: true, user, targetUserId: decision.targetUserId };
  }
  return { allowed: false, reason: decision.reason };
}

async function resetAuthenticatedOnboardingState(input: {
  request: NextRequest;
  user: CurrentBlundrUser;
  targetUserId: string;
  scope: ResetUserScope;
  allowLocalFallback: boolean;
}) {
  const now = new Date().toISOString();
  const profileResult = await saveTrainingProfile(
    {
      userId: input.targetUserId,
      onboardingCompleted: false,
      ...createDefaultTrainingProfile(input.targetUserId, now),
      createdAt: now,
      updatedAt: now,
    },
    {
      user: input.user,
      accessToken: input.user.accessToken ?? null,
      mode: input.user.mode,
      allowLocalFallback: input.allowLocalFallback,
    },
  );

  if (!profileResult.ok) {
    return NextResponse.json(profileResult, { status: 500 });
  }

  let onboarding;
  try {
    onboarding = await resetOnboardingV11State({
      user: input.user,
      targetUserId: input.targetUserId,
    });
  } catch (error) {
    const code =
      error instanceof Error ? error.message : "onboarding_v11_reset_failed";
    return NextResponse.json({ ok: false, error: { code } }, { status: 500 });
  }

  await appendDeveloperAuditLogEntry(
    {
      actorUserId: input.user.userId ?? null,
      targetUserId: input.targetUserId,
      action: "reset_onboarding_state",
      payload: { scope: input.scope },
      createdAt: new Date().toISOString(),
    },
    {
      user: input.user,
      accessToken: input.user.accessToken ?? null,
      mode: input.user.mode,
      allowLocalFallback: input.allowLocalFallback,
    },
  );

  return NextResponse.json({
    ok: true,
    profile: profileResult.data,
    onboarding,
  });
}

async function readBody(
  request: NextRequest,
): Promise<Record<string, unknown>> {
  const contentType = normalizeText(
    request.headers.get("content-type"),
  ).toLowerCase();
  if (contentType.includes("application/json")) {
    return (await request.json().catch(() => ({}))) as Record<string, unknown>;
  }
  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await request.formData().catch(() => new FormData());
    return Object.fromEntries(formData.entries());
  }
  return (await request.json().catch(() => ({}))) as Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  const body = await readBody(request);
  const previewSelfReset = await resolvePreviewOnboardingSelfResetAccess(
    request,
    body,
  );
  if (previewSelfReset.allowed) {
    return resetAuthenticatedOnboardingState({
      request,
      user: previewSelfReset.user,
      targetUserId: previewSelfReset.targetUserId,
      scope: "onboarding",
      allowLocalFallback: false,
    });
  }

  const access = await resolveBlundrDeveloperAccess(request);
  if (!access.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "developer_access_denied", message: access.reason },
      },
      { status: 403 },
    );
  }

  const scope = normalizeResetScope(body.scope);
  const targetUserId =
    normalizeText(body.userId) || access.user?.userId || null;
  if (!targetUserId) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "missing_user", message: "A target user is required." },
      },
      { status: 400 },
    );
  }

  if (scope === "full" && access.user?.mode === "local_demo") {
    const bundle = resetLocalAccountState(targetUserId);
    const bootstrap = await bootstrapBlundrAccount({
      request,
      user: access.user,
      allowLocalFallback: true,
    });
    await appendDeveloperAuditLogEntry(
      {
        actorUserId: access.user?.userId ?? null,
        targetUserId,
        action: "reset_local_demo_user",
        payload: { bundleUpdatedAt: bundle.updatedAt },
        createdAt: new Date().toISOString(),
      },
      {
        user: access.user,
        accessToken: access.user?.accessToken ?? null,
        mode: access.user?.mode,
        allowLocalFallback: true,
      },
    );
    return NextResponse.json({
      ok: true,
      bundle,
      bootstrap: bootstrap.ok ? bootstrap.data : null,
    });
  }

  return resetAuthenticatedOnboardingState({
    request,
    user: access.user!,
    targetUserId,
    scope,
    allowLocalFallback: true,
  });
}
