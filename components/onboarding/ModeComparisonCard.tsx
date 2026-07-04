"use client";

import type { ReactNode } from "react";

type ModeComparisonCardProps = {
  title: string;
  rows: Array<{
    label: string;
    description: string;
    accent?: "green" | "stone";
    icon?: ReactNode;
  }>;
};

export function ModeComparisonCard({ title, rows }: ModeComparisonCardProps) {
  return (
    <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-black uppercase tracking-[0.18em] text-green-700">{title}</div>
      <div className="mt-3 grid gap-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className={`rounded-2xl border p-3 ${row.accent === "green" ? "border-green-100 bg-green-50/70" : "border-stone-200 bg-stone-50"}`}
          >
            <div className="text-sm font-black text-stone-950">{row.label}</div>
            <div className="mt-1 text-sm leading-6 text-stone-600">{row.description}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

