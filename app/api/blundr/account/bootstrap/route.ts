import { NextRequest, NextResponse } from "next/server";

import { bootstrapBlundrAccount } from "@/lib/blundr/accounts/accountService";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const result = await bootstrapBlundrAccount({ request });
  if (!result.ok) {
    return NextResponse.json(result, { status: 401 });
  }
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  return GET(request);
}
