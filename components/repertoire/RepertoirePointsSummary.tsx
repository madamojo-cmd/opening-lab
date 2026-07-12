"use client";

import type { RepertoireProgress } from "@/lib/blundr/repertoire/repertoireTypes";

type RepertoirePointsSummaryProps = {
  progress: RepertoireProgress;
  className?: string;
  compact?: boolean;
};

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div className="flex flex-col items-center border-r border-stone-100 px-2 py-4 last:border-r-0">
      <div className="text-2xl font-extrabold leading-none text-stone-950">{value}</div>
      <div className="mt-1 text-[11px] font-semibold text-stone-700">{label}</div>
      <div className="mt-0.5 text-[10px] text-stone-400">{sub}</div>
    </div>
  );
}

export function RepertoirePointsSummary({ progress, className, compact }: RepertoirePointsSummaryProps) {
  return (
    <section className={classNames("overflow-hidden rounded-[1.25rem] border border-stone-200 bg-white shadow-sm", className)}>
      <div className="flex items-start justify-between gap-3 p-4 pb-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2e6b4f]">Repertoire points</div>
          <div className={classNames("mt-1 font-bold text-stone-950", compact ? "text-base" : "text-lg")}>Build your repertoire</div>
        </div>
        <div className="rounded-full bg-[#ebf5ef] px-3 py-1 text-xs font-semibold text-[#2e6b4f]">{progress.unlockedOpeningIds.length} unlocked</div>
      </div>
      <div className={classNames("grid border-t border-stone-100", compact ? "grid-cols-2" : "grid-cols-4")}>
        <Stat label="Available" value={progress.availablePoints} sub="ready" />
        <Stat label="Lifetime" value={progress.lifetimePoints} sub="earned" />
        <Stat label="Spent" value={progress.spentPoints} sub="unlocks" />
        <Stat label="Unlocked" value={progress.unlockedOpeningIds.length} sub="openings" />
      </div>
    </section>
  );
}
