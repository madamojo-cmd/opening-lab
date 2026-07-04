// server-only: do not import into client components.

import { createBlundrSupabaseServerClient } from "../backend/supabaseServerClient";
import { BLUNDR_PERSISTENCE_TABLES } from "./persistenceKeys";
import type { BlundrAccountMode, DailyRetentionProgress, OpeningUnlockEvent, OpeningUnlockProgress, RewardRoll, StreakRecord, UserRepertoire, UserRewardHistory, UserTrainingProfile, ValidationSnapshot } from "../accounts/accountTypes";
import {
  createDefaultDailyRetentionProgress,
  createDefaultOpeningUnlockEvent,
  createDefaultOpeningUnlockProgress,
  createDefaultRewardHistory,
  createDefaultRewardRoll,
  createDefaultStreakRecord,
  createDefaultTrainingProfile,
  createDefaultUserRepertoire,
  normalizeRatingBandId,
  normalizeStarterPackId,
} from "../accounts/accountDefaults";
import type { RepertoirePointEvent, RepertoireUnlockEvent } from "../repertoire/repertoireTypes";
import type { PersistenceResult, BlundrPersistenceAdapter } from "./persistenceTypes";

type SupabaseUserProfileRow = {
  user_id: string;
  onboarding_completed: boolean;
  rating_band_id: string;
  rating_source: string;
  raw_rating: number | null;
  rating_time_control: string | null;
  preferred_training_mode: string;
  daily_tempo_goal: number;
  daily_battery_goal: number;
  daily_blundr_goal: number;
  selected_starter_pack_id: string | null;
  created_at: string;
  updated_at: string;
};

type SupabaseUserRepertoireRow = {
  user_id: string;
  selected_starter_pack_id: string | null;
  unlocked_opening_ids: string[] | null;
  locked_opening_ids: string[] | null;
  opening_unlock_points: number;
  updated_at: string;
};

type SupabaseRepertoirePointEventRow = {
  id: string;
  user_id: string;
  source: RepertoirePointEvent["source"];
  points: number;
  opening_id: string | null;
  daily_session_id: string | null;
  created_at: string;
};

type SupabaseRepertoireUnlockEventRow = {
  id: string;
  user_id: string;
  opening_id: string;
  points_spent: number;
  unlock_index: number;
  created_at: string;
};

type SupabaseDailyRetentionProgressRow = {
  id: string;
  user_id: string;
  local_date: string;
  daily_tempo_goal: number;
  daily_tempo_progress: number;
  daily_tempo_completed: boolean;
  daily_tempo_completed_at: string | null;
  daily_battery_goal: number;
  daily_battery_progress: number;
  daily_battery_completed: boolean;
  daily_battery_completed_at: string | null;
  daily_blundr_goal: number;
  daily_blundr_progress: number;
  daily_blundr_completed: boolean;
  daily_blundr_completed_at: string | null;
  all_rings_closed: boolean;
  all_rings_closed_at: string | null;
  xp_earned: number;
  opening_points_earned: number;
  streak_eligible: boolean;
  activity_event_ids: string[] | null;
  completed_at: string | null;
  updated_at: string;
};

type SupabaseOpeningUnlockProgressRow = {
  id: string;
  user_id: string;
  opening_id: string;
  points_earned: number;
  required_points: number;
  status: "locked" | "in_progress" | "unlocked";
  updated_at: string;
};

type SupabaseOpeningUnlockEventRow = {
  id: string;
  user_id: string;
  opening_id: string;
  source: OpeningUnlockEvent["source"];
  opening_points_earned: number;
  created_at: string;
};

type SupabaseStreakRecordRow = {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  total_all_rings_closed_days: number;
  last_completed_local_date: string | null;
  updated_at: string;
};

type SupabaseRewardHistoryRow = {
  user_id: string;
  random_bonus_pity_counter: number;
  last_random_bonus_at: string | null;
  updated_at: string;
};

type SupabaseRewardRollRow = {
  id: string;
  user_id: string;
  trigger: RewardRoll["trigger"];
  rolled_at: string;
  did_reward: boolean;
  reward_json: unknown;
  seed: string;
};

