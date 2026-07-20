export function resolveLearningEventAttemptId(
  body: { eventId?: unknown; id?: unknown } | null | undefined,
): string | null {
  const eventId = String(body?.eventId ?? body?.id ?? "").trim();
  return eventId || null;
}
