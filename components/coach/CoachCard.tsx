"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import type { CoachDecision, CoachButton } from "@/lib/blundr/coach/coachTypes";
import { getVisibleActionLabel, filterToVisibleCoachActions, type VisibleCoachAction } from "@/lib/blundr/presentation/visibleActionPolicy";

type Props = {
  decision: CoachDecision;
  onAction: (button: CoachButton) => void;
  replayEnabled?: boolean;
};

export function CoachCard({ decision, onAction, replayEnabled = true }: Props): ReactElement | null {
  const [showWhy, setShowWhy] = useState(false);
  if (!decision.shouldShowCoachCard) return null;

  const click = (button: CoachButton) => {
    if (button === "why") setShowWhy((prev) => !prev);
    onAction(button);
  };

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-black uppercase tracking-wide text-green-700">Blundr Coach</div>
      <h3 className="mt-1 text-base font-black text-stone-900">{decision.title ?? "Position context"}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-700">{decision.body ?? decision.hint ?? decision.answer ?? ""}</p>
      {showWhy && decision.why ? <p className="mt-2 rounded-2xl bg-stone-50 p-3 text-sm text-stone-600">{decision.why}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {filterToVisibleCoachActions(decision.buttons as string[]).map((visibleAction) => {
          // Only render canonical VisibleCoachAction per v2.7.40 policy. All legacy (answer, show_*, analyze_idea, why, replay, hide, try_again) are quarantined/deleted from non-debug teaching UI.
          const disabled = (visibleAction as any) === "replay" && !replayEnabled; // replay is transitional, not in Visible set but filtered out above anyway
          const label = getVisibleActionLabel(visibleAction);
          return (
            <button
              key={visibleAction}
              type="button"
              disabled={disabled}
              onClick={() => click(visibleAction as CoachButton)}
              className={`rounded-full px-3 py-2 text-xs font-black ${disabled ? "bg-stone-100 text-stone-400" : "bg-stone-100 text-stone-700"}`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
