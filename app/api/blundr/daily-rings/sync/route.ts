import { NextRequest, NextResponse } from "next/server";

import { getAccountPersistenceAdapter } from "@/lib/blundr/accounts/accountRepository";
import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import type {
  DailyRetentionProgress,
  StreakRecord,
} from "@/lib/blundr/accounts/accountTypes";

export const dynamic = "force-dynamic";

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function isDailyRetentionProgress(
  value: unknown,
): value is DailyRetentionProgress {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof (value as DailyRetentionProgress).userId === "string" &&
      typeof (value as DailyRetentionProgress).localDate === "string",
  );
}

function isStreakRecord(value: unknown): value is StreakRecord {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof (value as StreakRecord).userId === "string",
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
  const dayRecord = isDailyRetentionProgress(body.dayRecord)
    ? body.dayRecord
    : null;
  const streakRecord = isStreakRecord(body.streakRecord)
    ? body.streakRecord
    : null;
  if (!dayRecord || !streakRecord) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "missing_progress",
          message: "Daily ring progress and streak record are required.",
        },
      },
      { status: 400 },
    );
  }

  if (
    normalizeText(dayRecord.userId) &&
    normalizeText(dayRecord.userId) !== user.userId
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "user_mismatch",
          message: "Daily ring progress belongs to a different user.",
        },
      },
      { status: 400 },
    );
  }

  if (
    normalizeText(streakRecord.userId) &&
    normalizeText(streakRecord.userId) !== user.userId
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "user_mismatch",
          message: "Streak record belongs to a different user.",
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

  const progressSave = await adapter.upsertDailyRetentionProgress({
    ...dayRecord,
    userId: user.userId,
  });
  if (!progressSave.ok) {
    return NextResponse.json(progressSave, { status: 500 });
  }

  const streakSave = await adapter.upsertStreakRecord({
    ...streakRecord,
    userId: user.userId,
  });
  if (!streakSave.ok) {
    return NextResponse.json(streakSave, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    data: {
      dailyRetentionProgress: progressSave.data,
      streakRecord: streakSave.data,
    },
  });
}
