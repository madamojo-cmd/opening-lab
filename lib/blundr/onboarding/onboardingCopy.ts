import type { OnboardingStepId } from "./onboardingTypes";

export type OnboardingCopyBlock = {
  title: string;
  copy: string;
  tempoCopy: string;
};

export type OnboardingFeatureCopy = {
  label: string;
  description: string;
};

export const ONBOARDING_COPY: Record<OnboardingStepId, OnboardingCopyBlock> = {
  welcome: {
    title: "Train openings that actually stick",
    copy: "Learn real opening lines, recognize opponent ideas, continue into the middlegame, and retain them through Daily Blundr.",
    tempoCopy: "I’ll help you build a repertoire one useful day at a time.",
  },
  account: {
    title: "Save your progress",
    copy: "Blundr tracks your repertoire, Daily Blundr reviews, opening progress, and training goals across sessions.",
    tempoCopy: "You can stay local for now, or sign in when you are ready to save progress across devices.",
  },
  rating: {
    title: "What level should Blundr train you for?",
    copy: "Your level helps Blundr show the opponent moves players like you actually make.",
    tempoCopy: "Blundr should feel like it was tuned for the games you actually play.",
  },
  starter_pack: {
    title: "Choose your starter repertoire",
    copy: "Pick one style. You will start with one White opening and one Black opening, then unlock more as you train.",
    tempoCopy: "A focused first pack makes the opening tree easier to remember and easier to use.",
  },
  daily_goals: {
    title: "Set your daily goals",
    copy: "Tempo will size your Daily Tempo, Daily Battery, and Daily Blundr goals around your schedule.",
    tempoCopy: "Small, steady goals are easier to keep than ambitious ones that burn out quickly.",
  },
  real_game_data: {
    title: "Built from real game data",
    copy: "Blundr trains you against the opponent moves players at your level actually make.",
    tempoCopy: "You are not memorizing random lines. You are training against what opponents actually play.",
  },
  opening_continuation: {
    title: "Learn the line. Then play the position.",
    copy: "Opening Stage: Strict book moves, common replies, and opening ideas. Continuation Stage: Play from the final opening position against Tempo and practice the plans that follow.",
    tempoCopy: "Openings create the starting shape. Continuation practice turns that shape into a playable middlegame.",
  },
  training_modes: {
    title: "Train with guidance. Recall without it.",
    copy: "Assisted View: Visual cues before the move. Plain View: No cues - just recall. Daily Blundr: Missed moves and weak ideas return as short adaptive reviews.",
    tempoCopy: "Guidance helps you learn the line. Plain view helps you remember it on your own.",
  },
  start_training: {
    title: "Your repertoire is ready",
    copy: "Start training with your starter pack and begin building your first Daily Blundr habit.",
    tempoCopy: "The first useful day starts now.",
  },
} as const;

export const ONBOARDING_FEATURE_ROWS: readonly OnboardingFeatureCopy[] = [
  {
    label: "Real-game opponent data",
    description: "Train against common replies from the kinds of players you actually face.",
  },
  {
    label: "Opening + Continuation training",
    description: "Learn the book, then keep playing the position after the book ends.",
  },
  {
    label: "Daily Blundr review",
    description: "Missed moves and weak ideas come back as short adaptive reviews.",
  },
] as const;
