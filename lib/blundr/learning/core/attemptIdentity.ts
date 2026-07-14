import {
  createDeterministicIdentity,
  type AttemptId,
  type EventId,
  type SessionId,
} from "@/lib/blundr/contracts";

export function createAttemptId(
  sessionId: SessionId,
  cardFingerprint: string,
  attemptNumber: number,
): AttemptId {
  return createDeterministicIdentity("attempt", [
    sessionId,
    cardFingerprint,
    attemptNumber,
  ]) as AttemptId;
}

export function createEventId(
  attemptId: AttemptId | null,
  taxonomy: string,
  occurredAt: string,
): EventId {
  return createDeterministicIdentity("event", [
    attemptId ?? "session",
    taxonomy,
    occurredAt,
  ]) as EventId;
}

export function createSessionId(
  userId: string,
  dateKey: string,
  nonce = "primary",
): SessionId {
  return createDeterministicIdentity("session", [
    userId,
    dateKey,
    nonce,
  ]) as SessionId;
}
