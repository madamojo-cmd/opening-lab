import assert from "node:assert/strict";

import { appendDebugEvent, clearDebugEvents, MAX_DEBUG_EVENTS } from "../trainerDebugEventLog";

export function testTrainerDebugEventLog(): void {
  let events = clearDebugEvents();
  for (let i = 0; i < 60; i += 1) {
    events = appendDebugEvent(events, { type: "coach_action_clicked", action: "hint", result: "handled" });
  }
  assert.equal(events.length, MAX_DEBUG_EVENTS);
  assert.equal(events[events.length - 1].type, "coach_action_clicked");
  events = clearDebugEvents();
  assert.equal(events.length, 0);
}
