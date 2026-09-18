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

  if (result.ok === false) {
    const error = result.error;
    if (
      error === "feature_disabled" ||
      error === "persistence_unavailable"
    ) {
      return NextResponse.json({
        ok: true,
        data: {
          syncState: "unavailable",
          generatedAt: new Date().toISOString(),
          lastSyncAt: null,
          page: query.page,
          limit: query.limit,
          nextPage: null,
          items: [],
          warnings: [error],
        },
      });
    }

    const status = error === "invalid_request" ? 400 : 503;
    return NextResponse.json({ ok: false, error }, { status });
  }

  return NextResponse.json({ ok: true, data: result.data });
}
