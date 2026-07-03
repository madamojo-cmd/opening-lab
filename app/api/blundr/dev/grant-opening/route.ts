import { NextRequest, NextResponse } from "next/server";

import { appendDeveloperAuditLogEntry, appendOpeningUnlockEvent, readUserRepertoire, saveOpeningUnlockProgress, saveUserRepertoire } from "@/lib/blundr/accounts/accountRepository";
import { createDefaultOpeningUnlockEvent, createDefaultOpeningUnlockProgress } from "@/lib/blundr/accounts/accountDefaults";
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
  const userId = normalizeText(body.userId) || access.user?.userId || null;
  const openingId = normalizeText(body.openingId);
  const pointsEarned = Math.max(0, Number(body.pointsEarned) || 1);
  if (!userId || !openingId) {
    return NextResponse.json({ ok: false, error: { code: "missing_input", message: "userId and openingId are required." } }, { status: 400 });
  }

  const repertoireResult = await readUserRepertoire(userId, {
    user: access.user,
    accessToken: access.user?.accessToken ?? null,
    mode: access.user?.mode,
    allowLocalFallback: true,
  });
  if (!repertoireResult.ok) {
    return NextResponse.json(repertoireResult, { status: 500 });
  }

  const repertoire = repertoireResult.data ?? {
    userId,
    unlockedOpeningIds: [],
    lockedOpeningIds: [],
    openingUnlockPoints: 0,
    updatedAt: new Date().toISOString(),
  };
  const nextUnlocked = Array.from(new Set([...repertoire.unlockedOpeningIds, openingId]));
  const nextLocked = repertoire.lockedOpeningIds.filter((id) => id !== openingId);
  const nextRepertoire = {
    ...repertoire,
    unlockedOpeningIds: nextUnlocked,
    lockedOpeningIds: nextLocked,
    openingUnlockPoints: Math.max(0, repertoire.openingUnlockPoints + pointsEarned),
    updatedAt: new Date().toISOString(),
  };

  const repertoireSave = await saveUserRepertoire(nextRepertoire, {
    user: access.user,
    accessToken: access.user?.accessToken ?? null,
    mode: access.user?.mode,
    allowLocalFallback: true,
  });
  if (!repertoireSave.ok) {
    return NextResponse.json(repertoireSave, { status: 500 });
  }

  const progressSave = await saveOpeningUnlockProgress(
    {
      ...createDefaultOpeningUnlockProgress(userId, openingId, new Date().toISOString(), Math.max(1, pointsEarned)),
      pointsEarned,
      requiredPoints: Math.max(1, pointsEarned),
      status: "unlocked",
      updatedAt: new Date().toISOString(),
    },
    {
      user: access.user,
      accessToken: access.user?.accessToken ?? null,
      mode: access.user?.mode,
      allowLocalFallback: true,
    },
  );
  if (!progressSave.ok) {
    return NextResponse.json(progressSave, { status: 500 });
  }

  const eventSave = await appendOpeningUnlockEvent(
    createDefaultOpeningUnlockEvent(userId, openingId, "manual_admin_unlock", pointsEarned, `${userId}:${openingId}:manual_admin_unlock:${Date.now()}`, new Date().toISOString()),
    {
      user: access.user,
      accessToken: access.user?.accessToken ?? null,
      mode: access.user?.mode,
      allowLocalFallback: true,
    },
  );
  if (!eventSave.ok) {
    return NextResponse.json(eventSave, { status: 500 });
  }

  await appendDeveloperAuditLogEntry(
    {
      actorUserId: access.user?.userId ?? null,
      targetUserId: userId,
      action: "grant_opening",
      payload: { openingId, pointsEarned },
      createdAt: new Date().toISOString(),
    },
    { user: access.user, accessToken: access.user?.accessToken ?? null, mode: access.user?.mode, allowLocalFallback: true },
  );

  return NextResponse.json({
    ok: true,
    repertoire: repertoireSave.data,
    openingUnlockProgress: progressSave.data,
    event: eventSave.data,
  });
}
