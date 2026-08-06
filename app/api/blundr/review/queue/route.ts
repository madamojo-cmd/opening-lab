import { NextResponse } from "next/server";
import { requireGameDataUser } from "@/lib/blundr/gameData/gameDataService";
import { getReviewQueue } from "@/lib/blundr/review/reviewService.server";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const user = await requireGameDataUser(request);
  if (!user)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  try {
    return NextResponse.json(await getReviewQueue(user));
  } catch {
    return NextResponse.json({ error: "review_unavailable" }, { status: 503 });
  }
}
