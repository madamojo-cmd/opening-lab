import { NextRequest, NextResponse } from "next/server";

import { appendDeveloperAuditLogEntry, saveValidationSnapshot } from "@/lib/blundr/accounts/accountRepository";
import { createDailyBlundrValidationSnapshot, runDailyBlundrValidation } from "@/lib/blundr/daily/validation/dailyValidationRunner";
import { resolveBlundrDeveloperAccess } from "@/lib/blundr/backend/devAccess";

export const dynamic = "force-dynamic";

function getPersistenceError(result: { ok: true } | { ok: false; error: { code: string; message: string; cause?: unknown; retryable?: boolean } }) {
  if ("error" in result) {
    return result.error;
  }
  return { code: "persistence_error", message: "Unknown persistence error." };
}

async function handleReport(request: NextRequest, persist: boolean) {
  const access = await resolveBlundrDeveloperAccess(request);
  if (!access.allowed) {
    return NextResponse.json({ ok: false, error: { code: "developer_access_denied", message: access.reason } }, { status: 403 });
  }

  const report = runDailyBlundrValidation({ now: new Date().toISOString() });
  const response = {
    ok: true,
    access,
    report,
  };

  if (!persist) {
    return NextResponse.json(response);
  }

  const snapshot = createDailyBlundrValidationSnapshot(report, access.user?.userId ?? undefined);
  const saved = await saveValidationSnapshot(snapshot, {
    user: access.user,
    accessToken: access.user?.accessToken ?? null,
    mode: access.user?.mode,
    allowLocalFallback: true,
  });
  if (!saved.ok) {
    return NextResponse.json({ ok: false, error: getPersistenceError(saved) }, { status: 500 });
  }

  await appendDeveloperAuditLogEntry(
    {
      actorUserId: access.user?.userId ?? null,
      targetUserId: access.user?.userId ?? null,
      action: "validation_report_saved",
      payload: { snapshotId: snapshot.id, valid: report.valid },
      createdAt: new Date().toISOString(),
    },
    {
      user: access.user,
      accessToken: access.user?.accessToken ?? null,
      mode: access.user?.mode,
      allowLocalFallback: true,
    },
  );

  return NextResponse.json({ ok: true, access, report, snapshot: saved.data });
}

export async function GET(request: NextRequest) {
  return handleReport(request, false);
}

export async function POST(request: NextRequest) {
  return handleReport(request, true);
}
