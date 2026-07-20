import { NextRequest, NextResponse } from "next/server";

import { getAccountPersistenceAdapter } from "@/lib/blundr/accounts/accountRepository";
import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import { normalizeRepertoirePointEvent, normalizeRepertoireUnlockEvent } from "@/lib/blundr/repertoire/repertoireEvents";
import type { RepertoireProgress } from "@/lib/blundr/repertoire/repertoireTypes";

export const dynamic = "force-dynamic";

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function isRepertoireProgress(value: unknown): value is RepertoireProgress {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && typeof (value as RepertoireProgress).userId === "string");
}

async function readBody(request: NextRequest): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentBlundrUser({ request, allowLocalFallback: false });
  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "authentication_required",
          message: "A user session is required.",
        },
      },
      { status: 401 },
    );
  }

  const body = await readBody(request);
  const progress = isRepertoireProgress(body.progress) ? body.progress : null;
  if (!progress) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "missing_progress",
          message: "Repertoire progress is required.",
        },
      },
      { status: 400 },
    );
  }

  if (normalizeText(progress.userId) && normalizeText(progress.userId) !== user.userId) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "user_mismatch",
          message: "Progress belongs to a different user.",
        },
      },
      { status: 400 },
    );
  }

  const adapter = getAccountPersistenceAdapter({
    user,
    accessToken: user.accessToken ?? null,
    mode: user.mode,
    allowLocalFallback: true,
  });

  const repertoireSave = await adapter.upsertUserRepertoire({
    userId: user.userId,
    selectedStarterPackId: progress.selectedStarterPackId,
    unlockedOpeningIds: Array.isArray(progress.unlockedOpeningIds) ? progress.unlockedOpeningIds.slice() : [],
    lockedOpeningIds: Array.isArray(progress.lockedOpeningIds) ? progress.lockedOpeningIds.slice() : [],
    openingUnlockPoints: Math.max(0, Number(progress.availablePoints) || 0),
    updatedAt: progress.updatedAt,
  });
  if (!repertoireSave.ok) {
    return NextResponse.json(repertoireSave, { status: 500 });
  }

  const pointEvents = Array.isArray(progress.pointEvents) ? progress.pointEvents : [];
  for (const rawEvent of pointEvents) {
    const event = normalizeRepertoirePointEvent(rawEvent);
    if (!event) continue;
    const saveResult = await adapter.appendRepertoirePointEvent(event);
    if (!saveResult.ok) {
      return NextResponse.json(saveResult, { status: 500 });
    }
  }

  const unlockEvents = Array.isArray(progress.unlockEvents) ? progress.unlockEvents : [];
  for (const rawEvent of unlockEvents) {
    const event = normalizeRepertoireUnlockEvent(rawEvent);
    if (!event) continue;
    const saveResult = await adapter.appendRepertoireUnlockEvent(event);
    if (!saveResult.ok) {
      return NextResponse.json(saveResult, { status: 500 });
    }
  }

  return NextResponse.json({
    ok: true,
    data: {
      repertoire: repertoireSave.data,
      pointEventCount: pointEvents.length,
      unlockEventCount: unlockEvents.length,
    },
  });
}
