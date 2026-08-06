import "server-only";

import { randomUUID } from "node:crypto";
import { createDeterministicIdentity } from "@/lib/blundr/contracts";
import { createHash } from "node:crypto";
import { createPositionIdentity } from "@/lib/blundr/contracts";
import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";
import { loadOpeningAccess } from "@/lib/blundr/gameData/gameDataService";
import type { CurrentBlundrUser } from "@/lib/blundr/accounts/accountTypes";
import { resolveLearningAttemptAuthority } from "@/lib/blundr/learning/core/learningAttemptAuthority";
import { prepareLearningEventV2 } from "@/lib/blundr/learning/core/learningEventService.server";
import {
  resolveVerifiedTrainerRuntimeLine,
  type VerifiedTrainerRuntimeLine,
} from "./trainerRuntimeLine.server";

export type TrainerSessionPublic = {
  sessionId: string;
  version: number;
  openingId: string;
  lineId: string;
  lineKey: string;
  actionId: string;
  terminal: boolean;
  terminalCompletionId: string | null;
};

function dbUnavailable(): never {
  throw new Error("trainer_session_persistence_unavailable");
}

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function trainerRequestFingerprint(input: {
  userId: string;
  sessionId: string;
  actionId: string;
  expectedVersion: number;
  type: unknown;
  playedMoveUci: unknown;
  targetId: string;
}): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        userId: input.userId,
        sessionId: input.sessionId,
        actionId: input.actionId,
        expectedVersion: input.expectedVersion,
        type: text(input.type),
        playedMoveUci: text(input.playedMoveUci) || null,
        targetId: input.targetId,
      }),
    )
    .digest("hex");
}

function requireServiceClient() {
  const client = createBlundrSupabaseAdminClient();
  if (!client) dbUnavailable();
  return client;
}

async function requireOpeningAccess(
  user: CurrentBlundrUser,
  line: VerifiedTrainerRuntimeLine,
) {
  const access = await loadOpeningAccess(user);
  const snapshot = access.get({
    userId: user.userId,
    openingId: line.openingId,
    repertoireSide: line.userColor === "b" ? "black" : "white",
  });
  if (snapshot.decision !== "active") throw new Error("opening_locked");
  return snapshot;
}

/** Server creates the only accepted session identity. Browser session IDs are ignored. */
export async function reserveTrainerSession(input: {
  user: CurrentBlundrUser;
  openingId: unknown;
  lineId: unknown;
  resumeSessionId?: unknown;
}): Promise<TrainerSessionPublic> {
  const line = await resolveVerifiedTrainerRuntimeLine(input);
  if (!line) throw new Error("trainer_line_unverified");
  await requireOpeningAccess(input.user, line);
  const resumeSessionId = text(input.resumeSessionId);
  const client = requireServiceClient();
  if (resumeSessionId) {
    const resumed = await client
      .from("blundr_trainer_sessions_v2")
      .select(
        "session_id,user_id,opening_id,line_id,line_fingerprint,current_cursor,state,state_version,terminal_completion_id",
      )
      .eq("session_id", resumeSessionId)
      .eq("user_id", input.user.userId)
      .maybeSingle();
    if (resumed.error) dbUnavailable();
    if (resumed.data) {
      if (
        resumed.data.opening_id !== line.openingId ||
        resumed.data.line_id !== line.lineId ||
        resumed.data.line_fingerprint !== line.lineDigest
      )
        throw new Error("trainer_session_resume_conflict");
      return publicSession(resumed.data, line);
    }
  }
  const serverSessionSeed = randomUUID();
  const sqlSessionId = `trainer-session:${createHash("sha256")
    .update(
      `${input.user.userId}:${line.lineId}:${line.lineDigest}:${serverSessionSeed}`,
    )
    .digest("hex")}`;
  const result = await client.rpc("blundr_reserve_trainer_session_v2", {
    p_user_id: input.user.userId,
    p_reservation: {
      session_id: sqlSessionId,
      server_session_seed: serverSessionSeed,
      line_id: line.lineId,
      line_fingerprint: line.lineDigest,
      canonical_line: line.targets,
    },
  });
  if (result.error || !result.data) dbUnavailable();
  return publicSession(result.data, line);
}

