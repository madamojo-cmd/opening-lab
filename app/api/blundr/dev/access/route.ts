import { NextRequest, NextResponse } from "next/server";

import { resolveBlundrDeveloperAccess } from "@/lib/blundr/backend/devAccess";
import { resolveRewardsPersistenceTarget } from "@/lib/blundr/rewards/rewardTargetModel";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const access = await resolveBlundrDeveloperAccess(request);
  const target = resolveRewardsPersistenceTarget({ env: access.env, user: access.user });
  const debug = process.env.NEXT_PUBLIC_BLUNDR_ACCOUNT_DEBUG === "1" && access.diagnostics ? access.diagnostics : undefined;
  return NextResponse.json(
    {
      ok: access.allowed,
      allowed: access.allowed,
      reason: access.reason,
      reasonCode: access.reasonCode,
      user: access.user,
      target,
      debug,
    },
    { status: access.allowed ? 200 : 401 },
  );
}

export async function POST(request: NextRequest) {
  return GET(request);
}
