import { NextResponse } from "next/server";

import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import { resolveCommercialAccess } from "@/lib/blundr/commercial/commercialAccess.server";
import { sanitizeCommercialAccess } from "@/lib/blundr/commercial/commercialAccess";

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
  const access = await resolveCommercialAccess({ userId: user.userId });
  return NextResponse.json({ ok: true, data: sanitizeCommercialAccess(access) });
}