type SupabaseValidationSnapshotRow = {
  id: string;
  user_id: string | null;
  generated_at: string;
  valid: boolean;
  issue_count: number;
  error_count: number;
  warning_count: number;
  report_json: unknown;
};

type SupabaseClientType = NonNullable<ReturnType<typeof createBlundrSupabaseServerClient>>;

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function ok<T>(data: T): PersistenceResult<T> {
  return { ok: true, data };
}

function err<T = never>(code: string, message: string, cause?: unknown, retryable = true): PersistenceResult<T> {
  return { ok: false, error: { code, message, cause, retryable } };
}

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value) ? Array.from(new Set(value.map((entry) => normalizeText(entry)).filter(Boolean))) : [];
}

function mapTrainingProfileRow(profile: UserTrainingProfile): SupabaseUserProfileRow {
  return {
    user_id: profile.userId,
    onboarding_completed: Boolean(profile.onboardingCompleted),
    rating_band_id: normalizeRatingBandId(profile.ratingBandId),
    rating_source: profile.ratingSource,
    raw_rating: typeof profile.rawRating === "number" && Number.isFinite(profile.rawRating) ? profile.rawRating : null,
    rating_time_control: profile.ratingTimeControl ?? null,
    preferred_training_mode: profile.preferredTrainingMode,
    daily_tempo_goal: Math.max(1, Number(profile.dailyTempoGoal) || 1),
    daily_battery_goal: Math.max(1, Number(profile.dailyBatteryGoal) || 1),
    daily_blundr_goal: Math.max(1, Number(profile.dailyBlundrGoal) || 1),
    selected_starter_pack_id: normalizeStarterPackId(profile.selectedStarterPackId) ?? null,
    created_at: normalizeText(profile.createdAt) || nowIso(),
    updated_at: normalizeText(profile.updatedAt) || nowIso(),
  };
}

function mapTrainingProfileRowToModel(row: SupabaseUserProfileRow | null): UserTrainingProfile | null {
  if (!row) return null;
  const base = createDefaultTrainingProfile(row.user_id, row.created_at);
  return {
    ...base,
    onboardingCompleted: Boolean(row.onboarding_completed),
    ratingBandId: normalizeRatingBandId(row.rating_band_id),
    ratingSource: row.rating_source === "manual" || row.rating_source === "chesscom" || row.rating_source === "lichess" || row.rating_source === "default" ? row.rating_source : "default",
    rawRating: typeof row.raw_rating === "number" ? row.raw_rating : undefined,
    ratingTimeControl:
      row.rating_time_control === "rapid" ||
      row.rating_time_control === "blitz" ||
      row.rating_time_control === "classical" ||
      row.rating_time_control === "bullet" ||
      row.rating_time_control === "unknown"
        ? row.rating_time_control
        : undefined,
    preferredTrainingMode: row.preferred_training_mode === "plain" ? "plain" : "assisted",
    dailyTempoGoal: Math.max(1, Number(row.daily_tempo_goal) || 1),
    dailyBatteryGoal: Math.max(1, Number(row.daily_battery_goal) || 1),
    dailyBlundrGoal: Math.max(1, Number(row.daily_blundr_goal) || 1),
    selectedStarterPackId: normalizeStarterPackId(row.selected_starter_pack_id),
    createdAt: row.created_at || base.createdAt,
    updatedAt: row.updated_at || base.updatedAt,
  };
}

function mapRepertoireRow(model: UserRepertoire): SupabaseUserRepertoireRow {
  return {
    user_id: model.userId,
    selected_starter_pack_id: normalizeStarterPackId(model.selectedStarterPackId) ?? null,
    unlocked_opening_ids: normalizeStringArray(model.unlockedOpeningIds),
    locked_opening_ids: normalizeStringArray(model.lockedOpeningIds),
    opening_unlock_points: Math.max(0, Number(model.openingUnlockPoints) || 0),
    updated_at: normalizeText(model.updatedAt) || nowIso(),
  };
}

