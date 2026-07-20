import {
  normalizeRepertoirePointEvent,
  normalizeRepertoireUnlockEvent,
} from "./repertoireEvents";

export function validateOwnedProgressEvents(
  userId: string,
  rawPointEvents: unknown[],
  rawUnlockEvents: unknown[],
) {
  const pointEvents = rawPointEvents.map(normalizeRepertoirePointEvent);
  const unlockEvents = rawUnlockEvents.map(normalizeRepertoireUnlockEvent);
  if (
    pointEvents.some((event) => !event) ||
    unlockEvents.some((event) => !event)
  ) {
    return { ok: false as const, code: "invalid_progress_event" as const };
  }
  if (
    pointEvents.some((event) => event?.userId !== userId) ||
    unlockEvents.some((event) => event?.userId !== userId)
  ) {
    return { ok: false as const, code: "user_mismatch" as const };
  }
  return {
    ok: true as const,
    pointEvents: pointEvents.filter(
      (event): event is NonNullable<typeof event> => Boolean(event),
    ),
    unlockEvents: unlockEvents.filter(
      (event): event is NonNullable<typeof event> => Boolean(event),
    ),
  };
}
