import { NextRequest, NextResponse } from "next/server";

import { getAccountPersistenceAdapter } from "@/lib/blundr/accounts/accountRepository";
import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import type { RewardRoll, UserRewardHistory } from "@/lib/blundr/accounts/accountTypes";

export const dynamic = "force-dynamic";

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function isRewardHistory(value: unknown): value is UserRewardHistory {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && typeof (value as UserRewardHistory).userId === "string");
}

function isRewardRoll(value: unknown): value is RewardRoll {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && typeof (value as RewardRoll).userId === "string" && typeof (value as RewardRoll).trigger === "string");
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
  const user = await getCurrentBlundrUser({ request, allowLocalFallback: true });
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
  const rewardHistory = isRewardHistory(body.rewardHistory) ? body.rewardHistory : null;
  const rewardRolls = Array.isArray(body.rewardRolls) ? body.rewardRolls.filter(isRewardRoll) : [];

  if (rewardHistory && normalizeText(rewardHistory.userId) && normalizeText(rewardHistory.userId) !== user.userId) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "user_mismatch",
          message: "Reward history belongs to a different user.",
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

  if (rewardHistory) {
    const historySave = await adapter.upsertRewardHistory({
      ...rewardHistory,
      userId: user.userId,
    });
    if (!historySave.ok) {
      return NextResponse.json(historySave, { status: 500 });
    }
  }

  let savedCount = 0;
  for (const roll of rewardRolls) {
    const saveResult = await adapter.appendRewardRoll({
      ...roll,
      userId: user.userId,
    });
    if (!saveResult.ok) {
      return NextResponse.json(saveResult, { status: 500 });
    }
    savedCount += 1;
  }

  return NextResponse.json({
    ok: true,
    data: {
      rewardHistory: rewardHistory ? { ...rewardHistory, userId: user.userId } : null,
      rewardRollCount: savedCount,
    },
  });
}