function mapRepertoireRowToModel(row: SupabaseUserRepertoireRow | null): UserRepertoire | null {
  if (!row) return null;
  const base = createDefaultUserRepertoire(row.user_id, row.updated_at);
  return {
    ...base,
    selectedStarterPackId: normalizeStarterPackId(row.selected_starter_pack_id),
    unlockedOpeningIds: normalizeStringArray(row.unlocked_opening_ids),
    lockedOpeningIds: normalizeStringArray(row.locked_opening_ids),
    openingUnlockPoints: Math.max(0, Number(row.opening_unlock_points) || 0),
    updatedAt: row.updated_at || base.updatedAt,
  };
}

function mapRepertoirePointEventRow(event: RepertoirePointEvent): SupabaseRepertoirePointEventRow {
  return {
    id: event.id,
    user_id: event.userId,
    source: event.source,
    points: Math.max(0, Number(event.points) || 0),
    opening_id: event.openingId ? normalizeText(event.openingId) : null,
    daily_session_id: event.dailySessionId ? normalizeText(event.dailySessionId) : null,
    created_at: normalizeText(event.createdAt) || nowIso(),
  };
}

function mapRepertoirePointEventRowToModel(row: SupabaseRepertoirePointEventRow | null): RepertoirePointEvent | null {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    source: row.source,
    points: Math.max(0, Number(row.points) || 0),
    openingId: row.opening_id ?? undefined,
    dailySessionId: row.daily_session_id ?? undefined,
    createdAt: row.created_at,
  };
}

function mapRepertoireUnlockEventRow(event: RepertoireUnlockEvent): SupabaseRepertoireUnlockEventRow {
  return {
    id: event.id,
    user_id: event.userId,
    opening_id: event.openingId,
    points_spent: Math.max(0, Number(event.pointsSpent) || 0),
    unlock_index: Math.max(1, Number(event.unlockIndex) || 1),
    created_at: normalizeText(event.createdAt) || nowIso(),
  };
}

function mapRepertoireUnlockEventRowToModel(row: SupabaseRepertoireUnlockEventRow | null): RepertoireUnlockEvent | null {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    openingId: row.opening_id,
    pointsSpent: Math.max(0, Number(row.points_spent) || 0),
    unlockIndex: Math.max(1, Number(row.unlock_index) || 1),
    createdAt: row.created_at,
  };
}

function mapDailyRetentionRow(progress: DailyRetentionProgress): SupabaseDailyRetentionProgressRow {
  return {
    id: `${progress.userId}:${progress.localDate}`,
    user_id: progress.userId,
    local_date: progress.localDate,
    daily_tempo_goal: Math.max(1, Number(progress.rings.dailyTempo.goal) || 1),
    daily_tempo_progress: Math.max(0, Number(progress.rings.dailyTempo.progress) || 0),
    daily_tempo_completed: Boolean(progress.rings.dailyTempo.completed),
    daily_tempo_completed_at: progress.rings.dailyTempo.completedAt ?? null,
    daily_battery_goal: Math.max(1, Number(progress.rings.dailyBattery.goal) || 1),
    daily_battery_progress: Math.max(0, Number(progress.rings.dailyBattery.progress) || 0),
    daily_battery_completed: Boolean(progress.rings.dailyBattery.completed),
    daily_battery_completed_at: progress.rings.dailyBattery.completedAt ?? null,
    daily_blundr_goal: Math.max(1, Number(progress.rings.dailyBlundr.goal) || 1),
    daily_blundr_progress: Math.max(0, Number(progress.rings.dailyBlundr.progress) || 0),
    daily_blundr_completed: Boolean(progress.rings.dailyBlundr.completed),
    daily_blundr_completed_at: progress.rings.dailyBlundr.completedAt ?? null,
    all_rings_closed: Boolean(progress.allRingsClosed),
    all_rings_closed_at: progress.allRingsClosedAt ?? progress.completedAt ?? null,
    xp_earned: Math.max(0, Number(progress.xpEarned) || 0),
    opening_points_earned: Math.max(0, Number(progress.openingPointsEarned) || 0),
    streak_eligible: Boolean(progress.streakEligible),
    activity_event_ids: Array.isArray(progress.activityEventIds) ? normalizeStringArray(progress.activityEventIds) : [],
    completed_at: progress.completedAt ?? null,
    updated_at: normalizeText(progress.updatedAt) || nowIso(),
  };
}

