"use client";

type OnboardingProgressProps = {
  currentStep: number;
  stepCount: number;
  className?: string;
};

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function OnboardingProgress({ currentStep, stepCount, className }: OnboardingProgressProps) {
  const clampedCurrent = Math.min(Math.max(1, currentStep), Math.max(1, stepCount));
  const progressPct = Math.round((clampedCurrent / Math.max(1, stepCount)) * 100);

  return (
    <div className={classNames("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.18em] text-stone-500">
        <span>
          Step {clampedCurrent} of {stepCount}
        </span>
        <span>{progressPct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-stone-200">
        <div className="h-full rounded-full bg-green-700 transition-all duration-300" style={{ width: `${progressPct}%` }} />
      </div>
    </div>
  );
}

