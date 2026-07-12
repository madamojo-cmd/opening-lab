"use client";

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

type DailyRingMeterProps = {
  percent: number;
  closed: boolean;
  className?: string;
};

export function DailyRingMeter({ percent, closed, className }: DailyRingMeterProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent || 0)));
  return (
    <div className={classNames("space-y-2", className)}>
      <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">
        <span>{closed ? "Closed" : "Open"}</span>
        <span>{clamped}%</span>
      </div>
      <div className={classNames("h-2 overflow-hidden rounded-full bg-stone-100 ring-1 ring-stone-200", closed ? "shadow-[0_0_0_1px_rgba(61,186,110,0.12)]" : "")}>
        <div
          className={classNames(
            "h-full rounded-full transition-[width,box-shadow,opacity] duration-500 ease-out",
            closed ? "bg-green-700 shadow-[0_0_14px_rgba(61,186,110,0.28)]" : "bg-green-500",
          )}
          style={{ width: `${clamped}%`, opacity: clamped > 0 ? 1 : 0.45 }}
          aria-hidden
        />
      </div>
    </div>
  );
}
