import { NextRequest, NextResponse } from "next/server";

import { resolveBlundrDeveloperAccess } from "@/lib/blundr/backend/devAccess";
import { buildGameDataHealthReport } from "@/lib/blundr/data/gameDataHealth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const access = await resolveBlundrDeveloperAccess(request);
  if (!access.allowed) {
    return NextResponse.json({ ok: false, error: { code: "developer_access_denied", message: access.reason } }, { status: 403 });
  }

  const report = await buildGameDataHealthReport();
  return NextResponse.json({
    ok: true,
    access,
    report,
  });
}
