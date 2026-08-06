import { NextResponse } from "next/server";
import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import { spendInventoryAndUnlock } from "@/lib/blundr/rewards/rewardAuthority";

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
  const openingId = text(body?.openingId);
  const inventoryKind = text(body?.inventoryKind);
  const idempotencyKey = text(body?.idempotencyKey);
  if (
    !openingId ||
    !idempotencyKey ||
    !["opening_fragment", "choice_token"].includes(inventoryKind)
  ) {
    return NextResponse.json(
      { error: "invalid_inventory_unlock_request" },
      { status: 400 },
    );
  }
  const result = await spendInventoryAndUnlock({
    userId: user.userId,
    openingId,
    idempotencyKey,
    inventoryKind: inventoryKind as "opening_fragment" | "choice_token",
  });
  return "code" in result
    ? NextResponse.json({ error: result.code }, { status: 409 })
    : NextResponse.json({ ok: true, data: result.data });
}
