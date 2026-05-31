"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import type { CoachDecision, CoachButton } from "@/lib/blundr/coach/coachTypes";

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
        {decision.buttons.map((button) => {
          const disabled = button === "replay" && !replayEnabled;
          const label =
            button === "answer"
              ? "Show answer"
              : button === "show_plan"
                ? "Show plan"
                : button === "show_move"
                  ? "Show move"
                  : button === "continue_from_here"
                    ? "Continue from here"
                    : button === "analyze_idea"
                    ? "Analyze idea"
                    : button === "try_again"
                      ? "Try again"
                      : button === "why"
                        ? "Why"
                        : button[0].toUpperCase() + button.slice(1);
          return (
            <button
              key={button}
              type="button"
              disabled={disabled}
              onClick={() => click(button)}
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
