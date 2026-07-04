"use client";

import { ArrowRight, BookOpen, Users, Target } from "lucide-react";
import { OnboardingButtonRow } from "./OnboardingButtonRow";
import { OnboardingFeatureRow } from "./OnboardingFeatureRow";
import { OnboardingShell } from "./OnboardingShell";
import { ONBOARDING_COPY, ONBOARDING_FEATURE_ROWS } from "@/lib/blundr/onboarding/onboardingCopy";

type WelcomeOnboardingScreenProps = {
  stepIndex: number;
  stepCount: number;
  onNext: () => void;
};

export function WelcomeOnboardingScreen({ stepIndex, stepCount, onNext }: WelcomeOnboardingScreenProps) {
  return (
    <OnboardingShell
      title={ONBOARDING_COPY.welcome.title}
      copy={ONBOARDING_COPY.welcome.copy}
      tempoCopy={ONBOARDING_COPY.welcome.tempoCopy}
      stepIndex={stepIndex}
      stepCount={stepCount}
      footer={<OnboardingButtonRow primaryLabel="Get Started" onPrimary={onNext} primaryTone="green" />}
    >
      <div className="grid gap-3">
        <OnboardingFeatureRow label={ONBOARDING_FEATURE_ROWS[0].label} description={ONBOARDING_FEATURE_ROWS[0].description} icon={<Users size={16} />} />
        <OnboardingFeatureRow label={ONBOARDING_FEATURE_ROWS[1].label} description={ONBOARDING_FEATURE_ROWS[1].description} icon={<BookOpen size={16} />} />
        <OnboardingFeatureRow label={ONBOARDING_FEATURE_ROWS[2].label} description={ONBOARDING_FEATURE_ROWS[2].description} icon={<Target size={16} />} />
      </div>
      <div className="rounded-[1.75rem] border border-green-100 bg-[linear-gradient(180deg,_rgba(255,255,255,1),_rgba(239,246,228,0.8))] p-4">
        <div className="text-sm font-black uppercase tracking-[0.18em] text-green-700">Tempo says</div>
        <p className="mt-2 text-sm leading-6 text-stone-700">{ONBOARDING_COPY.welcome.tempoCopy}</p>
      </div>
      <div className="flex items-center gap-2 rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
        <ArrowRight size={16} className="text-green-700" />
        Real opening lines, opponent ideas, and short reviews are all part of the same loop.
      </div>
    </OnboardingShell>
  );
}

