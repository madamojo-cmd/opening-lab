import type { DebugEvent } from "./trainerDebugTypes";

export const MAX_DEBUG_EVENTS = 50;

export function appendDebugEvent(events: DebugEvent[], event: Omit<DebugEvent, "id" | "ts"> & { id?: number; ts?: number }): DebugEvent[] {
  const nextId = event.id ?? ((events[events.length - 1]?.id ?? 0) + 1);
  const next: DebugEvent = {
    id: nextId,
    ts: event.ts ?? Date.now(),
    ...event,
  };
  return [...events, next].slice(-MAX_DEBUG_EVENTS);
}

export function clearDebugEvents(): DebugEvent[] {
  return [];
}