function publicSession(
  row: any,
  fallback?: VerifiedTrainerRuntimeLine,
): TrainerSessionPublic {
  const action = row.current_action ?? row.action;
  const sessionId = text(row.session_id ?? row.sessionId);
  const version = Number(row.version ?? row.session_version ?? 0);
  const cursor = Number(row.cursor ?? row.current_cursor ?? 0);
  const target = fallback?.targets[cursor];
  const actionId =
    text(action?.action_id ?? action?.actionId) ||
    (sessionId && target
      ? createDeterministicIdentity("trainer-action", [
          sessionId,
          target.target_id,
          String(version),
        ])
      : "");
  if (!sessionId || !actionId)
    throw new Error("trainer_session_invalid_response");
  return {
    sessionId,
    version,
    openingId: text(row.opening_id ?? row.openingId ?? fallback?.openingId),
    lineId: text(row.line_id ?? row.lineId ?? fallback?.lineId),
    lineKey: text(row.line_key ?? row.lineKey ?? fallback?.lineKey),
    actionId,
    terminal: Boolean(
      row.terminal ?? row.is_terminal ?? row.state === "completed",
    ),
    terminalCompletionId:
      text(row.terminal_completion_id ?? row.terminalCompletionId) || null,
  };
}

function resolveAuthoritativeTarget(
  line: VerifiedTrainerRuntimeLine,
  cursor: number,
) {
  if (!Number.isInteger(cursor) || cursor < 0 || cursor >= line.targets.length)
    throw new Error("trainer_action_stale_or_unverified");
  return line.targets[cursor];
}

/**
 * The action RPC owns cursor advancement and calls the v2 projector inside its
 * transaction. This service only provides server-derived event material.
 */
