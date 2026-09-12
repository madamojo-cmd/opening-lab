import { NextResponse } from "next/server";

import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import { buildAccountDataExport } from "@/lib/blundr/accounts/accountDataRights.server";
import { emitBlundrOperationalEvent } from "@/lib/blundr/telemetry/operationalTelemetry.server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getCurrentBlundrUser({
    request,
    allowLocalFallback: false,
  });
  if (!user?.isAuthenticated) {
    return NextResponse.json(
      { ok: false, error: { code: "authentication_required" } },
      { status: 401 },
    );
  }
  try {
    const data = await buildAccountDataExport({
      userId: user.userId,
      email: user.email,
    });
    await emitBlundrOperationalEvent("account_export_created", {
      sectionCount: data.sections.length,
    });
    return NextResponse.json(
      { ok: true, data },
      {
        headers: {
          "content-disposition":
            'attachment; filename="blundr-account-export.json"',
        },
      },
    );
  } catch {
    await emitBlundrOperationalEvent("account_export_failed", {
      code: "account_export_unavailable",
    });
    return NextResponse.json(
      { ok: false, error: { code: "account_export_unavailable" } },
      { status: 503 },
    );
  }
}
