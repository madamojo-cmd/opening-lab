import { NextRequest, NextResponse } from "next/server";

import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import { bootstrapBlundrAccount, syncLocalDemoStateToAccount } from "@/lib/blundr/accounts/accountService";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const user = await getCurrentBlundrUser({ request, allowLocalFallback: true });
  if (!user) {
    return NextResponse.json({ ok: false, error: { code: "authentication_required", message: "A user session is required." } }, { status: 401 });
  }

  const bootstrap = await bootstrapBlundrAccount({ request, user });
  if (!bootstrap.ok) {
    return NextResponse.json(bootstrap, { status: 401 });
  }

  const sync = await syncLocalDemoStateToAccount(user.userId, {
    user,
    accessToken: user.accessToken ?? null,
    mode: user.mode,
    allowLocalFallback: true,
  });

  if (!sync.ok) {
    return NextResponse.json(sync, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    bootstrap: bootstrap.data,
    sync: sync.data,
  });
}
