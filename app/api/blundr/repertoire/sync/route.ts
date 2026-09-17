import { NextResponse } from "next/server";

import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentBlundrUser({
    request,
    allowLocalFallback: false,
  });
  if (!user?.isAuthenticated)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  return NextResponse.json(
    {
      error: "client_authored_repertoire_disabled",
      message:
        "This opening must be unlocked before it can be added to your repertoire.",
    },
    { status: 405, headers: { Allow: "GET" } },
  );
}
