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
      <div className="h-2 rounded-full bg-stone-100">
        <div className={classNames("h-2 rounded-full transition-all duration-300", closed ? "bg-green-700" : "bg-green-500")} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
