import type { OnboardingStepId } from "./onboardingTypes";

export type OnboardingStepDefinition = {
  id: OnboardingStepId;
  label: string;
  shortLabel: string;
  description: string;
};

export const ONBOARDING_STEP_SEQUENCE = [
  "welcome",
  "account",
  "rating",
  "starter_pack",
  "daily_goals",
  "real_game_data",
  "opening_continuation",
  "training_modes",
  "start_training",
] as const satisfies readonly OnboardingStepId[];

export const ONBOARDING_STEPS: readonly OnboardingStepDefinition[] = [
  {
    id: "welcome",
    label: "Welcome",
    shortLabel: "Welcome",
    description: "Introductory overview and first click into onboarding.",
  },
  {
    id: "account",
    label: "Account / Save Progress",
    shortLabel: "Account",
    description: "Choose local demo or email/password sign-in.",
  },
  {
    id: "rating",
    label: "Rating Level",
    shortLabel: "Rating",
    description: "Pick the rating band Blundr should train for.",
  },
  {
    id: "starter_pack",
    label: "Starter Pack",
    shortLabel: "Pack",
    description: "Select one starter repertoire pack.",
  },
  {
    id: "daily_goals",
    label: "Daily Goals",
    shortLabel: "Goals",
    description: "Choose your daily tempo, battery, and Daily Blundr targets.",
  },
  {
    id: "real_game_data",
    label: "Real-Game Data",
    shortLabel: "Real Data",
    description: "Explain how opponent data shapes the training pool.",
  },
  {
    id: "opening_continuation",
    label: "Opening + Continuation",
    shortLabel: "Stages",
    description: "Show the opening line and the playable continuation stage.",
  },
  {
    id: "training_modes",
    label: "Assisted + Plain + Daily Blundr",
    shortLabel: "Modes",
    description: "Explain guidance, recall, and adaptive reviews.",
  },
  {
    id: "start_training",
    label: "Start Training",
    shortLabel: "Start",
    description: "Complete setup and begin training.",
  },
] as const;

function normalizeStepIndex(index: number): number {
  if (index < 0) return 0;
  if (index >= ONBOARDING_STEP_SEQUENCE.length) return ONBOARDING_STEP_SEQUENCE.length - 1;
  return index;
}

export function normalizeOnboardingStepId(value: unknown): OnboardingStepId {
  const text = String(value ?? "").trim();
  return (ONBOARDING_STEP_SEQUENCE.includes(text as OnboardingStepId) ? (text as OnboardingStepId) : ONBOARDING_STEP_SEQUENCE[0]) as OnboardingStepId;
}

export function getOnboardingStepIndex(stepId: OnboardingStepId): number {
  return normalizeStepIndex(ONBOARDING_STEP_SEQUENCE.indexOf(stepId));
}

export function getOnboardingStepById(stepId: OnboardingStepId): OnboardingStepDefinition | null {
  return ONBOARDING_STEPS.find((step) => step.id === stepId) ?? null;
}

export function getNextOnboardingStepId(stepId: OnboardingStepId): OnboardingStepId {
  const index = getOnboardingStepIndex(stepId);
  return ONBOARDING_STEP_SEQUENCE[normalizeStepIndex(index + 1)];
}

export function getPreviousOnboardingStepId(stepId: OnboardingStepId): OnboardingStepId {
  const index = getOnboardingStepIndex(stepId);
  return ONBOARDING_STEP_SEQUENCE[normalizeStepIndex(index - 1)];
}

export function isFinalOnboardingStep(stepId: OnboardingStepId): boolean {
  return stepId === ONBOARDING_STEP_SEQUENCE[ONBOARDING_STEP_SEQUENCE.length - 1];
}

export function getOnboardingStepCount(): number {
  return ONBOARDING_STEP_SEQUENCE.length;
}
