"use client";

import { RewardAnimation } from "./RewardAnimation";

type RewardPointsFloatProps = {
  points: number;
  label?: string;
  className?: string;
};

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function RewardPointsFloat({ points, label = "repertoire points", className }: RewardPointsFloatProps) {
  return (
    <div className={classNames("relative overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white p-3 shadow-sm", className)}>
      <RewardAnimation kind="pointsFloat" ariaLabel="Points gain animation" className="mx-auto" />
      <div className="mt-3 text-center">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Training boost</div>
        <div className="mt-1 text-lg font-black tracking-tight text-stone-950">+{Math.max(0, Number(points) || 0)} {label}</div>
        <p className="mt-1 text-xs leading-5 text-stone-500">Tempo keeps the number dynamic so the animation stays clean.</p>
      </div>
    </div>
  );
}

