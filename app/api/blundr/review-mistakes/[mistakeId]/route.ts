import { NextResponse } from "next/server";

import { requireGameDataUser } from "@/lib/blundr/gameData/gameDataService";
import { loadReviewMistakeSnapshot } from "@/lib/blundr/reviewQueue/reviewMistakeRepository.server";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ mistakeId: string }> },
) {
  const user = await requireGameDataUser(request);
  if (!user)
    return NextResponse.json(
      { ok: false, error: "authentication_required" },
      { status: 401 },
    );

  const { mistakeId } = await context.params;
  const result = await loadReviewMistakeSnapshot({
    userId: user.userId,
    mistakeId,
  });
  if (!result.ok) {
    const status =
      result.error === "invalid_request"
        ? 400
        : result.error === "not_found"
          ? 404
          : 503;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }

  return NextResponse.json({ ok: true, data: result.data });
}