function mapDailyRetentionRowToModel(row: SupabaseDailyRetentionProgressRow | null): DailyRetentionProgress | null {
  if (!row) return null;
  const base = createDefaultDailyRetentionProgress(row.user_id, row.local_date, {
    dailyTempoGoal: row.daily_tempo_goal,
    dailyBatteryGoal: row.daily_battery_goal,
    dailyBlundrGoal: row.daily_blundr_goal,
  }, row.updated_at);
  return {
    ...base,
    rings: {
      dailyTempo: {
        type: "daily_tempo",
        goal: Math.max(1, Number(row.daily_tempo_goal) || 1),
        progress: Math.max(0, Number(row.daily_tempo_progress) || 0),
        completed: Boolean(row.daily_tempo_completed),
        completedAt: row.daily_tempo_completed_at ?? undefined,
      },
      dailyBattery: {
        type: "daily_battery",
        goal: Math.max(1, Number(row.daily_battery_goal) || 1),
        progress: Math.max(0, Number(row.daily_battery_progress) || 0),
        completed: Boolean(row.daily_battery_completed),
        completedAt: row.daily_battery_completed_at ?? undefined,
      },
      dailyBlundr: {
        type: "daily_blundr",
        goal: Math.max(1, Number(row.daily_blundr_goal) || 1),
        progress: Math.max(0, Number(row.daily_blundr_progress) || 0),
        completed: Boolean(row.daily_blundr_completed),
        completedAt: row.daily_blundr_completed_at ?? undefined,
      },
    },
    allRingsClosed: Boolean(row.all_rings_closed),
    allRingsClosedAt: row.all_rings_closed_at ?? undefined,
    xpEarned: Math.max(0, Number(row.xp_earned) || 0),
    openingPointsEarned: Math.max(0, Number(row.opening_points_earned) || 0),
    streakEligible: Boolean(row.streak_eligible),
    activityEventIds: normalizeStringArray(row.activity_event_ids),
    completedAt: row.completed_at ?? undefined,
    updatedAt: row.updated_at || base.updatedAt,
  };
}

function mapOpeningUnlockProgressRow(progress: OpeningUnlockProgress): SupabaseOpeningUnlockProgressRow {
  return {
    id: `${progress.userId}:${progress.openingId}`,
    user_id: progress.userId,
    opening_id: progress.openingId,
    points_earned: Math.max(0, Number(progress.pointsEarned) || 0),
    required_points: Math.max(1, Number(progress.requiredPoints) || 1),
    status: progress.status,
    updated_at: normalizeText(progress.updatedAt) || nowIso(),
  };
}

function mapOpeningUnlockProgressRowToModel(row: SupabaseOpeningUnlockProgressRow): OpeningUnlockProgress {
  const base = createDefaultOpeningUnlockProgress(row.user_id, row.opening_id, row.updated_at, row.required_points);
  return {
    ...base,
    pointsEarned: Math.max(0, Number(row.points_earned) || 0),
    requiredPoints: Math.max(1, Number(row.required_points) || 1),
    status: row.status,
    updatedAt: row.updated_at || base.updatedAt,
  };
}

function mapOpeningUnlockEventRow(event: OpeningUnlockEvent): SupabaseOpeningUnlockEventRow {
  return {
    id: event.id,
    user_id: event.userId,
    opening_id: event.openingId,
    source: event.source,
    opening_points_earned: Math.max(0, Number(event.openingPointsEarned) || 0),
    created_at: normalizeText(event.createdAt) || nowIso(),
  };
}

function mapOpeningUnlockEventRowToModel(row: SupabaseOpeningUnlockEventRow | null): OpeningUnlockEvent | null {
  if (!row) return null;
  return {
    ...createDefaultOpeningUnlockEvent(row.user_id, row.opening_id, row.source, Math.max(0, Number(row.opening_points_earned) || 0), row.id, row.created_at),
    id: row.id,
    userId: row.user_id,
    openingId: row.opening_id,
    source: row.source,
    openingPointsEarned: Math.max(0, Number(row.opening_points_earned) || 0),
    createdAt: row.created_at,
  };
}

