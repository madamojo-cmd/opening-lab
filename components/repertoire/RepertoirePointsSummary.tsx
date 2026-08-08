"use client";

import type { RepertoireProgress } from "@/lib/blundr/repertoire/repertoireTypes";
import { formatRepertoirePoints } from "@/lib/blundr/presentation/userFacingNumbers";

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
    <div className="rounded-2xl bg-stone-50 px-3 py-3">
      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">{label}</div>
      <div className="mt-1 text-xl font-black tracking-tight text-stone-950">{value}</div>
      <div className="mt-1 text-xs font-semibold text-stone-500">{sub}</div>
    </div>
  );
}

export function RepertoirePointsSummary({ progress, className, compact }: RepertoirePointsSummaryProps) {
  return (
    <section className={classNames("rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Repertoire points</div>
          <div className={classNames("mt-1 font-black tracking-tight text-stone-950", compact ? "text-base" : "text-lg")}>Build your repertoire</div>
        </div>
        <div className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-700">{progress.unlockedOpeningIds.length} unlocked</div>
      </div>
      <div className={classNames("mt-3 grid gap-2", compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4")}>
        <Stat label="Available" value={formatRepertoirePoints(progress.availablePoints)} sub="ready to spend" />
        <Stat label="Lifetime" value={formatRepertoirePoints(progress.lifetimePoints)} sub="all earned" />
        <Stat label="Spent" value={formatRepertoirePoints(progress.spentPoints)} sub="on unlocks" />
        <Stat label="Unlocked" value={progress.unlockedOpeningIds.length} sub="openings ready" />
      </div>
    </section>
  );
}
