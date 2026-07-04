import type { RatingBandId, StarterPackId, UserRepertoire, UserTrainingProfile } from "../accounts/accountTypes";

export type OnboardingStepId =
  | "welcome"
  | "account"
  | "rating"
  | "starter_pack"
  | "daily_goals"
  | "real_game_data"
  | "opening_continuation"
  | "training_modes"
  | "start_training";

export type OnboardingAccountChoice = "account" | "local_demo";

export type OnboardingAuthMode = "sign_in" | "sign_up";

export type DailyGoalPresetId = "light" | "standard" | "serious";

export type OnboardingTrainingModeChoice = "assisted" | "plain";

export type BlundrOnboardingState = {
  stepId: OnboardingStepId;
  completedStepIds: OnboardingStepId[];
  accountChoice: OnboardingAccountChoice;
  authMode?: OnboardingAuthMode;
  authenticatedUserId?: string;
  authenticatedEmail?: string;
  ratingBandId: RatingBandId;
  ratingSource: "manual" | "chesscom" | "lichess" | "default";
  selectedStarterPackId: StarterPackId;
  dailyGoalPresetId: DailyGoalPresetId;
  dailyTempoGoal: number;
  dailyBatteryGoal: number;
  dailyBlundrGoal: number;
  preferredTrainingMode: OnboardingTrainingModeChoice;
  onboardingCompleted: boolean;
  updatedAt: string;
};

export type OnboardingAuthSession = {
  userId: string;
  email: string;
  accessToken: string;
  expiresAt?: string | null;
};

export type OnboardingAuthResult =
  | {
      ok: true;
      userId: string;
      email: string;
      needsEmailConfirmation?: boolean;
      message?: string;
    }
  | {
      ok: false;
      code: string;
      message: string;
    };

export type OnboardingCompletionResult = {
  profile: UserTrainingProfile;
  repertoire: UserRepertoire;
};
