"use client";

import { authenticatedApiFetch } from "@/lib/blundr/api/authenticatedApiClient";
import type { LearningEvent } from "@/lib/blundr/learning/learningEvents";

export type AuthoritativeTrainerSession = {
  sessionId: string;
  version: number;
  openingId: string;
  lineId: string;
  lineKey: string;
  actionId: string;
  terminal: boolean;
  terminalCompletionId?: string | null;
};

const TRAINER_SESSION_PREFIX = "blundr.trainer-session.v2:";

export function clearAuthoritativeTrainerSessionResumes(): void {
  try {
    for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(TRAINER_SESSION_PREFIX))
        window.localStorage.removeItem(key);
    }
  } catch {}
}

export async function reserveAuthoritativeTrainerSession(input: {
  openingId: string;
  lineId: string;
}): Promise<AuthoritativeTrainerSession> {
  const storageKey = `${TRAINER_SESSION_PREFIX}${input.openingId}:${input.lineId}`;
  let resumeSessionId: string | null = null;
  try {
    resumeSessionId = window.localStorage.getItem(storageKey);
  } catch {}
  const payload = await authenticatedApiFetch<{
    session: AuthoritativeTrainerSession;
  }>("/api/blundr/trainer/sessions", {
    method: "POST",
    body: JSON.stringify({ ...input, resumeSessionId }),
  });
  try {
    window.localStorage.setItem(storageKey, payload.session.sessionId);
  } catch {}
  return payload.session;
}

export async function commitAuthoritativeTrainerAction(input: {
  session: AuthoritativeTrainerSession;
  event: LearningEvent;
}): Promise<{
  receipt: {
    status: "persisted" | "duplicate";
    response?: { status?: string; eventId?: string };
  };
  session: AuthoritativeTrainerSession;
}> {
  const payload = await authenticatedApiFetch<{
    result: {
      status?: "inserted" | "duplicate";
      eventId?: string;
      version: number;
      terminal: boolean;
      actionId: string | null;
      terminalCompletionId: string | null;
    };
  }>(
    `/api/blundr/trainer/sessions/${encodeURIComponent(input.session.sessionId)}/actions`,
    {
      method: "POST",
      body: JSON.stringify({
        actionId: input.session.actionId,
        expectedVersion: input.session.version,
        type: input.event.type,
        playedMoveUci: input.event.playedMoveUci ?? null,
      }),
    },
  );
  const result = payload.result;
  return {
    receipt: {
      status: result.status === "duplicate" ? "duplicate" : "persisted",
      response: { status: result.status, eventId: result.eventId },
    },
    session: {
      ...input.session,
      version: result.version,
      actionId: result.actionId ?? input.session.actionId,
      terminal: result.terminal,
      terminalCompletionId: result.terminalCompletionId,
    },
  };
}