function mapStreakRecordRow(record: StreakRecord): SupabaseStreakRecordRow {
  return {
    user_id: record.userId,
    current_streak: Math.max(0, Number(record.currentStreak) || 0),
    longest_streak: Math.max(0, Number(record.longestStreak) || 0),
    total_all_rings_closed_days: Math.max(0, Number(record.totalAllRingsClosedDays) || 0),
    last_completed_local_date: record.lastCompletedLocalDate ?? null,
    updated_at: normalizeText(record.updatedAt) || nowIso(),
  };
}

function mapStreakRecordRowToModel(row: SupabaseStreakRecordRow | null): StreakRecord | null {
  if (!row) return null;
  const base = createDefaultStreakRecord(row.user_id, row.updated_at);
  return {
    ...base,
    currentStreak: Math.max(0, Number(row.current_streak) || 0),
    longestStreak: Math.max(0, Number(row.longest_streak) || 0),
    totalAllRingsClosedDays: Math.max(0, Number(row.total_all_rings_closed_days) || 0),
    lastCompletedLocalDate: row.last_completed_local_date ?? undefined,
    updatedAt: row.updated_at || base.updatedAt,
  };
}

function mapRewardHistoryRow(history: UserRewardHistory): SupabaseRewardHistoryRow {
  return {
    user_id: history.userId,
    random_bonus_pity_counter: Math.max(0, Number(history.randomBonusPityCounter) || 0),
    last_random_bonus_at: history.lastRandomBonusAt ?? null,
    updated_at: normalizeText(history.updatedAt) || nowIso(),
  };
}

function mapRewardHistoryRowToModel(row: SupabaseRewardHistoryRow | null): UserRewardHistory | null {
  if (!row) return null;
  const base = createDefaultRewardHistory(row.user_id, row.updated_at);
  return {
    ...base,
    randomBonusPityCounter: Math.max(0, Number(row.random_bonus_pity_counter) || 0),
    lastRandomBonusAt: row.last_random_bonus_at ?? undefined,
    updatedAt: row.updated_at || base.updatedAt,
  };
}

function mapRewardRollRow(roll: RewardRoll): SupabaseRewardRollRow {
  return {
    id: roll.id,
    user_id: roll.userId,
    trigger: roll.trigger,
    rolled_at: normalizeText(roll.rolledAt) || nowIso(),
    did_reward: Boolean(roll.didReward),
    reward_json: roll.reward ?? null,
    seed: normalizeText(roll.seed) || roll.id,
  };
}

function mapRewardRollRowToModel(row: SupabaseRewardRollRow | null): RewardRoll | null {
  if (!row) return null;
  return {
    ...createDefaultRewardRoll(row.user_id, row.trigger, row.seed, row.rolled_at, row.did_reward, row.reward_json as RewardRoll["reward"]),
    id: row.id,
    userId: row.user_id,
    trigger: row.trigger,
    rolledAt: row.rolled_at,
    didReward: Boolean(row.did_reward),
    reward: (row.reward_json as RewardRoll["reward"]) ?? undefined,
    seed: row.seed,
  };
}

function mapValidationSnapshotRow(snapshot: ValidationSnapshot): SupabaseValidationSnapshotRow {
  return {
    id: snapshot.id,
    user_id: snapshot.userId ?? null,
    generated_at: normalizeText(snapshot.generatedAt) || nowIso(),
    valid: Boolean(snapshot.valid),
    issue_count: Math.max(0, Number(snapshot.issueCount) || 0),
    error_count: Math.max(0, Number(snapshot.errorCount) || 0),
    warning_count: Math.max(0, Number(snapshot.warningCount) || 0),
    report_json: snapshot.reportJson ?? null,
  };
}

function mapValidationSnapshotRowToModel(row: SupabaseValidationSnapshotRow | null): ValidationSnapshot | null {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    generatedAt: row.generated_at,
    valid: Boolean(row.valid),
    issueCount: Math.max(0, Number(row.issue_count) || 0),
    errorCount: Math.max(0, Number(row.error_count) || 0),
    warningCount: Math.max(0, Number(row.warning_count) || 0),
    reportJson: row.report_json,
  };
}

