import { NextResponse } from "next/server";
import { requireGameDataUser } from "@/lib/blundr/gameData/gameDataService";
import { commitReviewRating } from "@/lib/blundr/review/reviewService.server";
import type { ReviewRating } from "@/lib/blundr/review/reviewContracts";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  const user = await requireGameDataUser(request);
  if (!user)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  const body = (await request.json().catch(() => null)) as {
    itemId?: string;
    attemptId?: string;
    rating?: ReviewRating;
    idempotencyId?: string;
  } | null;
  if (
    !body?.itemId ||
    !body.attemptId ||
    !body.idempotencyId ||
    !["again", "hard", "good", "easy"].includes(body.rating ?? "")
  )
    return NextResponse.json(
      { error: "invalid_review_rating" },
      { status: 400 },
    );
  try {
    return NextResponse.json(
      await commitReviewRating({
        user,
        itemId: body.itemId,
        attemptId: body.attemptId,
        rating: body.rating!,
        idempotencyId: body.idempotencyId,
      }),
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "review_unavailable" },
      { status: 409 },
    );
  }
}
