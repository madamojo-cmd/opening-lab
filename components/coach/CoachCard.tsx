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
  topRightBadge?: {
    label: string;
    severity: "positive" | "neutral" | "warning" | "danger" | "unknown";
    ariaLabel: string;
  } | null;
};

export function CoachCard({ decision, onAction, replayEnabled = true, surfaceActions, topRightBadge = null }: Props): ReactElement | null {
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
    <div className="rounded-[22px] border border-green-900/10 bg-[linear-gradient(145deg,#185c38_0%,#0f3f28_100%)] p-5 text-white shadow-[0_22px_55px_rgba(24,92,56,0.22)]">
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-green-100">Tempo cue</div>
        {topRightBadge ? (
          <div
            className={
              topRightBadge.severity === "positive"
                ? "rounded-full bg-white/90 px-2 py-1 text-[11px] font-black text-green-900"
                : topRightBadge.severity === "neutral"
                  ? "rounded-full bg-white/20 px-2 py-1 text-[11px] font-black text-white"
                  : topRightBadge.severity === "warning"
                    ? "rounded-full bg-amber-100 px-2 py-1 text-[11px] font-black text-amber-800"
                    : topRightBadge.severity === "danger"
                      ? "rounded-full bg-red-100 px-2 py-1 text-[11px] font-black text-red-800"
                      : "rounded-full bg-stone-100 px-2 py-1 text-[11px] font-black text-stone-700"
            }
            aria-label={topRightBadge.ariaLabel}
            title={topRightBadge.ariaLabel}
          >
            {topRightBadge.label}
          </div>
        ) : null}
      </div>
      <h3 className="mt-3 text-[22px] font-black leading-[1.05] tracking-[-0.04em] text-white">{decision.title ?? "Position context"}</h3>
      <p className="mt-3 text-sm leading-6 text-green-50">{decision.body ?? decision.hint ?? decision.answer ?? ""}</p>
      {shouldUseSurfaceActions && Array.isArray((decision as any).bullets) && (decision as any).bullets.length > 0 ? (
        <ul className="mt-3 list-disc space-y-1 rounded-[16px] border border-white/15 bg-white/10 p-4 pl-8 text-sm text-green-50">
          {(decision as any).bullets.map((bullet: string, index: number) => (
            <li key={`${index}-${bullet}`}>{bullet}</li>
          ))}
        </ul>
      ) : null}
      {showWhy && decision.why ? <p className="mt-3 rounded-2xl bg-white/10 p-3 text-sm text-green-50 ring-1 ring-white/15">{decision.why}</p> : null}
      <div className={`mt-4 ${isBranchSurface ? "grid grid-cols-2 gap-3" : "flex flex-wrap gap-2"}`}>
        {shouldUseSurfaceActions ? surfaceVisibleActions.map((surfaceAction) => {
          const className = `rounded-[13px] px-4 py-3 text-xs font-black ${surfaceAction.enabled ? "bg-white text-green-900" : "bg-white/20 text-white/60"}`;
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
              ? "rounded-2xl bg-white px-4 py-3 font-black text-green-900 shadow-sm"
              : style === "branch_restart"
                ? "rounded-2xl bg-white/15 px-4 py-3 font-black text-white ring-1 ring-white/20"
                : `rounded-full px-3 py-2 text-xs font-black ${disabled ? "bg-white/10 text-white/45" : "bg-white/15 text-white ring-1 ring-white/20"}`;
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
