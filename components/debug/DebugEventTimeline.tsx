"use client";

import type { ReactElement } from "react";
import type { DebugEvent } from "@/lib/blundr/debug/trainerDebugTypes";

export function DebugEventTimeline({ events }: { events: DebugEvent[] }): ReactElement {
  return (
    <div className="max-h-72 space-y-2 overflow-auto">
      {events.length === 0 && <div className="text-stone-400">No debug events recorded yet.</div>}
      {events.slice().reverse().map((event) => {
        const isOfficial = (event as any).isOfficialInstructional || (event as any).entryKind === "instructional";
        const isLocked = (event as any).isLockedTarget || (event as any).lockedContinuation;
        return (
          <div key={event.id} className={`rounded-xl p-2 ${isOfficial ? "bg-green-900/30 border border-green-700/50" : "bg-black/40"}`}>
            <div className="flex items-center justify-between gap-2 text-[10px] font-black text-stone-300">
              <span>
                {event.type}
                {isOfficial && " • OFFICIAL INSTRUCTIONAL"}
                {isLocked && " • LOCKED"}
              </span>
              <span>{new Date(event.ts).toLocaleTimeString()}</span>
            </div>
            <div className="mt-1 text-[10px] text-stone-400">{event.action ?? event.normalizedAction ?? event.reason ?? ""}</div>
            {(event as any).instructionFrameKey && (
              <div className="mt-0.5 text-[9px] text-stone-500 font-mono truncate">frameKey: {(event as any).instructionFrameKey}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
