import { NextResponse } from "next/server";
import { requireGameDataUser } from "@/lib/blundr/gameData/gameDataService";
import { commitReviewAttempt } from "@/lib/blundr/review/reviewService.server";
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
    playedMoveUci?: string;
    reveal?: boolean;
  } | null;
  if (
    !body?.itemId ||
    !body.attemptId ||
    !!body.playedMoveUci === !!body.reveal
  )
    return NextResponse.json(
      { error: "invalid_review_attempt" },
      { status: 400 },
    );
  try {
    return NextResponse.json(
      await commitReviewAttempt({
        user,
        itemId: body.itemId,
        attemptId: body.attemptId,
        playedMoveUci: body.playedMoveUci,
        reveal: body.reveal,
      }),
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "review_unavailable" },
      { status: 409 },
    );
  }
}
