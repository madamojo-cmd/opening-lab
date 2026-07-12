import { NextRequest, NextResponse } from "next/server";

import { getAccountPersistenceAdapter } from "@/lib/blundr/accounts/accountRepository";
import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import { normalizeRepertoirePointEvent, normalizeRepertoireUnlockEvent } from "@/lib/blundr/repertoire/repertoireEvents";
import type { RepertoirePointEvent, RepertoireProgress, RepertoireUnlockEvent } from "@/lib/blundr/repertoire/repertoireTypes";

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

export function rebasePointEventOwnership(event: RepertoirePointEvent, userId: string): RepertoirePointEvent {
  return {
    ...event,
    userId,
  };
}

export function rebaseUnlockEventOwnership(event: RepertoireUnlockEvent, userId: string): RepertoireUnlockEvent {
  return {
    ...event,
    userId,
  };
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

  const normalizedProgress: RepertoireProgress = {
    ...progress,
    userId: user.userId,
  };

  const adapter = getAccountPersistenceAdapter({
    user,
    accessToken: user.accessToken ?? null,
    mode: user.mode,
    allowLocalFallback: true,
  });

  const repertoireSave = await adapter.upsertUserRepertoire({
    userId: user.userId,
    selectedStarterPackId: normalizedProgress.selectedStarterPackId,
    unlockedOpeningIds: Array.isArray(normalizedProgress.unlockedOpeningIds) ? normalizedProgress.unlockedOpeningIds.slice() : [],
    lockedOpeningIds: Array.isArray(normalizedProgress.lockedOpeningIds) ? normalizedProgress.lockedOpeningIds.slice() : [],
    openingUnlockPoints: Math.max(0, Number(normalizedProgress.availablePoints) || 0),
    updatedAt: normalizedProgress.updatedAt,
  });
  if (!repertoireSave.ok) {
    return NextResponse.json(repertoireSave, { status: 500 });
  }

  const pointEvents = Array.isArray(normalizedProgress.pointEvents) ? normalizedProgress.pointEvents : [];
  for (const rawEvent of pointEvents) {
    const event = normalizeRepertoirePointEvent(rawEvent);
    if (!event) continue;
    const saveResult = await adapter.appendRepertoirePointEvent(rebasePointEventOwnership(event, user.userId));
    if (!saveResult.ok) {
      return NextResponse.json(saveResult, { status: 500 });
    }
  }

  const unlockEvents = Array.isArray(normalizedProgress.unlockEvents) ? normalizedProgress.unlockEvents : [];
  for (const rawEvent of unlockEvents) {
    const event = normalizeRepertoireUnlockEvent(rawEvent);
    if (!event) continue;
    const saveResult = await adapter.appendRepertoireUnlockEvent(rebaseUnlockEventOwnership(event, user.userId));
    if (!saveResult.ok) {
      return NextResponse.json(saveResult, { status: 500 });
    }
  }

  return NextResponse.json({
    ok: true,
    data: {
      repertoire: repertoireSave.data,
      progress: normalizedProgress,
      pointEventCount: pointEvents.length,
      unlockEventCount: unlockEvents.length,
    },
  });
}
