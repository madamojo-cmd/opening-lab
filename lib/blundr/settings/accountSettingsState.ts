import { createDefaultBoardPreferences, readLocalBoardPreferences, type BlundrBoardPreferences } from "../board/boardPreferenceService";
import { isClientDevToolsEnabled } from "../backend/clientEnv";
import { createBlundrSupabaseBrowserClient } from "../backend/supabaseBrowserClient";
import type { BlundrAccountMode, CurrentBlundrUser, UserTrainingProfile } from "../accounts/accountTypes";
import { getLocalAccountCurrentUserId, getLocalTrainingProfile, readLocalAccountBundle, setLocalAccountCurrentUserId } from "../accounts/localAccountStorage";
import { createDefaultTrainingProfile, createLocalDemoUser } from "../accounts/accountDefaults";
import { BLUNDR_LOCAL_DEMO_USER_ID } from "../persistence/persistenceKeys";
import type { OnboardingAuthSession } from "../onboarding/onboardingTypes";

export type BlundrSettingsAccountSnapshot = {
  user: CurrentBlundrUser;
  profile: UserTrainingProfile;
  boardPreferences: BlundrBoardPreferences;
  authAvailable: boolean;
  email: string | null;
  isAuthenticated: boolean;
  isLocalDemo: boolean;
  accountStatusLabel: string;
  currentUserId: string;
  dailyGoalSummary: string;
  devToolsEnabled: boolean;
};

export type BlundrSettingsLogoutResult = {
  ok: boolean;
  switchedToLocalDemo: boolean;
  message: string;
};

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function buildModeFromSession(session: OnboardingAuthSession | null | undefined): BlundrAccountMode {
  return session ? "authenticated" : "local_demo";
}

function buildCurrentUser(session: OnboardingAuthSession | null | undefined, userId: string): CurrentBlundrUser {
  if (!session) {
    return {
      ...createLocalDemoUser(),
      userId,
    };
  }
  return {
    userId: normalizeText(session.userId) || userId,
    email: normalizeText(session.email) || null,
    mode: "authenticated",
    isAuthenticated: true,
    isAdmin: false,
    accessToken: session.accessToken ?? null,
    provider: "supabase",
  };
}

export function buildAccountSettingsSnapshot(input: {
  authSession?: OnboardingAuthSession | null;
  storage?: Storage | null;
} = {}): BlundrSettingsAccountSnapshot {
  const bundle = readLocalAccountBundle();
  const currentUserId = getLocalAccountCurrentUserId();
  const session = input.authSession ?? null;
  const userId = normalizeText(session?.userId) || normalizeText(bundle.currentUserId) || currentUserId;
  const profile = getLocalTrainingProfile(userId) ?? createDefaultTrainingProfile(userId);
  const boardPreferences = readLocalBoardPreferences(input.storage ?? null) ?? createDefaultBoardPreferences();
  const user = buildCurrentUser(session, userId);
  return {
    user,
    profile,
    boardPreferences,
    authAvailable: Boolean(session),
    email: session?.email ? normalizeText(session.email) : user.email ?? null,
    isAuthenticated: Boolean(session),
    isLocalDemo: !session,
    accountStatusLabel: session?.email ? `Signed in as ${session.email}` : "Local demo on this device",
    currentUserId: userId,
    dailyGoalSummary: `${profile.dailyTempoGoal} Tempo, ${profile.dailyBatteryGoal} Battery, ${profile.dailyBlundrGoal} Daily Blundr, ${profile.dailyBlundrCardGoal} Blundr cards`,
    devToolsEnabled: isClientDevToolsEnabled(),
  };
}

export async function loadBlundrSettingsAuthSession(): Promise<OnboardingAuthSession | null> {
  try {
    const { getOnboardingAuthSession } = await import("../onboarding/onboardingAuth");
    return getOnboardingAuthSession();
  } catch {
    return null;
  }
}

export async function signOutBlundrAccount(): Promise<BlundrSettingsLogoutResult> {
  const client = createBlundrSupabaseBrowserClient();
  let message = "Signed out.";
  let switchedToLocalDemo = false;

  if (client) {
    try {
      const result = await client.auth.signOut();
      if (result.error) {
        message = result.error.message || message;
      } else {
        switchedToLocalDemo = true;
      }
    } catch {
      message = "Sign-out failed. Tempo kept local demo available.";
    }
  } else {
    message = "Local demo is already active.";
    switchedToLocalDemo = true;
  }

  try {
    setLocalAccountCurrentUserId(BLUNDR_LOCAL_DEMO_USER_ID);
  } catch {
    // Local account state is best-effort only.
  }

  return {
    ok: true,
    switchedToLocalDemo,
    message,
  };
}
