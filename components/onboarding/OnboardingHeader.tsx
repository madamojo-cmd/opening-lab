"use client";

import type { ReactNode } from "react";
import { BookOpen, ChevronLeft } from "lucide-react";

type OnboardingHeaderProps = {
  title: string;
  copy: string;
  eyebrow?: string;
  onBack?: () => void;
  backLabel?: string;
  children?: ReactNode;
};

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function OnboardingHeader({ title, copy, eyebrow = "Blundr onboarding", onBack, backLabel = "Back", children }: OnboardingHeaderProps) {
  return (
    <header className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-green-700">
          <BookOpen size={14} />
          {eyebrow}
        </div>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className={classNames(
              "inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-black text-stone-700 shadow-sm",
            )}
          >
            <ChevronLeft size={14} />
            {backLabel}
          </button>
        ) : null}
      </div>
      <div>
        <h1 className="text-2xl font-black tracking-tight text-stone-950">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">{copy}</p>
      </div>
      {children}
    </header>
  );
}

