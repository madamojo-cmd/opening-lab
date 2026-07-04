"use client";

type OnboardingButtonRowProps = {
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  primaryTone?: "green" | "dark";
  secondaryLabel?: string;
  onSecondary?: () => void;
  secondaryDisabled?: boolean;
  backLabel?: string;
  onBack?: () => void;
  backDisabled?: boolean;
  className?: string;
};

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function OnboardingButtonRow({
  primaryLabel,
  onPrimary,
  primaryDisabled,
  primaryTone = "green",
  secondaryLabel,
  onSecondary,
  secondaryDisabled,
  backLabel = "Back",
  onBack,
  backDisabled,
  className,
}: OnboardingButtonRowProps) {
  return (
    <div className={classNames("flex flex-col gap-2 sm:flex-row sm:items-center", className)}>
      <div className="flex gap-2">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            disabled={backDisabled}
            className="inline-flex flex-1 items-center justify-center rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-black text-stone-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
          >
            {backLabel}
          </button>
        ) : null}
        {secondaryLabel && onSecondary ? (
          <button
            type="button"
            onClick={onSecondary}
            disabled={secondaryDisabled}
            className="inline-flex flex-1 items-center justify-center rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-black text-stone-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
          >
            {secondaryLabel}
          </button>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onPrimary}
        disabled={primaryDisabled}
        className={classNames(
          "inline-flex flex-1 items-center justify-center rounded-2xl px-4 py-3 text-sm font-black shadow-sm disabled:cursor-not-allowed disabled:opacity-60",
          primaryTone === "dark" ? "bg-stone-950 text-white" : "bg-green-700 text-white",
        )}
      >
        {primaryLabel}
      </button>
    </div>
  );
}

