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
        "Repertoire changes require a server-confirmed reward or unlock transaction.",
    },
    { status: 405, headers: { Allow: "GET" } },
  );
}
