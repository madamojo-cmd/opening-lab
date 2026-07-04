"use client";

import { Zap } from "lucide-react";

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

type XpGainPillProps = {
  xp: number;
  className?: string;
};

export function XpGainPill({ xp, className }: XpGainPillProps) {
  const amount = Math.max(0, Math.floor(Number(xp) || 0));
  return (
    <div className={classNames("inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-green-700 ring-1 ring-green-200", className)}>
      <Zap size={13} />
      +{amount} XP
    </div>
  );
}
