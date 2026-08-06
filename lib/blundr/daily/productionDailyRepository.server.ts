import "server-only";

import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";
import type { DailySessionState } from "./core/dailyActivityTypes";
import type { ProductionDailySession } from "./productionDailyTypes";

const localSessions = new Map<string, ProductionDailySession>();

function requireProductionPersistence<T>(client: T | null): T | null {
  if (client || process.env.NODE_ENV === "test") return client;
  throw new Error("daily_persistence_unavailable");
}

function rowToSession(row: Record<string, unknown>): ProductionDailySession {
  return {
    sessionId: String(row.session_id),
    deckId: String(row.deck_id),
    userId: String(row.user_id),
    dateKey: String(row.local_date),
    state: row.state as DailySessionState,
    publicCards: (row.public_cards ??
      []) as ProductionDailySession["publicCards"],
    privateCards: (row.server_cards ??
      []) as ProductionDailySession["privateCards"],
    reservationIdentity: {
      composerVersion: String(row.composer_version ?? "legacy-composer"),
      runtimePackageId: String(row.runtime_package_id ?? "legacy-runtime"),
      profileVersion: String(row.profile_version ?? "legacy-profile"),
    },
    version: Number(row.state_version ?? 1),
    completedAt: row.completed_at ? String(row.completed_at) : null,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
}

export class ProductionDailyRepository {
  async getByDate(
    userId: string,
    dateKey: string,
  ): Promise<ProductionDailySession | null> {
    const client = requireProductionPersistence(
      createBlundrSupabaseAdminClient(),
    );
    if (!client) return localSessions.get(`${userId}:${dateKey}`) ?? null;
    const result = await client
      .from("blundr_daily_decks")
      .select(
        "deck_id,local_date,public_cards,server_cards,composer_version,runtime_package_id,profile_version,blundr_daily_sessions!inner(session_id,user_id,state,state_version,completed_at,updated_at)",
      )
      .eq("user_id", userId)
      .eq("local_date", dateKey)
      .maybeSingle();
    if (result.error || !result.data) return null;
    const session = Array.isArray(result.data.blundr_daily_sessions)
      ? result.data.blundr_daily_sessions[0]
      : result.data.blundr_daily_sessions;
    if (!session) return null;
    return rowToSession({ ...result.data, ...session });
  }

  async reserve(input: {
    userId: string;
    dateKey: string;
    deckId: string;
    sessionId: string;
    publicCards: unknown;
    privateCards: unknown;
    state: DailySessionState;
    reservationIdentity: ProductionDailySession["reservationIdentity"];
    now: string;
  }): Promise<{ created: boolean; session: ProductionDailySession }> {
    const existing = await this.getByDate(input.userId, input.dateKey);
    if (existing) return { created: false, session: existing };
    const client = requireProductionPersistence(
      createBlundrSupabaseAdminClient(),
    );
    const session: ProductionDailySession = {
      sessionId: input.sessionId,
      deckId: input.deckId,
      userId: input.userId,
      dateKey: input.dateKey,
      state: input.state,
      publicCards: input.publicCards as ProductionDailySession["publicCards"],
      privateCards:
        input.privateCards as ProductionDailySession["privateCards"],
      reservationIdentity: input.reservationIdentity,
      version: 1,
      completedAt: null,
      updatedAt: input.now,
    };
    if (!client) {
      localSessions.set(`${input.userId}:${input.dateKey}`, session);
      return { created: true, session };
    }
    const reserved = await client.rpc("blundr_reserve_daily_v2", {
      p_user_id: input.userId,
      p_local_date: input.dateKey,
      p_reservation: {
        deck_id: input.deckId,
        session_id: input.sessionId,
        deck_fingerprint: input.deckId,
        public_cards: input.publicCards,
        server_cards: input.privateCards,
        content_version: "daily-production-v2",
        composer_version: input.reservationIdentity.composerVersion,
        runtime_package_id: input.reservationIdentity.runtimePackageId,
        profile_version: input.reservationIdentity.profileVersion,
        access_policy_id: "adaptive-daily-v2",
        access_policy_version: "v1",
        time_zone: "UTC",
        state: input.state,
      },
    });
    if (reserved.error) throw new Error("daily_deck_persistence_unavailable");
    return {
      created: false,
      session: (await this.getByDate(input.userId, input.dateKey)) ?? session,
    };
  }

  async getOwned(
    sessionId: string,
    userId: string,
  ): Promise<ProductionDailySession | null> {
    const client = requireProductionPersistence(
      createBlundrSupabaseAdminClient(),
    );
    if (!client)
      return (
        [...localSessions.values()].find(
          (session) =>
            session.sessionId === sessionId && session.userId === userId,
        ) ?? null
      );
    const result = await client
      .from("blundr_daily_sessions")
      .select(
        "session_id,deck_id,user_id,state,state_version,completed_at,updated_at,blundr_daily_decks!inner(local_date,public_cards,server_cards,composer_version,runtime_package_id,profile_version)",
      )
      .eq("session_id", sessionId)
      .eq("user_id", userId)
      .maybeSingle();
    if (result.error || !result.data) return null;
    const deck = Array.isArray(result.data.blundr_daily_decks)
      ? result.data.blundr_daily_decks[0]
      : result.data.blundr_daily_decks;
    return deck ? rowToSession({ ...result.data, ...deck }) : null;
  }

  async update(
    session: ProductionDailySession,
    expectedVersion: number,
  ): Promise<"updated" | "conflict"> {
    const client = requireProductionPersistence(
      createBlundrSupabaseAdminClient(),
    );
    if (!client) {
      const current = [...localSessions.values()].find(
        (item) =>
          item.sessionId === session.sessionId &&
          item.userId === session.userId,
      );
      if (!current || current.version !== expectedVersion) return "conflict";
      localSessions.set(`${session.userId}:${session.dateKey}`, session);
      return "updated";
    }
    const result = await client
      .from("blundr_daily_sessions")
      .update({
        state: session.state,
        state_version: session.version,
        completed_at: session.completedAt,
        updated_at: session.updatedAt,
      })
      .eq("session_id", session.sessionId)
      .eq("user_id", session.userId)
      .eq("state_version", expectedVersion)
      .select("session_id");
    if (result.error) throw new Error("daily_session_persistence_unavailable");
    return result.data?.length ? "updated" : "conflict";
  }

  async appendAttempt(input: {
    attemptId: string;
    sessionId: string;
    userId: string;
    cardFingerprint: string;
    firstAttempt: boolean;
    attemptKind: "answer" | "reveal" | "retry";
    outcome: string;
    answer?: unknown;
  }): Promise<"inserted" | "duplicate"> {
    const client = requireProductionPersistence(
      createBlundrSupabaseAdminClient(),
    );
    if (!client) return "inserted";
    const result = await client.from("blundr_daily_attempts").insert({
      attempt_id: input.attemptId,
      session_id: input.sessionId,
      user_id: input.userId,
      card_fingerprint: input.cardFingerprint,
      first_attempt: input.firstAttempt,
      attempt_kind: input.attemptKind,
      outcome: input.outcome,
      answer: input.answer ?? null,
    });
    if (!result.error) return "inserted";
    if (result.error.code === "23505") return "duplicate";
    throw new Error("daily_attempt_persistence_unavailable");
  }

  async commitAction(input: {
    session: ProductionDailySession;
    expectedVersion: number;
    attemptId: string;
    cardFingerprint: string;
    firstAttempt: boolean;
    attemptKind: "answer" | "reveal" | "retry";
    outcome: "correct" | "incorrect" | "revealed" | "skipped";
    stepIndex: number;
    answer?: unknown;
    learningEvent?: unknown;
  }): Promise<"inserted" | "duplicate" | "conflict"> {
    const client = requireProductionPersistence(
      createBlundrSupabaseAdminClient(),
    );
    if (!client) return "inserted";
    const result = await client.rpc("blundr_commit_daily_action_v2", {
      p_user_id: input.session.userId,
      p_session_id: input.session.sessionId,
      p_action: {
        action_id: input.attemptId,
        attempt_id: input.attemptId,
        card_fingerprint: input.cardFingerprint,
        first_attempt: input.firstAttempt,
        attempt_kind: input.attemptKind,
        outcome: input.outcome,
        answer: input.answer ?? null,
        step_id: `${input.cardFingerprint}:${input.stepIndex}`,
        step_index: input.stepIndex,
        expected_version: input.expectedVersion,
        next_state: input.session.state,
        completed_at: input.session.completedAt,
        learning_exposure_id: input.firstAttempt
          ? `daily:${input.session.sessionId}:${input.cardFingerprint}`
          : null,
        learning_event: input.learningEvent ?? null,
      },
    });
    if (result.error) {
      if (result.error.message.includes("daily_session_conflict"))
        return "conflict";
      throw new Error("daily_action_persistence_unavailable");
    }
    return result.data?.status === "duplicate" ? "duplicate" : "inserted";
  }
}
