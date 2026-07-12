import type { ReactNode } from "react";
import { classNames } from "./utils";

type StatsStripItem = {
  label: string;
  value: string | number;
  helper?: string;
  icon?: ReactNode;
  tone?: "green" | "stone" | "gold";
};

type StatsStripProps = {
  items: readonly StatsStripItem[];
  compact?: boolean;
  className?: string;
};

function getToneClass(tone: StatsStripItem["tone"]): string {
  if (tone === "green") return "bg-[#ebf5ef] text-stone-950 ring-[#cfe6d8]";
  if (tone === "gold") return "bg-[#fbf3e0] text-stone-950 ring-[#ead8ad]";
  return "bg-white text-stone-950 ring-stone-200";
}

export function StatsStrip({ items, compact = false, className }: StatsStripProps) {
  return (
    <div className={classNames("grid gap-2", items.length <= 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4", className)}>
      {items.map((item) => (
        <div
          key={`${item.label}:${item.value}`}
          className={classNames(
            "min-w-0 rounded-2xl px-3 py-3 ring-1",
            getToneClass(item.tone),
            compact && "px-2 py-2",
          )}
        >
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-500">
            {item.icon}
            <span className="truncate">{item.label}</span>
          </div>
          <div className={classNames("mt-1 font-extrabold", compact ? "text-lg" : "text-2xl")}>{item.value}</div>
          {item.helper ? <div className="mt-0.5 truncate text-[11px] font-medium text-stone-500">{item.helper}</div> : null}
        </div>
      ))}
    </div>
  );
}
