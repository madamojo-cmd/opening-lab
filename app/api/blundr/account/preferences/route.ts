import { NextResponse } from "next/server";

import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import {
  readOwnedTrainingPreferences,
  updateOwnedTrainingPreferences,
} from "@/lib/blundr/accounts/trainingPreferences.server";
import { validateTrainingPreferencesPatch } from "@/lib/blundr/accounts/trainingPreferences";
import { ProductionDailyRepository } from "@/lib/blundr/daily/productionDailyRepository.server";
import { getLocalDateKeyForTimeZone } from "@/lib/blundr/daily-rings/dailyRingDate";
import { resolveCommercialAccess } from "@/lib/blundr/commercial/commercialAccess.server";
import { FREE_DAILY_BLUNDR_CARD_LIMIT } from "@/lib/blundr/commercial/commercialAccess";

export const dynamic = "force-dynamic";

async function authenticatedUser(request: Request) {
  const user = await getCurrentBlundrUser({
    request,
    allowLocalFallback: false,
  });
  return user?.isAuthenticated ? user : null;
}

export async function GET(request: Request) {
  const user = await authenticatedUser(request);
  if (!user)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  try {
    return NextResponse.json({
      ok: true,
      data: await readOwnedTrainingPreferences(user),
    });
  } catch {
    return NextResponse.json(
      {
        error: "training_preferences_unavailable",
        message: "Training preferences could not be loaded.",
      },
      { status: 503 },
    );
  }
}

export async function PATCH(request: Request) {
  const user = await authenticatedUser(request);
  if (!user)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  const validation = validateTrainingPreferencesPatch(
    await request.json().catch(() => null),
  );
  if (validation.ok === false)
    return NextResponse.json(
      { error: validation.code, message: validation.message },
      { status: 422 },
    );
  if (validation.patch.dailyBlundrCardGoal !== undefined) {
    const access = await resolveCommercialAccess({ userId: user.userId });
    if (
      access.plan !== "pro" &&
      validation.patch.dailyBlundrCardGoal > FREE_DAILY_BLUNDR_CARD_LIMIT
    ) {
      return NextResponse.json(
        {
          error: "daily_card_goal_requires_pro",
          message: "Free plans can set up to 5 Daily cards.",
        },
        { status: 403 },
      );
    }
  }
  try {
    const next = await updateOwnedTrainingPreferences(user, validation.patch);
    const dateKey = getLocalDateKeyForTimeZone(new Date(), next.timeZone);
    let reservedToday = false;
    if (validation.patch.dailyBlundrCardGoal !== undefined) {
      try {
        reservedToday = Boolean(
          await new ProductionDailyRepository().getByDate(user.userId, dateKey),
        );
      } catch {
        reservedToday = false;
      }
    }
    return NextResponse.json({
      ok: true,
      data: next,
      effective: {
        dailyBlundrCardGoal: reservedToday ? "next_local_day" : "today",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: "training_preferences_unavailable",
        message: "Training preferences could not be saved.",
      },
      { status: 503 },
    );
  }
}
