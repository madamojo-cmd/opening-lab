import { NextRequest, NextResponse } from "next/server";

import { buildStage2RuntimeBookIndex, getStage2RuntimeCandidatesForFrame, loadStage2RuntimeBook } from "@/lib/blundr/runtimeBook";
import type { Stage2RuntimeBookIndex } from "@/lib/blundr/runtimeBook";

export const dynamic = "force-dynamic";

let cachedIndex: Stage2RuntimeBookIndex | null = null;
let pendingIndex: Promise<Stage2RuntimeBookIndex> | null = null;

async function getRuntimeBookIndex(): Promise<Stage2RuntimeBookIndex> {
  if (cachedIndex) return cachedIndex;
  if (pendingIndex) return pendingIndex;
  pendingIndex = loadStage2RuntimeBook().then((loaded) => {
    const index = buildStage2RuntimeBookIndex(loaded);
    cachedIndex = index;
    pendingIndex = null;
    return index;
  });
  return pendingIndex;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const params = new URL(req.url).searchParams;
  const openingId = String(params.get("openingId") ?? "");
  const playKeyBefore = String(params.get("playKeyBefore") ?? "");

  if (!openingId || !playKeyBefore) {
    return NextResponse.json(
      {
        openingId,
        playKeyBefore,
        candidates: [],
        hasRuntimeBookCandidates: false,
        bookExhausted: true,
        reason: "missing_opening_id_or_playkey_before",
      },
      { status: 200 },
    );
  }

  try {
    const index = await getRuntimeBookIndex();
    const result = getStage2RuntimeCandidatesForFrame({ index, openingId, playKeyBefore });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        openingId,
        playKeyBefore,
        candidates: [],
        hasRuntimeBookCandidates: false,
        bookExhausted: true,
        reason: "runtime_book_query_failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
