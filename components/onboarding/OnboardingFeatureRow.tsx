"use client";

import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";

type OnboardingFeatureRowProps = {
  label: string;
  description: string;
  icon?: ReactNode;
  className?: string;
};

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function OnboardingFeatureRow({ label, description, icon, className }: OnboardingFeatureRowProps) {
  return (
    <div className={classNames("flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm", className)}>
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700">
        {icon ?? <CheckCircle2 size={16} />}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-black text-stone-950">{label}</div>
        <div className="mt-1 text-sm leading-6 text-stone-600">{description}</div>
      </div>
    </div>
  );
}

