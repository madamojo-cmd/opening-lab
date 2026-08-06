import { NextResponse } from "next/server";
import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import { markRewardPresentation } from "@/lib/blundr/rewards/rewardAuthority";
export const dynamic = "force-dynamic";
const text = (value: unknown) => String(value ?? "").trim();
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
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const presentationId = text(body?.presentationId),
    claimedBy = text(body?.claimedBy),
    action = text(body?.action);
  if (
    !presentationId ||
    !claimedBy ||
    !["rendered", "acknowledged", "dismissed"].includes(action)
  )
    return NextResponse.json(
      { error: "invalid_reward_presentation_action" },
      { status: 400 },
    );
  const result = await markRewardPresentation({
    userId: user.userId,
    presentationId,
    claimedBy,
    action: action as "rendered" | "acknowledged" | "dismissed",
  });
  return "code" in result
    ? NextResponse.json({ error: result.code }, { status: 409 })
    : NextResponse.json({ ok: true, data: result.data });
}
