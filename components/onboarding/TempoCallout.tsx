"use client";

import type { ReactNode } from "react";
import { TempoMascot } from "./TempoMascot";

type TempoCalloutProps = {
  title?: string;
  copy: string;
  tone?: "default" | "positive" | "neutral";
  className?: string;
  children?: ReactNode;
};

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function TempoCallout({ title = "Tempo", copy, tone = "default", className, children }: TempoCalloutProps) {
  const toneClass =
    tone === "positive"
      ? "border-green-200 bg-green-50/80 text-green-950"
      : tone === "neutral"
        ? "border-stone-200 bg-stone-50 text-stone-950"
        : "border-green-100 bg-[#fbfcf7] text-stone-950";

  return (
    <section className={classNames("rounded-[1.75rem] border p-4 shadow-sm", toneClass, className)}>
      <div className="flex items-start gap-3">
        <TempoMascot className="shrink-0 scale-90" />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">{title}</div>
          <p className="mt-1 text-sm leading-6 text-stone-700">{copy}</p>
          {children ? <div className="mt-3">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}

