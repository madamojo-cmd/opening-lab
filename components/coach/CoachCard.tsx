"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import type { CoachDecision, CoachButton } from "@/lib/blundr/coach/coachTypes";
import { getVisibleActionLabel, filterToVisibleCoachActions, type VisibleCoachAction } from "@/lib/blundr/presentation/visibleActionPolicy";
import { getBranchTransitionIntent, isBranchTransitionActionSurface, resolveCoachActionStyle } from "@/lib/blundr/presentation/coachActionStylePolicy";

type Props = {
  decision: CoachDecision;
  onAction: (button: CoachButton | string) => void;
  replayEnabled?: boolean;
  surfaceActions?: Array<{
    kind: string;
    label: string;
    enabled: boolean;
    visible: boolean;
  }>;
};

export function CoachCard({ decision, onAction, replayEnabled = true, surfaceActions }: Props): ReactElement | null {
  const [showWhy, setShowWhy] = useState(false);
  if (!decision.shouldShowCoachCard) return null;
  const visibleActions = filterToVisibleCoachActions(decision.buttons as string[]);
  const surfaceVisibleActions = (surfaceActions ?? []).filter((action) => action.visible);
  const shouldUseSurfaceActions = surfaceVisibleActions.length > 0;
  const isBranchSurface = isBranchTransitionActionSurface({
    title: decision.title,
    coachIntent: getBranchTransitionIntent(decision),
    visibleActions: shouldUseSurfaceActions ? surfaceVisibleActions.map((action) => action.kind as VisibleCoachAction) : visibleActions,
  });

  const click = (button: CoachButton | string) => {
    if (button === "why") setShowWhy((prev) => !prev);
    onAction(button);
  };

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-black uppercase tracking-wide text-green-700">Blundr Coach</div>
      <h3 className="mt-1 text-base font-black text-stone-900">{decision.title ?? "Position context"}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-700">{decision.body ?? decision.hint ?? decision.answer ?? ""}</p>
      {shouldUseSurfaceActions && Array.isArray((decision as any).bullets) && (decision as any).bullets.length > 0 ? (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-600">
          {(decision as any).bullets.map((bullet: string, index: number) => (
            <li key={`${index}-${bullet}`}>{bullet}</li>
          ))}
        </ul>
      ) : null}
      {showWhy && decision.why ? <p className="mt-2 rounded-2xl bg-stone-50 p-3 text-sm text-stone-600">{decision.why}</p> : null}
      <div className={`mt-3 ${isBranchSurface ? "grid grid-cols-2 gap-3" : "flex flex-wrap gap-2"}`}>
        {shouldUseSurfaceActions ? surfaceVisibleActions.map((surfaceAction) => {
          const className = `rounded-full px-3 py-2 text-xs font-black ${surfaceAction.enabled ? "bg-stone-100 text-stone-700" : "bg-stone-100 text-stone-400"}`;
          return (
            <button
              key={surfaceAction.kind}
              type="button"
              disabled={!surfaceAction.enabled}
              onClick={() => click(surfaceAction.kind)}
              className={className}
              data-action-id={surfaceAction.kind}
            >
              {surfaceAction.label}
            </button>
          );
        }) : visibleActions.map((visibleAction) => {
          // Only render canonical VisibleCoachAction per v2.7.40 policy. All legacy (answer, show_*, analyze_idea, why, replay, hide, try_again) are quarantined/deleted from non-debug teaching UI.
          const disabled = (visibleAction as any) === "replay" && !replayEnabled; // replay is transitional, not in Visible set but filtered out above anyway
          const label = getVisibleActionLabel(visibleAction);
          const style = resolveCoachActionStyle(visibleAction, isBranchSurface);
          const className =
            style === "branch_continue"
              ? "rounded-2xl bg-green-700 px-4 py-3 font-black text-white shadow-sm"
              : style === "branch_restart"
                ? "rounded-2xl bg-white px-4 py-3 font-black text-green-800 shadow-sm"
                : `rounded-full px-3 py-2 text-xs font-black ${disabled ? "bg-stone-100 text-stone-400" : "bg-stone-100 text-stone-700"}`;
          return (
            <button
              key={visibleAction}
              type="button"
              disabled={disabled}
              onClick={() => click(visibleAction as CoachButton)}
              className={className}
              data-blundr-action-surface={style === "default" ? undefined : "branch-transition"}
              data-blundr-action-style={style === "default" ? undefined : "canonical-green"}
              data-action-id={style === "default" ? undefined : visibleAction}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
