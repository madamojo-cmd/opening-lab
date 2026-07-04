"use client";

type TempoMascotProps = {
  className?: string;
};

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function TempoMascot({ className }: TempoMascotProps) {
  return (
    <div
      className={classNames(
        "relative flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.22),_rgba(247,247,244,1)_70%)] ring-1 ring-green-200 shadow-sm",
        className,
      )}
      aria-hidden="true"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-700 text-xs font-black tracking-[0.18em] text-white shadow-sm">
        T
      </div>
      <span className="absolute -bottom-1 -right-1 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-green-700 shadow-sm ring-1 ring-green-100">
        Tempo
      </span>
    </div>
  );
}

