"use client";

import type { RepertoireProgress } from "@/lib/blundr/repertoire/repertoireTypes";
import { clampProgressPercentage, formatProgressPercentage, formatRepertoirePoints } from "@/lib/blundr/presentation/userFacingNumbers";

type RepertoireUnlockProgressProps = {
  progress: RepertoireProgress;
  className?: string;
};

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function RepertoireUnlockProgress({ progress, className }: RepertoireUnlockProgressProps) {
  const hasLocked = progress.lockedOpeningIds.length > 0;
  const pct = clampProgressPercentage(progress.nextUnlockProgressPct);
  const displayPct = formatProgressPercentage(pct);
  const nextCost = hasLocked ? progress.nextUnlockCost : 0;
  const label = hasLocked
    ? `${formatRepertoirePoints(progress.availablePoints)} / ${formatRepertoirePoints(nextCost)} points toward the next unlock`
    : "All eligible openings are unlocked.";

  return (
    <section className={classNames("rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm", className)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Next unlock</div>
          <div className="mt-1 text-sm font-black text-stone-950">{label}</div>
        </div>
        <div className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-600">{displayPct}</div>
      </div>
      <div className="mt-3 h-3 rounded-full bg-stone-100">
        <div className="h-3 rounded-full bg-green-700 transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs font-semibold text-stone-500">
        <span>{hasLocked ? "Keep training to unlock the next opening." : "No locked openings remain in the MVP pool."}</span>
        <span>{nextCost > 0 ? `${formatRepertoirePoints(nextCost)} points` : "Ready"}</span>
      </div>
    </section>
  );
}
