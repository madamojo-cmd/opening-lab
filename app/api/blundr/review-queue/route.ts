import { NextResponse } from "next/server";

import { requireGameDataUser } from "@/lib/blundr/gameData/gameDataService";
import { parseReviewQueueQuery } from "@/lib/blundr/reviewQueue/reviewQueueModel";
import { loadReviewQueuePage } from "@/lib/blundr/reviewQueue/reviewQueueRepository.server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await requireGameDataUser(request);
  if (!user)
    return NextResponse.json(
      { ok: false, error: "authentication_required" },
      { status: 401 },
    );

  const query = parseReviewQueueQuery(new URL(request.url).searchParams);
  const result = await loadReviewQueuePage({
    userId: user.userId,
    page: query.page,
    limit: query.limit,
    includeResolved: query.includeResolved,
  });

  if (!result.ok) {
    const status =
      result.error === "invalid_request"
        ? 400
        : result.error === "feature_disabled"
          ? 503
          : 503;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }

  return NextResponse.json({ ok: true, data: result.data });
}

