import { NextRequest, NextResponse } from "next/server";

import { getAccountPersistenceAdapter } from "@/lib/blundr/accounts/accountRepository";
import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import { validateOwnedProgressEvents } from "@/lib/blundr/repertoire/repertoireSyncValidation";
import type { RepertoireProgress } from "@/lib/blundr/repertoire/repertoireTypes";

export const dynamic = "force-dynamic";

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function isRepertoireProgress(value: unknown): value is RepertoireProgress {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof (value as RepertoireProgress).userId === "string",
  );
}

async function readBody(
  request: NextRequest,
): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentBlundrUser({
    request,
    allowLocalFallback: false,
  });
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

  if (
    normalizeText(progress.userId) &&
    normalizeText(progress.userId) !== user.userId
  ) {
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
    allowLocalFallback: false,
  });

  const rawPointEvents = Array.isArray(progress.pointEvents)
    ? progress.pointEvents
    : [];
  const rawUnlockEvents = Array.isArray(progress.unlockEvents)
    ? progress.unlockEvents
    : [];
  const eventValidation = validateOwnedProgressEvents(
    user.userId,
    rawPointEvents,
    rawUnlockEvents,
  );
  if (!eventValidation.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: eventValidation.code,
          message:
            eventValidation.code === "user_mismatch"
              ? "Progress events belong to a different user."
              : "Progress contains an invalid event.",
        },
      },
      { status: 400 },
    );
  }
  const { pointEvents, unlockEvents } = eventValidation;

  const existingResult = await adapter.getUserRepertoire(user.userId);
  if (!existingResult.ok)
    return NextResponse.json(existingResult, { status: 500 });
  if (!existingResult.data) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "repertoire_unavailable",
          message: "Complete account setup before recording progress.",
        },
      },
      { status: 409 },
    );
  }

  for (const event of pointEvents) {
    const saveResult = await adapter.appendRepertoirePointEvent(event);
    if (!saveResult.ok) {
      return NextResponse.json(saveResult, { status: 500 });
    }
  }

  for (const event of unlockEvents) {
    const saveResult = await adapter.appendRepertoireUnlockEvent(event);
    if (!saveResult.ok) {
      return NextResponse.json(saveResult, { status: 500 });
    }
  }

  const [savedPointEvents, savedUnlockEvents] = await Promise.all([
    adapter.getRepertoirePointEvents(user.userId),
    adapter.getRepertoireUnlockEvents(user.userId),
  ]);
  if (!savedPointEvents.ok)
    return NextResponse.json(savedPointEvents, { status: 500 });
  if (!savedUnlockEvents.ok)
    return NextResponse.json(savedUnlockEvents, { status: 500 });
  const earned = savedPointEvents.data.reduce(
    (total, event) => total + Math.max(0, Number(event.points) || 0),
    0,
  );
  const spent = savedUnlockEvents.data.reduce(
    (total, event) => total + Math.max(0, Number(event.pointsSpent) || 0),
    0,
  );
  const unlockedOpeningIds = Array.from(
    new Set([
      ...existingResult.data.unlockedOpeningIds,
      ...savedUnlockEvents.data.map((event) => event.openingId),
    ]),
  );
  const repertoireSave = await adapter.upsertUserRepertoire({
    ...existingResult.data,
    userId: user.userId,
    unlockedOpeningIds,
    lockedOpeningIds: existingResult.data.lockedOpeningIds.filter(
      (openingId) => !unlockedOpeningIds.includes(openingId),
    ),
    openingUnlockPoints: Math.max(0, earned - spent),
    updatedAt: progress.updatedAt,
  });
  if (!repertoireSave.ok)
    return NextResponse.json(repertoireSave, { status: 500 });

  return NextResponse.json({
    ok: true,
    data: {
      repertoire: repertoireSave.data,
      pointEventCount: pointEvents.length,
      unlockEventCount: unlockEvents.length,
    },
  });
}
