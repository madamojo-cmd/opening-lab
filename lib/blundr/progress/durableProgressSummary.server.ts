// server-only: do not import into client components.

import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";
import { normalizeStarterPackId } from "@/lib/blundr/accounts/accountDefaults";
import { getDefaultStarterPack } from "@/lib/blundr/onboarding/starterPacks";
import { getStage2OpeningAvailability } from "@/lib/blundr/openings/openingAvailability";
import {
  getNextUnlockCost,
  getUnlockProgressPct,
} from "@/lib/blundr/repertoire/repertoireUnlockCurve";
import type { BlundrProgressSummary } from "./progressTypes";

type Row = Record<string, unknown>;

function number(value: unknown): number {
  return Math.max(0, Number(value) || 0);
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? Array.from(
        new Set(value.map((item) => String(item ?? "").trim()).filter(Boolean)),
      )
    : [];
}

function addDays(dateKey: string, offset: number): string {
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function dayFromTimestamp(value: unknown): string {
  const parsed = new Date(String(value ?? ""));
  return Number.isFinite(parsed.valueOf())
    ? parsed.toISOString().slice(0, 10)
    : "";
}

function openingName(openingId: string | null): string | null {
  if (!openingId) return null;
  return getStage2OpeningAvailability(openingId)?.displayName ?? openingId;
}

function countBy<T>(
  items: readonly T[],
  predicate: (item: T) => boolean,
): number {
  return items.reduce((total, item) => total + (predicate(item) ? 1 : 0), 0);
}

function ensureQuery(result: { error: unknown }, label: string): void {
  if (result.error) throw new Error(`progress_${label}_unavailable`);
}

async function loadDailyCardsCompletedToday(input: {
  admin: ReturnType<typeof createBlundrSupabaseAdminClient>;
  userId: string;
  todayDateKey: string;
}): Promise<number> {
  const { admin, userId, todayDateKey } = input;
  if (!admin) throw new Error("progress_persistence_unavailable");

  const decksResult = await admin
    .from("blundr_daily_decks")
    .select("deck_id")
    .eq("user_id", userId)
    .eq("local_date", todayDateKey);
  if (decksResult.error) throw new Error("progress_daily_decks_unavailable");

  const deckIds = (decksResult.data ?? [])
    .map((row: Row) => String(row.deck_id ?? "").trim())
    .filter(Boolean);
  if (!deckIds.length) return 0;

  const sessionsQuery = admin
    .from("blundr_daily_sessions")
    .select("session_id,deck_id")
    .eq("user_id", userId);
  const sessionsResult =
    deckIds.length === 1
      ? await sessionsQuery.eq("deck_id", deckIds[0])
      : await sessionsQuery.in("deck_id", deckIds);
  if (sessionsResult.error)
    throw new Error("progress_daily_sessions_unavailable");

  const sessionIds = (sessionsResult.data ?? [])
    .map((row: Row) => String(row.session_id ?? "").trim())
    .filter(Boolean);
  if (!sessionIds.length) return 0;

  const evidenceResult = await admin
    .from("blundr_daily_task_evidence_v3")
    .select("card_fingerprint,session_id,outcome")
    .eq("user_id", userId)
    .eq("outcome", "correct")
    .in("session_id", sessionIds);
  if (evidenceResult.error)
    throw new Error("progress_daily_task_evidence_unavailable");

  return Array.from(
    new Set(
      (evidenceResult.data ?? [])
        .map((row: Row) => String(row.card_fingerprint ?? "").trim())
        .filter(Boolean),
    ),
  ).length;
}

async function loadReservedDailyCardTarget(input: {
  admin: ReturnType<typeof createBlundrSupabaseAdminClient>;
  userId: string;
  todayDateKey: string;
}): Promise<number | null> {
  const { admin, userId, todayDateKey } = input;
  if (!admin) throw new Error("progress_persistence_unavailable");

  const deckResult = await admin
    .from("blundr_daily_decks")
    .select("deck_id,public_cards")
    .eq("user_id", userId)
    .eq("local_date", todayDateKey)
    .maybeSingle();
  if (deckResult.error) throw new Error("progress_daily_decks_unavailable");
  if (!deckResult.data) return null;

  const sessionResult = await admin
    .from("blundr_daily_sessions")
    .select("session_id")
    .eq("user_id", userId)
    .eq("deck_id", String((deckResult.data as Row).deck_id ?? ""))
    .maybeSingle();
  if (sessionResult.error)
    throw new Error("progress_daily_sessions_unavailable");
  if (!sessionResult.data) return null;

  const publicCards = (deckResult.data as Row).public_cards;
  return Array.isArray(publicCards) ? Math.max(1, publicCards.length) : null;
}

export async function loadDurableProgressSummary(input: {
  userId: string;
  todayDateKey: string;
}): Promise<BlundrProgressSummary> {
  const admin = createBlundrSupabaseAdminClient();
  if (!admin) throw new Error("progress_persistence_unavailable");
  const generatedAt = new Date().toISOString();
  const week = Array.from({ length: 7 }, (_, index) =>
    addDays(input.todayDateKey, index - 6),
  );
  const weekStart = week[0];
  const weekStartIso = `${weekStart}T00:00:00.000Z`;

  const [
    profile,
    repertoire,
    streak,
    days,
    grants,
    learning,
    weaknesses,
    dailyAttempts,
    minigames,
    rewardRolls,
  ] = await Promise.all([
    admin
      .from("blundr_user_profiles")
      .select(
        "daily_tempo_goal,daily_battery_goal,daily_blundr_goal,daily_blundr_card_goal,selected_starter_pack_id",
      )
      .eq("user_id", input.userId)
      .maybeSingle(),
    admin
      .from("blundr_user_repertoires")
      .select(
        "selected_starter_pack_id,unlocked_opening_ids,locked_opening_ids,opening_unlock_points,updated_at",
      )
      .eq("user_id", input.userId)
      .maybeSingle(),
    admin
      .from("blundr_streak_records")
      .select(
        "current_streak,longest_streak,total_all_rings_closed_days,last_completed_local_date,updated_at",
      )
      .eq("user_id", input.userId)
      .maybeSingle(),
    admin
      .from("blundr_daily_retention_progress")
      .select(
        "local_date,daily_tempo_goal,daily_tempo_progress,daily_tempo_completed,daily_battery_goal,daily_battery_progress,daily_battery_completed,daily_blundr_goal,daily_blundr_progress,daily_blundr_completed,all_rings_closed,xp_earned,opening_points_earned,updated_at",
      )
      .eq("user_id", input.userId)
      .gte("local_date", weekStart)
      .lte("local_date", input.todayDateKey),
    admin
      .from("blundr_completion_grants")
      .select(
        "completion_id,source,local_date,opening_id,repertoire_points,reward_points,xp,created_at",
      )
      .eq("user_id", input.userId)
      .gte("local_date", weekStart)
      .lte("local_date", input.todayDateKey),
    admin
      .from("blundr_learning_events")
      .select(
        "event_id,taxonomy,opening_id,source,first_attempt,occurred_at,deleted_at",
      )
      .eq("user_id", input.userId)
      .gte("occurred_at", weekStartIso)
      .is("deleted_at", null),
    admin
      .from("blundr_weakness_projection")
      .select("opening_id,score,confidence,source_event_ids,updated_at")
      .eq("user_id", input.userId)
      .eq("access_decision", "active")
      .order("score", { ascending: false })
      .limit(50),
    admin
      .from("blundr_daily_attempts")
      .select("attempt_id,created_at,outcome,first_attempt")
      .eq("user_id", input.userId)
      .gte("created_at", weekStartIso),
    admin
      .from("blundr_minigame_instances")
      .select("instance_id,mini_game_id,first_attempt,updated_at")
      .eq("user_id", input.userId)
      .gte("updated_at", weekStartIso),
    admin
      .from("blundr_reward_rolls")
      .select("id,rolled_at,did_reward")
      .eq("user_id", input.userId)
      .gte("rolled_at", weekStartIso),
  ]);

  for (const [result, label] of [
    [profile, "profile"],
    [repertoire, "repertoire"],
    [streak, "streak"],
    [days, "daily"],
    [grants, "grants"],
    [learning, "learning"],
    [weaknesses, "weaknesses"],
    [dailyAttempts, "attempts"],
    [minigames, "minigames"],
    [rewardRolls, "rewards"],
  ] as const)
    ensureQuery(result, label);

  const profileRow = (profile.data ?? {}) as Row;
  const repertoireRow = (repertoire.data ?? {}) as Row;
  const streakRow = (streak.data ?? {}) as Row;
  const dayRows = (days.data ?? []) as Row[];
  const grantRows = (grants.data ?? []) as Row[];
  const learningRows = (learning.data ?? []) as Row[];
  const weaknessRows = (weaknesses.data ?? []) as Row[];
  const attemptRows = (dailyAttempts.data ?? []) as Row[];
  const minigameRows = (minigames.data ?? []) as Row[];
  const rewardRows = (rewardRolls.data ?? []) as Row[];
  const today =
    dayRows.find((row) => String(row.local_date) === input.todayDateKey) ?? {};
  const [cardsCompletedToday, reservedDailyCardTarget] = await Promise.all([
    loadDailyCardsCompletedToday({
      admin,
      userId: input.userId,
      todayDateKey: input.todayDateKey,
    }),
    loadReservedDailyCardTarget({
      admin,
      userId: input.userId,
      todayDateKey: input.todayDateKey,
    }),
  ]);
  const dailyBlundrCardGoal = Math.max(
    1,
    Math.min(
      99,
      Number(reservedDailyCardTarget ?? profileRow.daily_blundr_card_goal) ||
        10,
    ),
  );

  const ring = (
    id: "daily_tempo" | "daily_battery" | "daily_blundr",
    label: string,
    prefix: string,
    defaultGoal: number,
  ) => {
    const goal = Math.max(
      1,
      Number(today[`${prefix}_goal`] ?? profileRow[`${prefix}_goal`]) ||
        defaultGoal,
    );
    const progress = number(today[`${prefix}_progress`]);
    return {
      ringId: id,
      label,
      progress,
      goal,
      percent: Math.min(100, Math.round((progress / goal) * 100)),
      closed: Boolean(today[`${prefix}_completed`]),
    };
  };
  const rings = [
    ring("daily_tempo", "Daily Tempo", "daily_tempo", 10),
    ring("daily_battery", "Daily Battery", "daily_battery", 3),
    {
      ringId: "daily_blundr" as const,
      label: "Daily Blundr",
      progress: cardsCompletedToday,
      goal: dailyBlundrCardGoal,
      percent: Math.min(
        100,
        Math.round(
          (Math.min(cardsCompletedToday, dailyBlundrCardGoal) /
            dailyBlundrCardGoal) *
            100,
        ),
      ),
      closed: cardsCompletedToday >= dailyBlundrCardGoal,
    },
  ];
  const todayClosed = rings.every((item) => item.closed);

  const grantOn = (row: Row, date: string, source?: string) =>
    String(row.local_date) === date && (!source || row.source === source);
  const weekGrid = week.map((localDate) => {
    const day = dayRows.find((row) => String(row.local_date) === localDate);
    const reviewCount = countBy(
      attemptRows,
      (row) => dayFromTimestamp(row.created_at) === localDate,
    );
    const completionCount = countBy(
      grantRows,
      (row) => String(row.local_date) === localDate,
    );
    return {
      localDate,
      label: localDate.slice(5),
      hasTraining:
        completionCount > 0 ||
        reviewCount > 0 ||
        Boolean(day?.all_rings_closed),
      allRingsClosed: Boolean(day?.all_rings_closed),
      reviewCount,
    };
  });

  const firstAttemptTrain = learningRows.filter(
    (row) =>
      row.source === "train" &&
      row.first_attempt &&
      ["move_correct", "move_incorrect"].includes(String(row.taxonomy)),
  );
  const todayAttempts = firstAttemptTrain.filter(
    (row) => dayFromTimestamp(row.occurred_at) === input.todayDateKey,
  );
  const correct = countBy(
    todayAttempts,
    (row) => row.taxonomy === "move_correct",
  );
  const incorrect = countBy(
    todayAttempts,
    (row) => row.taxonomy === "move_incorrect",
  );
  const accuracyTotal = correct + incorrect;
  const accuracyPct = accuracyTotal
    ? Math.round((correct / accuracyTotal) * 100)
    : null;

  const trainedByOpening = new Map<string, number>();
  for (const row of grantRows) {
    const id = String(row.opening_id ?? "").trim();
    if (id) trainedByOpening.set(id, (trainedByOpening.get(id) ?? 0) + 1);
  }
  const mostTrainedOpeningId =
    Array.from(trainedByOpening.entries()).sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    )[0]?.[0] ?? null;

  const weakByOpening = new Map<string, { misses: number; score: number }>();
  for (const row of weaknessRows) {
    const id = String(row.opening_id ?? "").trim();
    if (!id) continue;
    const current = weakByOpening.get(id) ?? { misses: 0, score: 0 };
    current.misses += Math.max(1, strings(row.source_event_ids).length);
    current.score = Math.max(current.score, Number(row.score) || 0);
    weakByOpening.set(id, current);
  }
  const weakItems = Array.from(weakByOpening.entries())
    .sort((a, b) => b[1].score - a[1].score || b[1].misses - a[1].misses)
    .slice(0, 4)
    .map(([openingId, value]) => ({
      openingId,
      openingName: openingName(openingId) ?? openingId,
      misses: value.misses,
    }));

  const unlockedOpeningIds = strings(repertoireRow.unlocked_opening_ids);
  const lockedOpeningIds = strings(repertoireRow.locked_opening_ids);
  const selectedStarterPackId =
    normalizeStarterPackId(
      repertoireRow.selected_starter_pack_id ??
        profileRow.selected_starter_pack_id,
    ) ?? getDefaultStarterPack().id;
  const availablePoints = number(repertoireRow.opening_unlock_points);
  const unlockShape = {
    selectedStarterPackId,
    unlockedOpeningIds,
    lockedOpeningIds,
    availablePoints,
  };
  const nextUnlockCost = getNextUnlockCost(unlockShape);
  const recommendedOpeningId =
    lockedOpeningIds[0] ?? unlockedOpeningIds[0] ?? null;

  const openingToday = countBy(grantRows, (row) =>
    grantOn(row, input.todayDateKey, "opening_run_completed"),
  );
  const batteryToday = countBy(grantRows, (row) =>
    grantOn(row, input.todayDateKey, "continuation_completed"),
  );
  const dailyToday = countBy(grantRows, (row) =>
    grantOn(row, input.todayDateKey, "daily_blundr_deck_completed"),
  );
  const reviewToday = countBy(
    attemptRows,
    (row) => dayFromTimestamp(row.created_at) === input.todayDateKey,
  );
  const minigamesToday = countBy(
    minigameRows,
    (row) =>
      dayFromTimestamp(row.updated_at) === input.todayDateKey &&
      Boolean(row.first_attempt),
  );

  const recentActivity: BlundrProgressSummary["recentActivity"] = [];
  if (openingToday)
    recentActivity.push({
      key: "opening-run",
      title: "Opening training",
      message: `${openingToday} opening run${openingToday === 1 ? "" : "s"} today.`,
      localDate: input.todayDateKey,
      href: "/",
      tone: "positive",
    });
  if (batteryToday)
    recentActivity.push({
      key: "battery",
      title: "Battery training",
      message: `${batteryToday} continuation${batteryToday === 1 ? "" : "s"} today.`,
      localDate: input.todayDateKey,
      href: "/",
      tone: "positive",
    });
  if (dailyToday)
    recentActivity.push({
      key: "daily",
      title: "Daily Blundr",
      message: "Today's Daily deck is complete.",
      localDate: input.todayDateKey,
      href: "/daily",
      tone: "positive",
    });
  if (reviewToday)
    recentActivity.push({
      key: "review",
      title: "Review attempts",
      message: `${reviewToday} review attempt${reviewToday === 1 ? "" : "s"} today.`,
      localDate: input.todayDateKey,
      href: "/review",
      tone: "neutral",
    });
  if (rewardRows.some((row) => row.did_reward))
    recentActivity.push({
      key: "rewards",
      title: "Tempo Cache",
      message: "A server-confirmed reward was applied this week.",
      localDate: input.todayDateKey,
      href: "/repertoire",
      tone: "positive",
    });

  const milestones: BlundrProgressSummary["milestones"] = [];
  if (grantRows.some((row) => row.source === "daily_blundr_deck_completed"))
    milestones.push({
      title: "Daily Blundr complete",
      message: "You completed Daily Blundr this week.",
    });
  if (number(streakRow.total_all_rings_closed_days) > 0)
    milestones.push({
      title: "All-rings habit",
      message: "You have closed all three rings on at least one day.",
    });
  if (number(streakRow.current_streak) >= 7)
    milestones.push({
      title: "7-day streak",
      message: "Your weekly Tempo Cache milestone is active.",
    });
  if (!milestones.length)
    milestones.push({
      title: "Start here",
      message:
        "Finish an opening run and complete Daily Blundr to establish your first milestone.",
    });

  const summary: BlundrProgressSummary = {
    userId: input.userId,
    generatedAt,
    todayDateKey: input.todayDateKey,
    today: {
      rings,
      allRingsClosed: todayClosed,
      nextBestAction: todayClosed
        ? "Come back tomorrow to keep the streak alive."
        : rings[0].closed
          ? rings[1].closed
            ? "Finish Daily Blundr to close the loop."
            : "Complete your continuation work next."
          : "Start with your opening reps.",
    },
    streak: {
      currentDays: number(streakRow.current_streak),
      bestDays: number(streakRow.longest_streak),
      totalAllRingsClosedDays: number(streakRow.total_all_rings_closed_days),
      daysTrainedThisWeek: countBy(weekGrid, (day) => day.hasTraining),
      week: weekGrid,
    },
    trainingVolume: {
      openingRunsToday: openingToday,
      openingRunsWeek: countBy(
        grantRows,
        (row) => row.source === "opening_run_completed",
      ),
      batteryToday,
      batteryWeek: countBy(
        grantRows,
        (row) => row.source === "continuation_completed",
      ),
      dailyBlundrToday: dailyToday,
      dailyBlundrWeek: countBy(
        grantRows,
        (row) => row.source === "daily_blundr_deck_completed",
      ),
      reviewAttemptsToday: reviewToday,
      reviewAttemptsWeek: attemptRows.length,
      minigamesToday,
      minigamesWeek: countBy(minigameRows, (row) => Boolean(row.first_attempt)),
    },
    accuracy: {
      correct,
      incorrect,
      accuracyPct,
      enoughData: accuracyTotal >= 3,
      message:
        accuracyTotal >= 3
          ? `Tempo sees ${accuracyPct}% unaided opening accuracy today.`
          : "Not enough unaided attempts yet. Complete a few positions and Tempo will show recall quality here.",
    },
    repertoire: {
      unlockedOpenings: unlockedOpeningIds.length,
      lockedOpenings: lockedOpeningIds.length,
      availablePoints,
      nextUnlockCost,
      nextUnlockProgressPct: getUnlockProgressPct(unlockShape),
      mostTrainedOpeningId,
      mostTrainedOpeningName: openingName(mostTrainedOpeningId),
      recommendedOpeningId,
      recommendedOpeningName: openingName(recommendedOpeningId),
    },
    weakAreas: {
      items: weakItems,
      message: weakItems.length
        ? "Tempo is using your saved misses to rank the lines that need attention."
        : "Complete a few unaided positions and Tempo will surface your weakest lines here.",
    },
    milestones,
    recentActivity: recentActivity.slice(0, 5),
    nextActions: [],
  };
  summary.nextActions = [
    {
      title: "Continue Training",
      href: "/",
      description: summary.today.allRingsClosed
        ? "Keep the momentum going with another training set."
        : "Close your remaining daily rings.",
    },
    {
      title: "Start Daily Blundr",
      href: "/daily",
      description: "Work through today's saved Daily deck.",
    },
    {
      title: "Review Queue",
      href: "/review",
      description: "Practice the positions that need a second look.",
    },
    {
      title: "Practice Minigames",
      href: "/review",
      description: "Warm up key patterns outside the Daily loop.",
    },
    {
      title: "Repertoire",
      href: "/repertoire",
      description:
        nextUnlockCost > 0
          ? `${summary.repertoire.nextUnlockProgressPct}% toward your next unlock.`
          : "All MVP openings are currently unlocked.",
    },
  ];
  return summary;
}
