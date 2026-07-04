"use client";

import { CheckCircle2, Play } from "lucide-react";
import type { ReactNode } from "react";
import { OnboardingButtonRow } from "./OnboardingButtonRow";
import { OnboardingShell } from "./OnboardingShell";
import { ONBOARDING_COPY } from "@/lib/blundr/onboarding/onboardingCopy";

type OnboardingStartTrainingScreenProps = {
  stepIndex: number;
  stepCount: number;
  onBack: () => void;
  onStartTraining: () => void;
  summary?: ReactNode;
};

export function OnboardingStartTrainingScreen({ stepIndex, stepCount, onBack, onStartTraining, summary }: OnboardingStartTrainingScreenProps) {
  return (
    <OnboardingShell
      title={ONBOARDING_COPY.start_training.title}
      copy={ONBOARDING_COPY.start_training.copy}
      tempoCopy={ONBOARDING_COPY.start_training.tempoCopy}
      stepIndex={stepIndex}
      stepCount={stepCount}
      onBack={onBack}
      footer={<OnboardingButtonRow primaryLabel="Start Training" onPrimary={onStartTraining} primaryTone="green" />}
    >
      <div className="rounded-[1.75rem] border border-green-100 bg-[linear-gradient(180deg,_rgba(255,255,255,1),_rgba(236,246,226,0.85))] p-4">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-green-700">
          <CheckCircle2 size={14} />
          Ready
        </div>
        <p className="mt-2 text-sm leading-6 text-stone-700">
          Start training with your starter pack and begin building your first Daily BLUNDR habit.
        </p>
        {summary ? <div className="mt-4">{summary}</div> : null}
      </div>
      <div className="flex items-center gap-2 rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
        <Play size={16} className="text-green-700" />
        The first selected White opening will open after completion if route support is available.
      </div>
    </OnboardingShell>
  );
}

