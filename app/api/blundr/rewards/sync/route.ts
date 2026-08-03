import { NextRequest, NextResponse } from "next/server";

import { getAccountPersistenceAdapter } from "@/lib/blundr/accounts/accountRepository";
import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import type { RewardRoll, UserRewardHistory } from "@/lib/blundr/accounts/accountTypes";
import { dedupeRewardRollsById } from "@/lib/blundr/rewards/rewardRollPersistence";

export const dynamic = "force-dynamic";

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function isRewardHistory(value: unknown): value is UserRewardHistory {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && typeof (value as UserRewardHistory).userId === "string");
}

function isRewardRoll(value: unknown): value is RewardRoll {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && typeof (value as RewardRoll).id === "string" && typeof (value as RewardRoll).userId === "string" && typeof (value as RewardRoll).trigger === "string");
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
  const rewardHistory = isRewardHistory(body.rewardHistory) ? body.rewardHistory : null;
  const rewardRolls = dedupeRewardRollsById(
    Array.isArray(body.rewardRolls) ? body.rewardRolls.filter(isRewardRoll) : [],
  );

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

  if (
    rewardRolls.some(
      (roll) => normalizeText(roll.userId) !== user.userId,
    )
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "user_mismatch",
          message: "Reward rolls belong to a different user.",
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

  let savedRewardHistory: UserRewardHistory | null = null;
  if (rewardHistory) {
    const historySave = await adapter.upsertRewardHistory({
      ...rewardHistory,
      userId: user.userId,
    });
    if (!historySave.ok) {
      return NextResponse.json(historySave, { status: 500 });
    }
    savedRewardHistory = historySave.data;
  }

  const savedRewardRolls: RewardRoll[] = [];
  for (const roll of rewardRolls) {
    const saveResult = await adapter.appendRewardRoll({
      ...roll,
      userId: user.userId,
    });
    if (!saveResult.ok) {
      return NextResponse.json(saveResult, { status: 500 });
    }
    savedRewardRolls.push(saveResult.data);
  }

  return NextResponse.json({
    ok: true,
    data: {
      rewardHistory: savedRewardHistory,
      rewardRolls: savedRewardRolls,
      rewardRollCount: savedRewardRolls.length,
    },
  });
}
