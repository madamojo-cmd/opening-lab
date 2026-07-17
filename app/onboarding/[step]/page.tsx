import { OnboardingV11Flow } from "@/components/onboarding/OnboardingV11Flow";

export const dynamic = "force-dynamic";

export default async function OnboardingStepPage({ params }: { params: Promise<{ step: string }> }) {
  const { step } = await params;
  return <OnboardingV11Flow requestedStep={step} />;
}