export async function commitTrainerAction(input: {
  user: CurrentBlundrUser;
  sessionId: unknown;
  actionId: unknown;
  expectedVersion: unknown;
  type: unknown;
  playedMoveUci?: unknown;
}): Promise<unknown> {
  const sessionId = text(input.sessionId);
  const actionId = text(input.actionId);
  const expectedVersion = Number(input.expectedVersion);
  if (
    !sessionId ||
    !actionId ||
    !Number.isInteger(expectedVersion) ||
    expectedVersion < 0
  )
    throw new Error("trainer_action_invalid");
  const client = requireServiceClient();
  const loaded = await client
    .from("blundr_trainer_sessions_v2")
    .select(
      "session_id,user_id,opening_id,line_id,line_fingerprint,current_cursor,state,state_version,terminal_completion_id",
    )
    .eq("session_id", sessionId)
    .eq("user_id", input.user.userId)
    .maybeSingle();
  if (loaded.error || !loaded.data)
    throw new Error("trainer_session_not_found");
  const row = loaded.data;
  if (text(row.user_id) && text(row.user_id) !== input.user.userId)
    throw new Error("trainer_session_forbidden");
  const line = await resolveVerifiedTrainerRuntimeLine({
    openingId: row.opening_id,
    lineId: row.line_id,
  });
  if (!line || text(row.line_fingerprint) !== line.lineDigest)
    throw new Error("trainer_session_stale_or_unverified");
  const prior = await client
    .from("blundr_trainer_actions_v2")
    .select("request_fingerprint,target_id,learning_event_id,projection")
    .eq("user_id", input.user.userId)
    .eq("session_id", sessionId)
    .eq("request_id", actionId)
    .maybeSingle();
  if (prior.error) throw new Error("trainer_action_persistence_unavailable");
  if (prior.data) {
    const priorFingerprint = trainerRequestFingerprint({
      userId: input.user.userId,
      sessionId,
      actionId,
      expectedVersion,
      type: input.type,
      playedMoveUci: input.playedMoveUci,
      targetId: prior.data.target_id,
    });
    if (priorFingerprint !== prior.data.request_fingerprint)
      throw new Error("trainer_action_idempotency_conflict");
    const terminal = row.state === "completed";
    const nextTarget = terminal
      ? null
      : line.targets[Number(row.current_cursor)];
    return {
      status: "duplicate",
      eventId: prior.data.learning_event_id,
      projection: prior.data.projection,
      version: Number(row.state_version),
      terminal,
      actionId: nextTarget
        ? createDeterministicIdentity("trainer-action", [
            sessionId,
            nextTarget.target_id,
            String(row.state_version),
          ])
        : null,
      terminalCompletionId: text(row.terminal_completion_id) || null,
    };
  }
  const cursor = Number(row.current_cursor);
  const target = resolveAuthoritativeTarget(line, cursor);
  const serverActionId = createDeterministicIdentity("trainer-action", [
    sessionId,
    target.target_id,
    String(row.state_version),
  ]);
  if (serverActionId !== actionId)
    throw new Error("trainer_action_not_current");
  const authority = resolveLearningAttemptAuthority({
    expectedMoveUci: target.expected_move_uci,
    playedMoveUci: input.playedMoveUci,
    requestedType: input.type,
    serverNow: new Date().toISOString(),
  });
  if ("error" in authority) throw new Error(authority.error);
  const access = await requireOpeningAccess(input.user, line);
  const position = createPositionIdentity({
    canonicalFen: target.canonical_fen,
    openingId: line.openingId,
    expectedMoveUci: target.expected_move_uci,
    repertoireSide: line.userColor === "b" ? "black" : "white",
    moveOrderKey: target.move_order_key,
  });
  const attemptId = createDeterministicIdentity("trainer-action", [
    sessionId,
    actionId,
  ]);
  const prepared = await prepareLearningEventV2({
    userId: input.user.userId,
    sessionId,
    attemptId,
    source: "train",
    taxonomy: authority.taxonomy,
    position,
    correct: authority.correct,
    now: authority.occurredAt,
    access,
    playedMoveUci:
      authority.taxonomy === "cue_revealed" ? null : text(input.playedMoveUci),
    reviewEvidence: {
      evidenceType: authority.taxonomy === "cue_revealed" ? "reveal" : "answer",
      hinted: authority.taxonomy === "cue_revealed",
      elapsedMs: null,
      retry: false,
    },
  });
  const requestFingerprint = trainerRequestFingerprint({
    userId: input.user.userId,
    sessionId,
    actionId,
    expectedVersion,
    type: input.type,
    playedMoveUci: input.playedMoveUci,
    targetId: target.target_id,
  });
  const result = await client.rpc("blundr_commit_trainer_action_v2", {
    p_user_id: input.user.userId,
    p_session_id: sessionId,
    p_action: {
      request_id: actionId,
      request_fingerprint: requestFingerprint,
      target_id: target.target_id,
      target_fingerprint: target.target_fingerprint,
      cursor,
      expected_version: expectedVersion,
      learning_event: prepared.event,
    },
  });
  if (result.error) throw new Error("trainer_action_persistence_unavailable");
  const data = result.data as Record<string, unknown> | null;
  if (!data) throw new Error("trainer_action_persistence_unavailable");
  const nextCursor = Number(data.cursor);
  const nextVersion = Number(data.version);
  const terminal = data.state === "completed";
  const nextTarget = terminal ? null : line.targets[nextCursor];
  if (!terminal && (!nextTarget || !Number.isInteger(nextVersion)))
    throw new Error("trainer_action_invalid_response");
  return {
    status: data.status,
    eventId: data.eventId,
    projection: data.projection,
    version: nextVersion,
    terminal,
    actionId: nextTarget
      ? createDeterministicIdentity("trainer-action", [
          sessionId,
          nextTarget.target_id,
          String(nextVersion),
        ])
      : null,
    terminalCompletionId:
      typeof data.terminalCompletionId === "string"
        ? data.terminalCompletionId
        : null,
  };
}
