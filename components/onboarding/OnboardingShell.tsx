"use client";

import type { ReactNode } from "react";
import { OnboardingHeader } from "./OnboardingHeader";
import { OnboardingProgress } from "./OnboardingProgress";
import { TempoCallout } from "./TempoCallout";

type OnboardingShellProps = {
  title: string;
  copy: string;
  tempoCopy: string;
  stepIndex: number;
  stepCount: number;
  onBack?: () => void;
  backLabel?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function OnboardingShell({ title, copy, tempoCopy, stepIndex, stepCount, onBack, backLabel, children, footer }: OnboardingShellProps) {
  return (
    <main className="min-h-screen bg-[#f7f7f4] text-stone-950">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 pb-10 pt-5">
        <div className="rounded-[2rem] bg-white/80 p-4 shadow-sm ring-1 ring-stone-200 backdrop-blur">
          <OnboardingProgress currentStep={stepIndex} stepCount={stepCount} />
        </div>

        <div className="mt-4 space-y-4 rounded-[2rem] bg-white p-4 shadow-sm ring-1 ring-stone-200">
          <OnboardingHeader title={title} copy={copy} onBack={onBack} backLabel={backLabel}>
            <TempoCallout copy={tempoCopy} />
          </OnboardingHeader>
          <div className="space-y-4">{children}</div>
          {footer ? <div className="pt-1">{footer}</div> : null}
        </div>
      </div>
    </main>
  );
}

