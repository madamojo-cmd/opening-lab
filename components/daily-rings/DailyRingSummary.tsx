"use client";

import { CheckCircle2, Lock, Sparkles } from "lucide-react";

import { DailyRingMeter } from "./DailyRingMeter";

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

type DailyRingSummaryProps = {
  label: string;
  description: string;
  progress: number;
  goal: number;
  percent: number;
  closed: boolean;
  className?: string;
};

export function DailyRingSummary({ label, description, progress, goal, percent, closed, className }: DailyRingSummaryProps) {
  return (
    <div className={classNames("rounded-3xl border border-stone-200 bg-white p-4 shadow-sm", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-stone-950">
            <Sparkles size={15} className="text-green-700" />
            {label}
          </div>
          <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
        </div>
        <div className={classNames("inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]", closed ? "bg-green-50 text-green-700" : "bg-stone-100 text-stone-500")}>
          {closed ? <CheckCircle2 size={13} /> : <Lock size={13} />}
          {closed ? "Closed" : "Locked"}
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <div className="text-2xl font-black tracking-tight text-stone-950">
            {progress} / {goal}
          </div>
          <div className="text-xs font-semibold text-stone-500">{closed ? "Ring complete for today." : "Keep going to close this ring."}</div>
        </div>
        <div className="min-w-[96px]">
          <DailyRingMeter percent={percent} closed={closed} />
        </div>
      </div>
    </div>
  );
}