function getClient(accessToken?: string | null): SupabaseClientType | null {
  return createBlundrSupabaseServerClient({ accessToken }) as SupabaseClientType | null;
}

async function runClientOperation<T>(accessToken: string | null | undefined, operation: (client: SupabaseClientType) => Promise<PersistenceResult<T>>): Promise<PersistenceResult<T>> {
  const client = getClient(accessToken);
  if (!client) {
    return err("supabase_unavailable", "Supabase credentials are not available.", null, false);
  }
  try {
    return await operation(client);
  } catch (cause) {
    return err("supabase_operation_failed", "Supabase operation failed.", cause, true);
  }
}

export type SupabasePersistenceAdapterInput = {
  accessToken?: string | null;
  mode?: BlundrAccountMode;
};

export function createBlundrSupabasePersistenceAdapter(input: SupabasePersistenceAdapterInput = {}): BlundrPersistenceAdapter {
  const accessToken = input.accessToken ?? null;
  return {
    mode: input.mode ?? "authenticated",
    async getTrainingProfile(userId: string) {
      return runClientOperation(accessToken, async (client) => {
        const { data, error } = await client.from(BLUNDR_PERSISTENCE_TABLES.userProfiles).select("*").eq("user_id", userId).maybeSingle();
        if (error) return err("supabase_query_failed", "Could not load training profile.", error, true);
        return ok(mapTrainingProfileRowToModel(data as SupabaseUserProfileRow | null));
      });
    },
    async upsertTrainingProfile(profile: UserTrainingProfile) {
      return runClientOperation(accessToken, async (client) => {
        const row = mapTrainingProfileRow(profile);
        const { data, error } = await client.from(BLUNDR_PERSISTENCE_TABLES.userProfiles).upsert(row, { onConflict: "user_id" }).select("*").maybeSingle();
        if (error) return err("supabase_write_failed", "Could not save training profile.", error, true);
        return ok(mapTrainingProfileRowToModel(data as SupabaseUserProfileRow | null) ?? cloneJson(profile));
      });
    },
    async getUserRepertoire(userId: string) {
      return runClientOperation(accessToken, async (client) => {
        const { data, error } = await client.from(BLUNDR_PERSISTENCE_TABLES.userRepertoires).select("*").eq("user_id", userId).maybeSingle();
        if (error) return err("supabase_query_failed", "Could not load repertoire.", error, true);
        return ok(mapRepertoireRowToModel(data as SupabaseUserRepertoireRow | null));
      });
    },
    async upsertUserRepertoire(repertoire: UserRepertoire) {
      return runClientOperation(accessToken, async (client) => {
        const row = mapRepertoireRow(repertoire);
        const { data, error } = await client.from(BLUNDR_PERSISTENCE_TABLES.userRepertoires).upsert(row, { onConflict: "user_id" }).select("*").maybeSingle();
        if (error) return err("supabase_write_failed", "Could not save repertoire.", error, true);
        return ok(mapRepertoireRowToModel(data as SupabaseUserRepertoireRow | null) ?? cloneJson(repertoire));
      });
    },
    async getRepertoirePointEvents(userId: string) {
      return runClientOperation(accessToken, async (client) => {
        const { data, error } = await client.from(BLUNDR_PERSISTENCE_TABLES.repertoirePointEvents).select("*").eq("user_id", userId).order("created_at", { ascending: true });
        if (error) return err("supabase_query_failed", "Could not load repertoire point events.", error, true);
        return ok((data ?? []).map((row) => mapRepertoirePointEventRowToModel(row as SupabaseRepertoirePointEventRow)).filter((entry): entry is RepertoirePointEvent => Boolean(entry)));
      });
    },
    async appendRepertoirePointEvent(event: RepertoirePointEvent) {
      return runClientOperation(accessToken, async (client) => {
        const row = mapRepertoirePointEventRow(event);
        const { data, error } = await client.from(BLUNDR_PERSISTENCE_TABLES.repertoirePointEvents).upsert(row, { onConflict: "id" }).select("*").maybeSingle();
        if (error) return err("supabase_write_failed", "Could not save repertoire point event.", error, true);
        return ok((data ? mapRepertoirePointEventRowToModel(data as SupabaseRepertoirePointEventRow) : event) ?? event);
      });
    },
    async getRepertoireUnlockEvents(userId: string) {
      return runClientOperation(accessToken, async (client) => {
        const { data, error } = await client.from(BLUNDR_PERSISTENCE_TABLES.repertoireUnlockEvents).select("*").eq("user_id", userId).order("created_at", { ascending: true });
        if (error) return err("supabase_query_failed", "Could not load repertoire unlock events.", error, true);
        return ok((data ?? []).map((row) => mapRepertoireUnlockEventRowToModel(row as SupabaseRepertoireUnlockEventRow)).filter((entry): entry is RepertoireUnlockEvent => Boolean(entry)));
      });
    },
    async appendRepertoireUnlockEvent(event: RepertoireUnlockEvent) {
      return runClientOperation(accessToken, async (client) => {
        const row = mapRepertoireUnlockEventRow(event);
        const { data, error } = await client.from(BLUNDR_PERSISTENCE_TABLES.repertoireUnlockEvents).upsert(row, { onConflict: "id" }).select("*").maybeSingle();
        if (error) return err("supabase_write_failed", "Could not save repertoire unlock event.", error, true);
        return ok((data ? mapRepertoireUnlockEventRowToModel(data as SupabaseRepertoireUnlockEventRow) : event) ?? event);
      });
    },
    async getDailyRetentionProgress(userId: string, localDate: string) {
      return runClientOperation(accessToken, async (client) => {
        const { data, error } = await client.from(BLUNDR_PERSISTENCE_TABLES.dailyRetentionProgress).select("*").eq("user_id", userId).eq("local_date", localDate).maybeSingle();
        if (error) return err("supabase_query_failed", "Could not load daily retention progress.", error, true);
        return ok(mapDailyRetentionRowToModel(data as SupabaseDailyRetentionProgressRow | null));
      });
    },
    async upsertDailyRetentionProgress(progress: DailyRetentionProgress) {
      return runClientOperation(accessToken, async (client) => {
        const row = mapDailyRetentionRow(progress);
        const { data, error } = await client.from(BLUNDR_PERSISTENCE_TABLES.dailyRetentionProgress).upsert(row, { onConflict: "user_id,local_date" }).select("*").maybeSingle();
        if (error) return err("supabase_write_failed", "Could not save daily retention progress.", error, true);
        return ok(mapDailyRetentionRowToModel(data as SupabaseDailyRetentionProgressRow | null) ?? cloneJson(progress));
      });
    },
    async getOpeningUnlockProgress(userId: string) {
      return runClientOperation(accessToken, async (client) => {
        const { data, error } = await client.from(BLUNDR_PERSISTENCE_TABLES.openingUnlockProgress).select("*").eq("user_id", userId);
        if (error) return err("supabase_query_failed", "Could not load opening unlock progress.", error, true);
        return ok((data ?? []).map((row) => mapOpeningUnlockProgressRowToModel(row as SupabaseOpeningUnlockProgressRow)));
      });
    },
    async upsertOpeningUnlockProgress(progress: OpeningUnlockProgress) {
      return runClientOperation(accessToken, async (client) => {
        const row = mapOpeningUnlockProgressRow(progress);
        const { error } = await client.from(BLUNDR_PERSISTENCE_TABLES.openingUnlockProgress).upsert(row, { onConflict: "user_id,opening_id" });
        if (error) return err("supabase_write_failed", "Could not save opening unlock progress.", error, true);
        return ok(progress);
      });
    },
    async appendOpeningUnlockEvent(event: OpeningUnlockEvent) {
      return runClientOperation(accessToken, async (client) => {
        const row = mapOpeningUnlockEventRow(event);
        const { data, error } = await client.from(BLUNDR_PERSISTENCE_TABLES.openingUnlockEvents).insert(row).select("*").maybeSingle();
        if (error) return err("supabase_write_failed", "Could not save opening unlock event.", error, true);
        return ok((data ? mapOpeningUnlockEventRowToModel(data as SupabaseOpeningUnlockEventRow) : event) ?? event);
      });
    },
    async getStreakRecord(userId: string) {
      return runClientOperation(accessToken, async (client) => {
        const { data, error } = await client.from(BLUNDR_PERSISTENCE_TABLES.streakRecords).select("*").eq("user_id", userId).maybeSingle();
        if (error) return err("supabase_query_failed", "Could not load streak record.", error, true);
        return ok(mapStreakRecordRowToModel(data as SupabaseStreakRecordRow | null));
      });
    },
    async upsertStreakRecord(record: StreakRecord) {
      return runClientOperation(accessToken, async (client) => {
        const row = mapStreakRecordRow(record);
        const { data, error } = await client.from(BLUNDR_PERSISTENCE_TABLES.streakRecords).upsert(row, { onConflict: "user_id" }).select("*").maybeSingle();
        if (error) return err("supabase_write_failed", "Could not save streak record.", error, true);
        return ok(mapStreakRecordRowToModel(data as SupabaseStreakRecordRow | null) ?? cloneJson(record));
      });
    },
    async getRewardHistory(userId: string) {
      return runClientOperation(accessToken, async (client) => {
        const { data, error } = await client.from(BLUNDR_PERSISTENCE_TABLES.rewardHistory).select("*").eq("user_id", userId).maybeSingle();
        if (error) return err("supabase_query_failed", "Could not load reward history.", error, true);
        return ok(mapRewardHistoryRowToModel(data as SupabaseRewardHistoryRow | null));
      });
    },
    async upsertRewardHistory(history: UserRewardHistory) {
      return runClientOperation(accessToken, async (client) => {
        const row = mapRewardHistoryRow(history);
        const { data, error } = await client.from(BLUNDR_PERSISTENCE_TABLES.rewardHistory).upsert(row, { onConflict: "user_id" }).select("*").maybeSingle();
        if (error) return err("supabase_write_failed", "Could not save reward history.", error, true);
        return ok(mapRewardHistoryRowToModel(data as SupabaseRewardHistoryRow | null) ?? cloneJson(history));
      });
    },
    async appendRewardRoll(roll: RewardRoll) {
      return runClientOperation(accessToken, async (client) => {
        const row = mapRewardRollRow(roll);
        const { data, error } = await client.from(BLUNDR_PERSISTENCE_TABLES.rewardRolls).insert(row).select("*").maybeSingle();
        if (error) return err("supabase_write_failed", "Could not save reward roll.", error, true);
        return ok((data ? mapRewardRollRowToModel(data as SupabaseRewardRollRow) : roll) ?? roll);
      });
    },
    async saveValidationSnapshot(snapshot: ValidationSnapshot) {
      return runClientOperation(accessToken, async (client) => {
        const row = mapValidationSnapshotRow(snapshot);
        const { data, error } = await client.from(BLUNDR_PERSISTENCE_TABLES.validationSnapshots).upsert(row, { onConflict: "id" }).select("*").maybeSingle();
        if (error) return err("supabase_write_failed", "Could not save validation snapshot.", error, true);
        return ok(mapValidationSnapshotRowToModel(data as SupabaseValidationSnapshotRow | null) ?? cloneJson(snapshot));
      });
    },
  };
}

export {
  mapTrainingProfileRow,
  mapTrainingProfileRowToModel,
  mapRepertoireRow,
  mapRepertoireRowToModel,
  mapRepertoirePointEventRow,
  mapRepertoirePointEventRowToModel,
  mapRepertoireUnlockEventRow,
  mapRepertoireUnlockEventRowToModel,
  mapDailyRetentionRow,
  mapDailyRetentionRowToModel,
  mapOpeningUnlockProgressRow,
  mapOpeningUnlockProgressRowToModel,
  mapOpeningUnlockEventRow,
  mapStreakRecordRow,
  mapStreakRecordRowToModel,
  mapRewardHistoryRow,
  mapRewardHistoryRowToModel,
  mapRewardRollRow,
  mapRewardRollRowToModel,
  mapValidationSnapshotRow,
  mapValidationSnapshotRowToModel,
};
