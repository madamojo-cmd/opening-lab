import { NextRequest, NextResponse } from "next/server";

import { saveTrainingProfile } from "@/lib/blundr/accounts/accountRepository";
import { bootstrapBlundrAccount } from "@/lib/blundr/accounts/accountService";
import { createDefaultTrainingProfile } from "@/lib/blundr/accounts/accountDefaults";
import { resetLocalAccountState } from "@/lib/blundr/accounts/localAccountStorage";
import { appendDeveloperAuditLogEntry } from "@/lib/blundr/accounts/accountRepository";
import { resolveBlundrDeveloperAccess } from "@/lib/blundr/backend/devAccess";

export const dynamic = "force-dynamic";

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

async function readBody(request: NextRequest): Promise<Record<string, unknown>> {
  const contentType = normalizeText(request.headers.get("content-type")).toLowerCase();
  if (contentType.includes("application/json")) {
    return (await request.json().catch(() => ({}))) as Record<string, unknown>;
  }
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const formData = await request.formData().catch(() => new FormData());
    return Object.fromEntries(formData.entries());
  }
  return (await request.json().catch(() => ({}))) as Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  const access = await resolveBlundrDeveloperAccess(request);
  if (!access.allowed) {
    return NextResponse.json({ ok: false, error: { code: "developer_access_denied", message: access.reason } }, { status: 403 });
  }

  const body = await readBody(request);
  const scope = normalizeText(body.scope) === "local_demo" || normalizeText(body.scope) === "full" ? normalizeText(body.scope) : "onboarding";
  const targetUserId = normalizeText(body.userId) || access.user?.userId || null;
  if (!targetUserId) {
    return NextResponse.json({ ok: false, error: { code: "missing_user", message: "A target user is required." } }, { status: 400 });
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
      { user: access.user, accessToken: access.user?.accessToken ?? null, mode: access.user?.mode, allowLocalFallback: true },
    );
    return NextResponse.json({ ok: true, bundle, bootstrap: bootstrap.ok ? bootstrap.data : null });
  }

  const now = new Date().toISOString();
  const profileResult = await saveTrainingProfile(
    {
      userId: targetUserId,
      onboardingCompleted: false,
      ...createDefaultTrainingProfile(targetUserId, now),
      createdAt: now,
      updatedAt: now,
    },
    { user: access.user, accessToken: access.user?.accessToken ?? null, mode: access.user?.mode, allowLocalFallback: true },
  );

  if (!profileResult.ok) {
    return NextResponse.json(profileResult, { status: 500 });
  }

  await appendDeveloperAuditLogEntry(
    {
      actorUserId: access.user?.userId ?? null,
      targetUserId,
      action: "reset_onboarding_state",
      payload: { scope },
      createdAt: new Date().toISOString(),
    },
    { user: access.user, accessToken: access.user?.accessToken ?? null, mode: access.user?.mode, allowLocalFallback: true },
  );

  return NextResponse.json({ ok: true, profile: profileResult.data });
}
