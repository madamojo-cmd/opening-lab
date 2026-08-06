import { NextResponse } from "next/server";
import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import { claimRewardPresentation } from "@/lib/blundr/rewards/rewardAuthority";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  const user = await getCurrentBlundrUser({
    request,
    allowLocalFallback: false,
  });
  const claimedBy = request.headers.get("x-blundr-presentation-client")?.trim();
  if (!user?.isAuthenticated)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  if (!claimedBy)
    return NextResponse.json(
      { error: "invalid_reward_presentation_claim" },
      { status: 400 },
    );
  const result = await claimRewardPresentation({
    userId: user.userId,
    claimedBy,
  });
  return "code" in result
    ? NextResponse.json({ error: result.code }, { status: 409 })
    : NextResponse.json({ ok: true, data: result.data });
}
