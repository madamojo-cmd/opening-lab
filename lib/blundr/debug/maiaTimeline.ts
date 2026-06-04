export type MaiaTimelineEvent = {
  id: string;
  at: number;
  event: string;
  status?: string;
  label?: string;
  message?: string;
  reason?: string | null;
  details?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  fen4?: string | null;
  moveUci?: string | null;
  moveSan?: string | null;
  source?: string | null;
  [key: string]: unknown;
};

export type CreateMaiaTimelineEventInput = {
  id?: string | number;
  event: string;
  status?: string;
  label?: string;
  message?: string;
  reason?: string | null;
  details?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  fen4?: string | null;
  moveUci?: string | null;
  moveSan?: string | null;
  source?: string | null;
  [key: string]: unknown;
};

function createTimelineId(event: string): string {
  return `${event}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createMaiaTimelineEvent(
  input: CreateMaiaTimelineEventInput
): MaiaTimelineEvent {
  const { id, ...rest } = input;

  return {
    ...rest,
    id: String(id ?? createTimelineId(input.event)),
    at: Date.now(),
  };
}

export function appendMaiaTimeline(
  timeline: MaiaTimelineEvent[] | null | undefined,
  event: MaiaTimelineEvent,
  maxEvents = 75
): MaiaTimelineEvent[] {
  const next = [...(timeline ?? []), event];
  return next.slice(-Math.max(1, maxEvents));
}
